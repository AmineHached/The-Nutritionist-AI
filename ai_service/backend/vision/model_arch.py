import torch
import torch.nn as nn
from torchvision import models

def get_food_model(num_classes, pretrained=True):
    """
    Returns a ResNet50 model modified for food classification.
    """
    model = models.resnet50(pretrained=pretrained)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    return model
