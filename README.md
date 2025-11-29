# KOTLIN
- Build the app
- Copy the files from /kotlin folder
- Paste in /android/src/main/java/com/<YourApp>
   - Would have to update the imports from both the Copied files
   - `YOUR  SPECIFIC APP PATH`
   - Add `android:extractNativeLibs="true"` to AndroidManifest.xml . On Line `<application/>`
   - Add  ` add(AudioGenPackage())` to MainApplication.kt
- Make a Dir `/assets` and `jniLibs/arm64-v8a` in `/android/src/main/`
- Paste in `/assets` 
   - `autoencoder_model.tflite`
   - `conditioners_float32.tflite`
   - `dit_model.tflite`
   - `libtensortflowlite.so`
   - `spiece.model`
- Paste `audiogen` in `jniLibs/arm64-v8a`
   - Rename it to `libaudiogen.so`


# React Native
- Make a module for Audiogen `AudioGen.ts`
- Use AudioGen to generate music
