from huggingface_hub import snapshot_download
import os
from config import HFACE_TOKEN

# Download Stability Audio Open
model_path = snapshot_download(
    repo_id="stabilityai/stable-audio-open-1.0",
    local_dir="./stability_audio_model",
    local_dir_use_symlinks=False,
    token=HFACE_TOKEN
)

print(f"Model downloaded to: {model_path}")