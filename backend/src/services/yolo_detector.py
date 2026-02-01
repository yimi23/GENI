#!/usr/bin/env python3
"""
GENI YOLOv8 Pill Detection Service
Runs as a Python microservice that the Node backend calls
"""

import sys
import json
import base64
import numpy as np
import cv2
from pathlib import Path

# Check if YOLOv8 is available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print(json.dumps({
        "error": "YOLOv8 not installed",
        "install": "pip install ultralytics opencv-python"
    }), file=sys.stderr)

class PillDetector:
    def __init__(self, model_path: str = None):
        """Initialize YOLO detector"""
        if not YOLO_AVAILABLE:
            raise ImportError("ultralytics not installed")
        
        # Default model path
        if model_path is None:
            model_path = str(Path(__file__).parent.parent.parent / 
                           "yolo-training/runs/detect/pill_detection/weights/best.pt")
        
        # Check if custom model exists
        if not Path(model_path).exists():
            # Fall back to pretrained YOLOv8n
            print(f"Custom model not found at {model_path}", file=sys.stderr)
            print("Using pretrained YOLOv8n (train custom model for pill detection)", file=sys.stderr)
            model_path = "yolov8n.pt"
        
        self.model = YOLO(model_path)
        self.confidence_threshold = 0.6
    
    def detect_from_base64(self, base64_image: str) -> dict:
        """
        Detect pill status from base64 image
        Returns: {"status": "taken"|"present"|"unclear", "confidence": float, "details": str}
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(base64_image)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {
                    "status": "unclear",
                    "confidence": 0.0,
                    "details": "Failed to decode image"
                }
            
            # Run detection
            results = self.model(img, device='mps', verbose=False)
            
            # No detections
            if len(results[0].boxes) == 0:
                return {
                    "status": "unclear",
                    "confidence": 0.0,
                    "details": "No pill box detected in image"
                }
            
            # Get highest confidence detection
            box = results[0].boxes[0]
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = self.model.names[class_id]
            
            # Determine status
            if confidence < self.confidence_threshold:
                return {
                    "status": "unclear",
                    "confidence": confidence,
                    "details": f"Low confidence detection ({confidence:.2%})"
                }
            
            # Map YOLO classes to status
            if class_name == 'monday_empty':
                status = "taken"
                details = "Monday compartment is empty - pills confirmed taken"
            elif class_name == 'monday_full':
                status = "present"
                details = "Pills detected in Monday compartment"
            else:
                status = "unclear"
                details = f"Unknown detection: {class_name}"
            
            return {
                "status": status,
                "confidence": confidence,
                "details": details,
                "class": class_name
            }
            
        except Exception as e:
            return {
                "status": "unclear",
                "confidence": 0.0,
                "details": f"Detection error: {str(e)}"
            }
    
    def detect_from_file(self, image_path: str) -> dict:
        """Detect from file path"""
        try:
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
                base64_image = base64.b64encode(image_bytes).decode()
                return self.detect_from_base64(base64_image)
        except Exception as e:
            return {
                "status": "unclear",
                "confidence": 0.0,
                "details": f"File error: {str(e)}"
            }


def main():
    """CLI interface for Node.js to call"""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: python yolo_detector.py <base64_image> [model_path]"
        }))
        sys.exit(1)
    
    base64_image = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        detector = PillDetector(model_path)
        result = detector.detect_from_base64(base64_image)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "status": "unclear",
            "confidence": 0.0,
            "details": f"Error: {str(e)}"
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()
