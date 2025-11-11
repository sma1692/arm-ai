
### SETUP AND STEPS



# Dependency isntallation 

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10+
sudo apt install python3.10 python3.10-venv python3-pip -y

# Install CUDA toolkit (for GPU acceleration during export)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install cuda-toolkit-12-1 -y

# Create working directory
mkdir ~/arm-hackathon && cd ~/arm-hackathon
python3.10 -m venv venv
source venv/bin/activate

# Install ExecuTorch and dependencies
pip install torch torchvision torchaudio
pip install executorch
pip install transformers sentencepiece

# Clone ExecuTorch repo
git clone https://github.com/pytorch/executorch.git
cd executorch
git submodule sync
git submodule update --init

# Install ExecuTorch
./install_requirements.sh

The executorch step failed 

pip install accelerate


# setup stability audio 

pip install stable-audio-tools
pip install torchaudio scipy soundfile
pip install huggingface_hub




phi2.py the version which worked



### Pyenv 
Used to switch between various versions. 
FOr this solution 3.10 is required and wont work with 3.12 due to a hard requirement from the package PyWavelets, which is required for stability-audio-tools


pyenv install 3.10.4
pyenv virtualenv 3.10.4 stable-audio-env
pyenv activate stable-audio-env
pip install stability-audio-tools
