import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from executorch.exir import to_edge
from torch.export import export
import executorch.exir as exir

# Load Llama 3.2 1B model
#model_name = "meta-llama/Llama-3.2-1B-Instruct"
model_name = "Chituyi/Phi-3-mini-3.8b-4Bit-InstructionTuned-Alpaca"  # open alternative
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="cpu"  # Export on CPU for mobile compatibility
)

# Set to eval mode
model.eval()

# Create example input
example_text = "Compress this prompt for audio generation:"
inputs = tokenizer(example_text, return_tensors="pt")
example_args = (inputs.input_ids,)

# Export model
print("Exporting model to ExecuTorch format...")
# Note: This is a simplified version - full export requires more configuration
# You'll need to quantize and optimize for mobile

# Save tokenizer
tokenizer.save_pretrained("./llama_tokenizer")
print("Model export preparation complete!")
