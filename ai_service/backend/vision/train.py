import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import models
import logging
import os
import sys
import mlflow
import mlflow.pytorch

# Add root directory to path
sys.path.append(os.getcwd())

from backend.vision.dataset import FoodDataset, get_transforms

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_model(data_dir, num_epochs=10, batch_size=32, model_save_path="food_model.pth"):
    device = torch.device("cpu") # OR CUDA
    logger.info(f"Using device: {device} (Forced CPU for compatibility)")
    
    # Setup Data
    train_dataset = FoodDataset(data_dir=data_dir, split='train', transform=get_transforms(is_train=True), download=True)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4 if os.name != 'nt' else 0)
    
    num_classes = len(train_dataset.classes)
    logger.info(f"Training on {num_classes} classes: {train_dataset.classes}")
    
    if num_classes == 0:
        logger.error("No classes found. Please ensure 'data/food-101/images' has subdirectories with images.")
        return

    # Load Model Architecture from MVC structure
    from backend.vision.model_arch import get_food_model
    model = get_food_model(num_classes, pretrained=True)
    
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=0.001, momentum=0.9)

    # Save Class Mapping immediately so inference works even if training stops
    import json
    classes_path = model_save_path.replace(".pth", "_classes.json")
    with open(classes_path, "w") as f:
        json.dump(train_dataset.classes, f)
    logger.info(f"Class mapping saved to {classes_path}")

    # MLflow Setup
    mlflow.set_experiment("Food_Vision_Training")
    with mlflow.start_run():
        mlflow.log_param("epochs", num_epochs)
        mlflow.log_param("batch_size", batch_size)
        mlflow.log_param("num_classes", num_classes)

    # Training Loop
    from tqdm import tqdm
    
    model.train()
    try:
        for epoch in range(num_epochs):
            running_loss = 0.0
            corrects = 0
            total = 0
            
            # Add progress bar
            pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{num_epochs - 1}")
            for inputs, labels in pbar:
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
                
                # Update progress bar
                current_acc = corrects.double() / total
                pbar.set_postfix(loss=loss.item(), acc=f"{current_acc:.2%}")
                
            epoch_loss = running_loss / total
            epoch_acc = corrects.double() / total
            
            logger.info(f"Epoch {epoch}/{num_epochs - 1} | Loss: {epoch_loss:.4f} | Acc: {epoch_acc:.4f}")
            
            # MLflow logging
            mlflow.log_metric("loss", epoch_loss, step=epoch)
            mlflow.log_metric("accuracy", float(epoch_acc), step=epoch)
            
            # SAVE CHECKPOINT after every epoch
            torch.save(model.state_dict(), model_save_path)
            logger.info(f"Checkpoint saved to {model_save_path}")
            
        # Log the final model
        mlflow.pytorch.log_model(model, "model")

    except KeyboardInterrupt:
        logger.info("Training interrupted by user. Saving current state...")
        torch.save(model.state_dict(), model_save_path)
        logger.info(f"Final state saved to {model_save_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Train Food Vision Model')
    parser.add_argument('--epochs', type=int, default=10, help='Number of epochs')
    parser.add_argument('--data_dir', type=str, default='data', help='Data directory')
    args = parser.parse_args()
    
    train_model(args.data_dir, num_epochs=args.epochs)
