import torch
print(f"PyTorch Version: {torch.__version__}")
if torch.cuda.is_available():
    print(f"✅ CUDA is available! Device: {torch.cuda.get_device_name(0)}")
    print("You are ready to train on GPU.")
else:
    print("❌ CUDA is NOT available. You are still on CPU.")
