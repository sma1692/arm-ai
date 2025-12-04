

# SETUP 
Build and project setup requires custom steps and scripts. 


# Building ARM Compatible LiteRT Stable Audio open small model
   ### Install Python3.10
   - Download and install `pyenv`
   ```
   curl -fsSL https://pyenv.run | bash
   ```
   - Downlaod and install Python3.10

   ```
   pyenv install 3.10
   ```
   - If build is failed while installing
   ```
   sudo apt update

   ```
   ```
   # Core build tools (this is the key missing bit)
   sudo apt install -y build-essential

   # Recommended extra deps for building CPython via pyenv
   sudo apt install -y \
   libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev \
   libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
   libffi-dev liblzma-dev
   ```
   - Now try to install Python3.10 using pyenv
   ```
   pyenv install 3.10
   ```

   - On successful install 
   ```
   pyenv versions
   ```
   ```
   # Output of the above command will be 
   system (set by /home/ubuntu/.pyenv/version)
   3.10.19
   ```
  
   ### Create a workspace 
   - Create a separate directory for all the dependencies and repositories 
   ```
   mkdir <workspace name> 
   cd <workspace name>
   ```
   ```
   export WORKSPACE=$PWD
   ```
   - Switch to Python3.10
   ```
   pyenv local 3.10
   ```
   - Make a python virtual environment
   
   ```
   python3 -m venv .venv
   ```
   - Activate virual environment
   ```
   source .venv/bin/activate
   ```
  
   ### Install CMake
   - CMake is an open-source tool for building software. 

   ```
   sudo apt update
   sudo apt install cmake g++ git
   ```

   - Verify the version you must get version`>=3.28`
   ```
   cmake --version
   ```
   ### Install Bazel
   - Bazel is an open-source build tool which you will use to build LiteRT libraries.
   ```
   cd $WORKSPACE
   export BAZEL_VERSION=8.4.2
   wget https://github.com/bazelbuild/bazel/releases/download/$BAZEL_VERSION/bazel-$BAZEL_VERSION-installer-linux-x86_64.sh
   sudo bash bazel-8.4.2-installer-linux-x86_64.sh
   export PATH="/usr/local/bin:$PATH"
   ```
   - If successful install you would see this 
   ```
   Bazel is now installed!
   ```
   - Check if bazel is successfully installed 
   ```
   bazel --version
   ```

   ### Install Android SDK and NDK
   - To build a native Android application you will need to install the Android SDK:
   ```
   cd $WORKSPACE
   sudo apt install openjdk-21-jdk openjdk-21-jre unzip
   wget https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip
   unzip -o commandlinetools-linux-13114758_latest.zip
   mkdir -p $WORKSPACE/Android/Sdk
   export ANDROID_HOME=$WORKSPACE/Android
   export ANDROID_SDK_HOME=$ANDROID_HOME/Sdk
   $WORKSPACE/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_HOME --install "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```
   - To run the model on Android, install Android Native Development Kit (Android NDK):
   ```
   cd $WORKSPACE
   wget https://dl.google.com/android/repository/android-ndk-r27b-linux.zip
   unzip android-ndk-r27b-linux.zip
   ```
   - Add these to the PATH and set NDK_PATH variable:
   ```
   export NDK_PATH=$WORKSPACE/android-ndk-r27b/
   export ANDROID_NDK_HOME=$NDK_PATH
   export PATH=$NDK_PATH/toolchains/llvm/prebuilt/linux-x86_64/bin/:$PATH
   ```

   ## Download the model
   - Stable Audio Open Small is an open-source model optimized for generating short audio samples, sound effects, and production elements using text prompts.
   ```
   https://huggingface.co/stabilityai/stable-audio-open-small/tree/main
   ```
   - Download the _*model_config.json*__ and __*model.ckpt*__ file to your local system
   ```
   scp <model.ckpt path> <your_ssh>:<path of your workspace>
   scp <model_config.json path> <your_ssh>:<path of your workspace>
   ```

   - Download the configuration file __*model_config.json*__ and the model __*model.ckpt*__ to your workspace directory and then check if they exist by running:
   ```
   ls -lha $WORKSPACE/model_config.json $WORKSPACE/model.ckpt
   ```

   ## Convert stable audio open small model to LiteRT
   - If virtual environment is not created. Run the following 
   ```
   cd $WORKSPACE
   python3 -m venv .venv
   ```
   - Activate the virtual environment and set path.
   ```
   source .venv/bin/activate
   export PYTHON_BIN_PATH=$WORKSPACE/.venv/bin/python3
   export PYTHON_LIB_PATH=$WORKSPACE/.venv/lib/python3.10/site-packages
   ```
   ### Clone the examples repository
   ```
   cd $WORKSPACE
   git clone https://github.com/ARM-software/ML-examples.git
   cd ML-examples/kleidiai-examples/audiogen/
   ```

   ### Install the required dependencies
   - `bash install_requirements.sh`

   - If you are using GPU on your machine, you may notice the following error:
   ```
   Traceback (most recent call last):
   File "$WORKSPACE/.venv/lib/python3.10/site-packages/torch/_inductor/runtime/hints.py",
   line 46, in <module> from triton.backends.compiler import AttrsDescriptor
   ImportError: cannot import name 'AttrsDescriptor' from 'triton.backends.compiler'
   ($WORKSPACE/.venv/lib/python3.10/site-packages/triton/backends/compiler.py)
   .
   ImportError: cannot import name 'AttrsDescriptor' from 'triton.compiler.compiler'
   ($WORKSPACE/.venv/lib/python3.10/site-packages/triton/compiler/compiler.py)
   ```
   - Reinstall the following
   ```
   pip install triton==3.2.0
   ```
   ### Convert Conditioners Submodule
   - The Conditioners submodule is based on the T5Encoder model. First, convert it to ONNX, then to LiteRT.
   ```
   python3 ./scripts/export_conditioners.py --model_config "$WORKSPACE/model_config.json" --ckpt_path "$WORKSPACE/model.ckpt"
   ```
   - If you face errors during this above installation
   ```
    pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision torchaudio
    pip install ml-dtypes
    pip install --upgrade "transformers[torch]" sentencepiece accelerate
    pip install onnx onnxscript onnxruntime
    pip install --upgrade "onnx2tf==1.28.2" \
                       "tensorflow==2.19.1" \
                       "tf_keras==2.19.0" \
                       "ai-edge-litert==1.4.0"
   ```
   ```
    export TRANSFORMERS_NO_TF=1
   ```

   ### Convert DiT and AutoEncoder Submodules
   - To convert the DiT and AutoEncoder submodules, use the Generative API  provided by the ai-edge-torch tools. This enables you to export a generative PyTorch model directly to .tflite using three main steps:
   ```
   python3 ./scripts/export_dit_autoencoder.py --model_config "$WORKSPACE/model_config.json" --ckpt_path "$WORKSPACE/model.ckpt"
   ```
   - If you face error running the above command
   ```
   
   pip install "tensorflow-cpu==2.15.0"
   pip install --no-cache-dir tf-nightly ai-edge-torch
   pip install -U "ml_dtypes" "jax[cpu]"

   ```
   - Replace the script `export_conditioners.py` and `export_dit_autoencoder.py` the file from `python` from this repo and paste it in the `scripts`

   - After successful conversion, you now have dit_model.tflite and autoencoder_model.tflite models in your current directory.
   - For easy access, add all the required models to one directory:
   ```
   export LITERT_MODELS_PATH=$WORKSPACE/litert-models
   mkdir $LITERT_MODELS_PATH
   cp conditioners_tflite/conditioners_float32.tflite $LITERT_MODELS_PATH
   cp dit_model.tflite $LITERT_MODELS_PATH
   cp autoencoder_model.tflite $LITERT_MODELS_PATH
   ```

   ## Build LiteRT libraries
   - Clone the repository and get the latest modules
   ```
   cd $WORKSPACE
   git clone https://github.com/tensorflow/tensorflow.git tensorflow_src
   cd tensorflow_src
   ```
   - Check out the specified commit of TensorFlow, and set the TF_SRC_PATH:
   ```
   git checkout 84dd28bbc29d75e6a6d917eb2998e4e8ea90ec56
   export TF_SRC_PATH=$(pwd)
   ```


   - The configuration script is interactive. Run it using the command below, and use the table to set the parameters for this Learning Path use-case.

   ```
   python3 ./configure.py
   ```
   - Please specify the location of python. [Default is $WORKSPACE/bin/python3]:	`Enter`
   - Please input the desired Python library path to use[$WORKSPACE/lib/python3.10/site-packages]	`Enter`
   - Do you wish to build TensorFlow with ROCm support? [y/N]: `N`
   - Do you wish to build TensorFlow with CUDA support?	`N`
   - Please specify optimization flags to use during compilation when bazel option “–config=opt” is specified [Default is -Wno-sign-compare]:	`Enter`
   - Do you want to use Clang to build TensorFlow? [Y/n]	`N`
   - Would you like to interactively configure ./WORKSPACE for Android builds? [y/N]	`Y`
   - Please specify the home path of the Android NDK to use. [Default is /home/user/Android/Sdk/ndk-bundle]	`Enter`
   - Please specify the (min) Android NDK API level to use. [Default is 21] `27`
   - Please specify the home path of the Android SDK to use. [Default is /home/user/Android/Sdk]	`Enter`
   - Please specify the Android SDK API level to use. [Default is 35]	`Enter`
   - Please specify an Android build tools version to use. [Default is 35.0.0]	`Enter`
   - Do you wish to build TensorFlow with iOS support? [y/N]:	`N`


   - Once the Bazel configuration is complete, you can build LiteRT for your target platform as follows:
   ```
   bazel build -c opt --config android_arm64 //tensorflow/lite:libtensorflowlite.so \
    --define tflite_with_xnnpack=true \
    --define=xnn_enable_arm_i8mm=true \
    --define tflite_with_xnnpack_qs8=true \
    --define tflite_with_xnnpack_qu8=true
   ```
   - The final step is to build flatbuffers used by the application:
   ```
   cd $WORKSPACE/tensorflow_src
   mkdir flatc-native-build && cd flatc-native-build
   cmake ../tensorflow/lite/tools/cmake/native_tools/flatbuffers
   cmake --build .
   ```

   ## Create and build a simple program to check if the model is built correctly
   - As a final step, you’ll build a simple program that runs inference on all three submodules directly on an Android device.
   ```
   cd $WORKSPACE/ML-examples/kleidiai-examples/audiogen/app
   mkdir build && cd build
   ```
   - Ensure the NDK path is set correctly and build with cmake:
   ```
   cmake -DCMAKE_TOOLCHAIN_FILE=$NDK_PATH/build/cmake/android.toolchain.cmake \
      -DCMAKE_POLICY_VERSION_MINIMUM=3.5 \
      -DANDROID_ABI=arm64-v8a \
      -DTF_INCLUDE_PATH=$TF_SRC_PATH \
      -DTF_LIB_PATH=$TF_SRC_PATH/bazel-bin/tensorflow/lite \
      -DFLATBUFFER_INCLUDE_PATH=$TF_SRC_PATH/flatc-native-build/flatbuffers/include \
    ..

   make -j
   ```
   - After the example application builds successfully, a binary file named audiogen is created.

   - A SentencePiece model is a type of subword tokenizer which is used by the audiogen application, you’ll need to download the spiece.model file from:
   ```
   cd $WORKSPACE
   wget https://huggingface.co/google-t5/t5-base/resolve/main/spiece.model
   ```
   - Verify this model was downloaded to your WORKSPACE.
   ```
   ls $WORKSPACE/spiece.model
   ```
   - Connect your Android device to your development machine using a cable. adb (Android Debug Bridge) is available as part of the Android SDK.
   ```
   adb devices
   ```
   ```
   cd $WORKSPACE/ML-examples/kleidiai-examples/audiogen/app/build
   adb shell mkdir -p /data/local/tmp/app
   adb push audiogen /data/local/tmp/app
   adb push $LITERT_MODELS_PATH/conditioners_float32.tflite /data/local/tmp/app
   adb push $LITERT_MODELS_PATH/dit_model.tflite /data/local/tmp/app
   adb push $LITERT_MODELS_PATH/autoencoder_model.tflite /data/local/tmp/app
   adb push $WORKSPACE/spiece.model /data/local/tmp/app
   adb push ${TF_SRC_PATH}/bazel-bin/tensorflow/lite/libtensorflowlite.so /data/local/tmp/app
   ```
   - Start a new shell to access the device’s system from your development machine:
   ```
   adb shell
   ```
   - From there, you can then run the audiogen application, which requires just three input arguments:
      - Model Path: The directory containing your LiteRT models and spiece.model files
      - Prompt: A text description of the desired audio (e.g., warm arpeggios on house beats 120BPM with drums effect)
      - CPU Threads: The number of CPU threads to use (e.g., 4)
      - Seed: A random number to seed the generation (e.g. 1234)

   - Test the model. Audio will be saved in the same directory
   ```
   cd /data/local/tmp/app
   LD_LIBRARY_PATH=. ./audiogen . "warm arpeggios on house beats 120BPM with drums effect" 4 1234
   exit
   ```  
   - You can now pull the generated output.wav back to your host machine and listen to the result.
   
   ```
   adb pull /data/local/tmp/app/output.wav
   ```

   - After the test are complete and the audio file is generated. Keep the below files handy as they will come in use while building the app.
      - audiogen
      - autoencoder_model.tflite
      - conditioners_float32.tflite
      - dit_model.tflite
      - libtensorflowlite.so
      - spiece.model



