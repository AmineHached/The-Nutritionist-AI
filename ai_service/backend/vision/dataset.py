import os
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, datasets
from pathlib import Path
import logging
import requests
import tarfile
from tqdm import tqdm

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FoodDataset(Dataset):
    def __init__(self, data_dir, split='train', transform=None, download=False):
        """
        Args:
            data_dir (string): Directory where data is located.
            split (string): 'train' or 'test'.
            transform (callable, optional): Optional transform to be applied on a sample.
            download (bool): If true, downloads the dataset from the internet and puts it in root directory.
        """
        self.data_dir = Path(data_dir)
        self.split = split
        self.transform = transform
        
        # Structure: data/food-101/images
        self.root_dir = self.data_dir / 'food-101'
        self.image_folder = self.root_dir / 'images'
        
        # Check download
        if download:
            self._download_food101()
            
        # Verify data exists
        if not self.image_folder.exists() or not any(self.image_folder.iterdir()):
             logger.warning(f"Image folder {self.image_folder} is empty or missing.")
             self.classes = []
             self.samples = []
        else:
            self.dataset = datasets.ImageFolder(root=str(self.image_folder), transform=None)
            self.classes = self.dataset.classes
            self.samples = self.dataset.samples

    def _download_food101(self):
        if self.image_folder.exists() and any(self.image_folder.iterdir()):
            logger.info("Food-101 dataset appears to be present.")
            return

        url = "http://data.vision.ee.ethz.ch/cvl/food-101.tar.gz"
        filename = "food-101.tar.gz"
        tar_path = self.data_dir / filename
        
        self.data_dir.mkdir(parents=True, exist_ok=True)

        if not tar_path.exists():
            logger.info(f"Downloading Food-101 from {url}...")
            response = requests.get(url, stream=True)
            total_size_in_bytes = int(response.headers.get('content-length', 0))
            block_size = 1024 # 1 Kibibyte
            progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True)
            
            with open(tar_path, 'wb') as file:
                for data in response.iter_content(block_size):
                    progress_bar.update(len(data))
                    file.write(data)
            progress_bar.close()
            
            if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
                logger.error("ERROR, something went wrong with the download")
                return

        logger.info("Extracting Food-101...")
        try:
            with tarfile.open(tar_path, "r:gz") as tar:
                tar.extractall(path=self.data_dir)
            logger.info("Extraction complete!")
        except Exception as e:
            logger.error(f"Extraction failed: {e}")
            logger.warning("Deleting corrupted data to force re-download next time...")
            import shutil
            if self.root_dir.exists():
                shutil.rmtree(self.root_dir)
            if tar_path.exists():
                os.remove(tar_path)
            raise e

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, target = self.samples[idx]
        from PIL import Image, ImageFile
        ImageFile.LOAD_TRUNCATED_IMAGES = True
        img = Image.open(path).convert('RGB')
        
        if self.transform:
            img = self.transform(img)
            
        return img, target

def get_transforms(is_train=True):
    if is_train:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    else:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
