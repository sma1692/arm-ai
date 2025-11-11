import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Use a model that's better supported for this use case
model_name = "microsoft/Phi-3-mini-4k-instruct"  # Official Microsoft Phi-3

print("Loading tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,  # Required for some Phi-3 models
        use_fast=True
    )
except Exception as e:
    print(f"Error loading tokenizer: {e}")
    print("Trying alternative approach...")
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        use_fast=False  # Fall back to slow tokenizer
    )

print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="cpu",
    trust_remote_code=True,
    low_cpu_mem_usage=True
)

# Set to eval mode
model.eval()

# Create example input
example_text = "Compress this prompt for audio generation:"
print(f"\nTokenizing example text: '{example_text}'")
inputs = tokenizer(example_text, return_tensors="pt")
print(f"Input shape: {inputs.input_ids.shape}")

# Test the model
print("\nTesting model inference...")
with torch.no_grad():
    outputs = model.generate(
        inputs.input_ids,
        max_new_tokens=50,
        do_sample=False
    )
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Generated: {generated_text}")

# Save tokenizer
print("\nSaving tokenizer...")
tokenizer.save_pretrained("./phi3_tokenizer")

print("\nModel preparation complete!")
print("\nNote: For ExecuTorch export, you'll need to:")
print("1. Quantize the model (e.g., using torch.ao.quantization)")
print("2. Use torch.export.export() with proper constraints")
print("3. Convert to ExecuTorch format using to_edge()")
print("4. Handle the specific requirements for mobile deployment")