# Building ARM compatable LLM
- This requires us to use a small model due to the computational limitations.
- As this app uses `llama.rn` and `llama.rn` requires `.gguf` extension to run the model.
- We used `llama.cpp` for  conversion of model to `ARM compatable` model.
-   Install `llama.cpp` 
   ```
   git clone https://github.com/ggerganov/llama.cpp.git
   cd llama.cpp
   ```
- Compile llama.cpp.
```
make
```
- We would recommend `Qwen/Qwen2.5-1.5B`. App and configured with this model. But we would be able to use any small model. Just few changes are required in the building steps.
```
https://huggingface.co/Qwen/Qwen2.5-1.5B/tree/main
```

- Obtain the model you wish to convert, typically from Hugging Face. Ensure you have all necessary files, including the model weights (e.g., .safetensors files) and the config.json file.
- Use the convert-hf-to-gguf.py script. Navigate to the llama.cpp directory and execute the script, providing the path to your downloaded model:
```
python convert-hf-to-gguf.py <path_to_your_huggingface_model_directory> --outtype <quantization_type> --outfile <output_gguf_filename.gguf>
```
- `<path_to_your_huggingface_model_directory>`: Replace this with the local path where your Hugging Face model files are stored.

- `--outtype <quantization_type>`: Specify the desired quantization type for the GGUF model. Common options include F16 (full precision), Q4_K_M, Q5_K_M, Q8_0, etc. Quantization reduces model size and memory usage, potentially with a slight impact on performance. 
   - __*Recommendation:  Q4_K_M*__
