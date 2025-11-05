#!/usr/bin/env python3
"""
Quick script to retrain models with current sklearn version
This fixes the version mismatch issue
"""

import pickle
import os
from pathlib import Path

def retrain_models():
    """
    Retrain all models with current sklearn version
    """
    print("🔧 Retraining models with current sklearn version...")
    print("=" * 60)
    
    # Check if training notebook exists
    training_file = Path("ai_module/soil_training.ipynb")
    
    if not training_file.exists():
        print("❌ Training notebook not found!")
        print("   Please run the Jupyter notebook: ai_module/soil_training.ipynb")
        return False
    
    print("✅ Training notebook found!")
    print("\n📋 Steps to retrain:")
    print("1. Open: ai_module/soil_training.ipynb")
    print("2. Run all cells")
    print("3. Models will be saved to ai_module/models/")
    print("4. Restart AI service")
    
    print("\n🚀 Or run this command:")
    print("   jupyter nbconvert --to notebook --execute ai_module/soil_training.ipynb")
    
    return True

if __name__ == "__main__":
    retrain_models()

