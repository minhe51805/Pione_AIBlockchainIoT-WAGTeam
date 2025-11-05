"""
Model Registry - Load all AI models into memory
Loads 26 .pkl files:
- 1 Crop Classifier
- 1 Soil Health Scorer
- 22 Crop Validators
- 1 Anomaly Detector
- 1 Feature Scaler
- 1 Label Encoder
"""

import joblib
import os
from pathlib import Path
import json
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class ModelRegistry:
    """
    Singleton class to load and manage all AI models
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        self.crop_classifier = None
        self.soil_health_scorer = None
        self.crop_validators: Dict[str, Any] = {}
        self.anomaly_detector = None
        self.feature_scaler = None
        self.label_encoder = None
        
        # Get absolute path to project root
        current_file = Path(__file__)  # ai_service/models_loader.py
        project_root = current_file.parent.parent  # Go up 2 levels to workspace root
        
        self.models_path = Path(os.getenv('MODELS_PATH', str(project_root / 'ai_module' / 'models')))
        self.scaler_path = Path(os.getenv('SCALER_PATH', str(project_root / 'ai_module' / 'data' / 'feature_scaler.pkl')))
        self.encoder_path = Path(os.getenv('ENCODER_PATH', str(project_root / 'ai_module' / 'data' / 'label_encoder.pkl')))
        
        self._initialized = True
        self._loaded = False
    
    def load_all(self) -> None:
        """
        Load all 26 model files into memory
        """
        if self._loaded:
            logger.info("Models already loaded, skipping...")
            return
        
        logger.info("=" * 80)
        logger.info("🤖 LOADING AI MODELS...")
        logger.info("=" * 80)
        
        try:
            # 1. Load Feature Scaler
            logger.info(f"📦 Loading feature scaler from {self.scaler_path}...")
            self.feature_scaler = joblib.load(self.scaler_path)
            logger.info("   ✅ Feature scaler loaded")
            
            # 2. Load Label Encoder
            logger.info(f"📦 Loading label encoder from {self.encoder_path}...")
            self.label_encoder = joblib.load(self.encoder_path)
            logger.info(f"   ✅ Label encoder loaded ({len(self.label_encoder.classes_)} classes)")
            
            # 3. Load Crop Classifier
            classifier_path = self.models_path / 'crop_classifier.pkl'
            logger.info(f"📦 Loading crop classifier from {classifier_path}...")
            self.crop_classifier = joblib.load(classifier_path)
            logger.info("   ✅ Crop classifier loaded")
            
            # 4. Load Soil Health Scorer
            scorer_path = self.models_path / 'soil_health_scorer.pkl'
            logger.info(f"📦 Loading soil health scorer from {scorer_path}...")
            self.soil_health_scorer = joblib.load(scorer_path)
            logger.info("   ✅ Soil health scorer loaded")
            
            # 5. Load Anomaly Detector
            anomaly_path = self.models_path / 'anomaly_detector.pkl'
            logger.info(f"📦 Loading anomaly detector from {anomaly_path}...")
            self.anomaly_detector = joblib.load(anomaly_path)
            logger.info("   ✅ Anomaly detector loaded")
            
            # 6. Load 22 Crop Validators
            validators_dir = self.models_path / 'crop_validators'
            model_list_path = validators_dir / 'model_list.json'
            
            logger.info(f"📦 Loading crop validators from {validators_dir}...")
            
            # Read model list
            with open(model_list_path, 'r') as f:
                model_list = json.load(f)
            
            crop_names = model_list['crops']
            logger.info(f"   Found {len(crop_names)} crop validators to load...")
            
            for i, crop in enumerate(crop_names, 1):
                validator_path = validators_dir / f'{crop}_validator.pkl'
                self.crop_validators[crop] = joblib.load(validator_path)
                if i % 5 == 0 or i == len(crop_names):
                    logger.info(f"   ✅ Loaded {i}/{len(crop_names)} validators...")
            
            logger.info(f"   ✅ All {len(crop_names)} crop validators loaded")
            
            # Mark as loaded
            self._loaded = True
            
            logger.info("\n" + "=" * 80)
            logger.info("✅ ALL MODELS LOADED SUCCESSFULLY!")
            logger.info("=" * 80)
            logger.info(f"   • Crop Classifier: ✅")
            logger.info(f"   • Soil Health Scorer: ✅")
            logger.info(f"   • Anomaly Detector: ✅")
            logger.info(f"   • Crop Validators: ✅ ({len(self.crop_validators)} models)")
            logger.info(f"   • Feature Scaler: ✅")
            logger.info(f"   • Label Encoder: ✅")
            logger.info(f"\n   TOTAL: 26 files loaded into memory")
            logger.info("=" * 80 + "\n")
            
        except FileNotFoundError as e:
            logger.error(f"❌ Model file not found: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            raise
    
    def get_crop_names(self) -> list:
        """Get list of all crop names"""
        if self.label_encoder is None:
            raise RuntimeError("Label encoder not loaded. Call load_all() first.")
        return list(self.label_encoder.classes_)
    
    def get_model_info(self) -> dict:
        """Get information about loaded models"""
        return {
            "models_loaded": self._loaded,
            "total_models": 26,
            "crop_classifier": self.crop_classifier is not None,
            "soil_health_scorer": self.soil_health_scorer is not None,
            "anomaly_detector": self.anomaly_detector is not None,
            "crop_validators_count": len(self.crop_validators),
            "feature_scaler": self.feature_scaler is not None,
            "label_encoder": self.label_encoder is not None,
            "available_crops": self.get_crop_names() if self.label_encoder else []
        }
    
    def validate_loaded(self) -> bool:
        """Check if all models are loaded"""
        return all([
            self.crop_classifier is not None,
            self.soil_health_scorer is not None,
            self.anomaly_detector is not None,
            len(self.crop_validators) == 22,
            self.feature_scaler is not None,
            self.label_encoder is not None
        ])


# Global instance
model_registry = ModelRegistry()


def get_model_registry() -> ModelRegistry:
    """Get the global model registry instance"""
    return model_registry

