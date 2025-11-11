import torch
from stable_audio_tools import get_pretrained_model
from stable_audio_tools.inference.generation import generate_diffusion_cond
from config import HFACE_TOKEN

from huggingface_hub import login
login(HFACE_TOKEN)
# Load model
model, model_config = get_pretrained_model(
    "stabilityai/stable-audio-open-1.0"
    # use_auth_token=HFACE_TOKEN

    
    )
model.eval()

# Export to TorchScript (simplified - actual export is more complex)
# You'll need to trace the model with example inputs
print("Preparing Stability Audio for mobile deployment...")

# Save model configuration
import json
with open("stability_config.json", "w") as f:
    json.dump(model_config, f)