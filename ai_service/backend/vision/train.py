import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import models
import logging
import os
import sys

# Add root directory to path
sys.path.append(os.getcwd())

from backend.vision.dataset import FoodDataset, get_transforms

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_model(data_dir, num_epochs=10, batch_size=32, model_save_path="food_model.pth"):
    # FORCE CPU: The user's RTX 5060 Ti (sm_120) is too new for current PyTorch stable binaries.
    # Since we are using a dummy dataset, CPU is instant anyway.
    device = torch.device("cpu")
    logger.info(f"Using device: {device} (Forced CPU for compatibility)")
    
    # Setup Data
    train_dataset = FoodDataset(data_dir=data_dir, split='train', transform=get_transforms(is_train=True), download=True)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4 if os.name != 'nt' else 0)
    
    num_classes = len(train_dataset.classes)
    logger.info(f"Training on {num_classes} classes: {train_dataset.classes}")
    
    if num_classes == 0:
        logger.error("No classes found. Please ensure 'data/food-101/images' has subdirectories with images.")
        return

    # Load Pretrained ResNet
    model = models.resnet50(pretrained=True)
    
    # Replace final layer
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()

    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # Training Loop
    model.train()
    for epoch in range(num_epochs):
        running_loss = 0.0
        corrects = 0
        total = 0
        
        for inputs, labels in train_loader:
            inputs = inputs.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            corrects += torch.sum(preds == labels.data)
            total += labels.size(0)
            
        epoch_loss = running_loss / total
        epoch_acc = corrects.double() / total
        
        logger.info(f"Epoch {epoch}/{num_epochs - 1} | Loss: {epoch_loss:.4f} | Acc: {epoch_acc:.4f}")
        
    # Save Model
    torch.save(model.state_dict(), model_save_path)
    logger.info(f"Model saved to {model_save_path}")
    
    # Save Class Mapping
    import json
    classes_path = model_save_path.replace(".pth", "_classes.json")
    with open(classes_path, "w") as f:
        json.dump(train_dataset.classes, f)
    logger.info(f"Class mapping saved to {classes_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Train Food Vision Model')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--data_dir', type=str, default='data', help='Data directory')
    args = parser.parse_args()
    
    train_model(args.data_dir, num_epochs=args.epochs)
