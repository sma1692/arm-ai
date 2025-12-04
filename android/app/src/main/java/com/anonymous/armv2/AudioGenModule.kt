package com.anonymous.armv2

import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.*
import java.io.*

class AudioGenModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "AudioGenModule"

  private fun copyAssetOnce(assetName: String, outFile: File) {
    if (outFile.exists()) return
    reactContext.assets.open(assetName).use { input ->
      FileOutputStream(outFile).use { output ->
        input.copyTo(output)
      }
    }
  }

  @ReactMethod
  fun generate(prompt: String, audioLenSec: Int, promise: Promise) {
    try {
      val filesDir = reactContext.filesDir

      // 1) Executable from jniLibs
      val libDir = reactContext.applicationInfo.nativeLibraryDir
      val binaryFile = File(libDir, "libaudiogen.so")

      if (!binaryFile.exists()) {
        promise.reject("AUDIOGEN_MISSING", "Binary not found at ${binaryFile.absolutePath}")
        return
      }

      // 2) Runtime dir
      val workDir = File(filesDir, "audiogen_runtime")
      if (!workDir.exists()) workDir.mkdirs()

      // 3) Copy models
      copyAssetOnce("autoencoder_model.tflite", File(workDir, "autoencoder_model.tflite"))
      copyAssetOnce("conditioners_float32.tflite", File(workDir, "conditioners_float32.tflite"))
      copyAssetOnce("dit_model.tflite", File(workDir, "dit_model.tflite"))
      copyAssetOnce("spiece.model", File(workDir, "spiece.model"))
      copyAssetOnce("libtensorflowlite.so", File(workDir, "libtensorflowlite.so"))

      // ✅ 4) COMMAND WITH -l (THIS IS THE KEY FIX)
      val cmd = listOf(
        binaryFile.absolutePath,
        "-m", workDir.absolutePath,
        "-p", prompt,
        "-t", "4",
        "-l", audioLenSec.toString()   // ✅ THIS CONTROLS DURATION
      )
      android.util.Log.i("AUDIOGEN_CMD", cmd.joinToString(" "))

      val processBuilder = ProcessBuilder(cmd)
        .directory(workDir)
        .redirectErrorStream(true)

      val process = processBuilder.start()
      val stdout = process.inputStream.bufferedReader().readText()
      val exitCode = process.waitFor()

      if (exitCode != 0) {
        promise.reject("AUDIOGEN_ERROR", stdout)
        return
      }

      // 5) Find generated wav
      val producedWav = workDir
        .listFiles { f -> f.extension == "wav" }
        ?.maxByOrNull { it.lastModified() }
        ?: throw Exception("No wav produced\n$stdout")

      // 6) Save to Music/MyApp
      val resolver = reactContext.contentResolver
      val audioCollection =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
          MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        else
          MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

      val values = ContentValues().apply {
        put(MediaStore.Audio.Media.DISPLAY_NAME, producedWav.name)
        put(MediaStore.Audio.Media.MIME_TYPE, "audio/wav")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          put(
            MediaStore.Audio.Media.RELATIVE_PATH,
            Environment.DIRECTORY_MUSIC + "/MyApp"
          )
        }
      }

      val uri = resolver.insert(audioCollection, values)
        ?: throw Exception("Failed to insert into MediaStore")

      resolver.openOutputStream(uri)?.use { out ->
        producedWav.inputStream().use { ins ->
          ins.copyTo(out)
        }
      }

      promise.resolve(uri.toString())

    } catch (e: Exception) {
      promise.reject("AUDIOGEN_EXCEPTION", e.message, e)
    }
  }

}
