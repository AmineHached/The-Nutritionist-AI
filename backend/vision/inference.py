import torch
from torchvision import models
from torchvision import transforms
from PIL import Image
import os
import logging
from backend.vision.dataset import get_transforms

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VisionService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VisionService, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            cls._instance.classes = [] # Need to load this mapping
        return cls._instance

    def load_model(self, model_path="food_model.pth", num_classes=5):
        import json
        
        # Check for classes file
        classes_path = model_path.replace(".pth", "_classes.json")
        if os.path.exists(classes_path):
            try:
                with open(classes_path, "r") as f:
                    self.classes = json.load(f)
                num_classes = len(self.classes)
                logger.info(f"Loaded {num_classes} classes from {classes_path}")
            except Exception as e:
                logger.error(f"Failed to load classes file: {e}")
        else:
            logger.warning("No classes file found. Using default/fallback.")

        try:
            logger.info(f"Loading custom vision model from {model_path}...")
            # Reconstruct model architecture
            self.model = models.resnet50(pretrained=False) # Weights loaded from pth
            num_ftrs = self.model.fc.in_features
            self.model.fc = torch.nn.Linear(num_ftrs, num_classes)
            
            if os.path.exists(model_path):
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                logger.info("Model loaded successfully.")
                return True
            else:
                logger.warning(f"Model file {model_path} not found. Running in mock/fallback mode.")
                return False
                
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    def predict_image(self, image_bytes):
        if self.model is None:
            # Fallback for now if model isn't trained yet
            return {"label": "unknown", "confidence": 0.0}
            
        try:
            from io import BytesIO
            img = Image.open(BytesIO(image_bytes)).convert('RGB')
            
            transform = get_transforms(is_train=False)
            img_tensor = transform(img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(img_tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                conf, preds = torch.max(probs, 1)
                
                predicted_idx = preds.item()
                confidence = conf.item()
                
                label = self.classes[predicted_idx] if self.classes and predicted_idx < len(self.classes) else f"Class_{predicted_idx}"
                return {"label": label, "confidence": confidence}
                
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"error": str(e)}

vision_service = VisionService()
