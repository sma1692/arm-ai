import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Model selection
model_name = "microsoft/Phi-3-mini-4k-instruct"

print("=" * 60)
print("Loading Phi-3 Model with Compatibility Fixes")
print("=" * 60)

print("\n1. Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    model_name,
    trust_remote_code=True,
)

# Fix pad token issue
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.unk_token  # Use unk instead of eos
    tokenizer.pad_token_id = tokenizer.unk_token_id
    print("   ✓ Set pad_token to unk_token")

print("\n2. Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="cpu",
    trust_remote_code=True,
    low_cpu_mem_usage=True,
    # Disable flash attention which can cause issues
    attn_implementation="eager"
)

model.eval()
print("   ✓ Model loaded successfully")

print("\n3. Testing model inference...")
example_text = "Compress this prompt for audio generation:"

# Create inputs with attention mask
inputs = tokenizer(
    example_text,
    return_tensors="pt",
    padding=True,
    return_attention_mask=True
)

print(f"   Input shape: {inputs.input_ids.shape}")
print(f"   Attention mask shape: {inputs.attention_mask.shape}")

# Generate with proper settings
with torch.no_grad():
    outputs = model.generate(
        input_ids=inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_new_tokens=50,
        do_sample=False,  # Greedy decoding
        pad_token_id=tokenizer.pad_token_id,
        eos_token_id=tokenizer.eos_token_id,
        use_cache=False,  # CRITICAL: Disable cache to avoid DynamicCache.seen_tokens error
        temperature=None,  # Must be None when do_sample=False
        top_p=None
    )

generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(f"\n   ✓ Generated text:\n   {generated_text}")

print("\n4. Saving tokenizer...")
tokenizer.save_pretrained("./phi3_tokenizer")
print("   ✓ Tokenizer saved to ./phi3_tokenizer")

print("\n" + "=" * 60)
print("SUCCESS! Model is ready for export")
print("=" * 60)

print("\nNext steps for ExecuTorch export:")
print("1. Quantize the model for mobile deployment")
print("2. Export using torch.export with proper constraints")
print("3. Convert to ExecuTorch .pte format")
print("4. Test on target device")