- `--outfile <output_gguf_filename.gguf>`: Define the name and path for your output GGUF file.

- Output `.gguf` file will be used as the input to `llama.rn`

- Keep `.gguf` file handy as this will come in use while building the app.

# Building the App
- Clone the repo
```
git git@github.com:sma1692/arm-ai.git
```
```
cd arm-ai
npm install
```

- Connect an android device to `adb` and check the device is online
```
adb devices
```
- Build the app
```
npx expo run:android
```
- Add a native module to have an interface so that react native can interact with the models
```
mv /kotlin/AudioGenModule.kt /android/app/src/main/java/com/anonymous/arm-ai
mv /kotlin/AudioGenPackage.kt /android/app/src/main/java/com/anonymous/arm-ai
```
- add this to `MainApplication.kt`
```
add(AudioGenPackage())
```

#### Adding Stable audio to android build
- Adding Stable Audio take files and move them to `/android/app/src/main/assets`.
If `assets` directory is not present then you can make one.
   - autoencoder_model.tflite
   - conditioners_float32.tflite
   - dit_model.tflite
   - libtensorflowlite.so
   - spiece.model
- Make a folder in `/android/app/src/main/jniLibs`
```
cd /android/app/src/main/jniLibs
mkdir arm64-v8a
```
- Move `audiogen` file which was build in the Stable Audio conversion to ` /android/app/src/main/jniLibs/arm64-v8a` and rename `audiogen` to `libaudiogen.so`
- Move LLM Model `.gguf` to `/android/app/src/main/assets`


#### Adding LLM File to Android Build
- Move `.gguf` LLM file to 
` /android/app/src/main/assets`


#### Building the Usable App with Models Bundled Within
- If the LLM model `.gguf` file was made with the same name as mentioned in the readme. Then skip the next step.
   ```
   cd mod
   ```
   - Change below line to the model name which was used while building `.gguf` file
   ```
   const modelFileName = <YOUR DESIRED NAME> // change model name here
   ```

- On the base directory
- Connect an Android device to `adb` and check if its online
```
adb devices
```

- For building a debug version
```
npx expo run:android
```

- For building a release version
```
npx expo run:android --variant release

```




<<<<<<< HEAD
phi2.py the version which worked



### Pyenv 
Used to switch between various versions. 
FOr this solution 3.10 is required and wont work with 3.12 due to a hard requirement from the package PyWavelets, which is required for stability-audio-tools


pyenv install 3.10.4
pyenv virtualenv 3.10.4 stable-audio-env
pyenv activate stable-audio-env
pip install stability-audio-tools
=======




>>>>>>> 0412432ad9198c2b96ecc57b05ef6459f1d6598c
