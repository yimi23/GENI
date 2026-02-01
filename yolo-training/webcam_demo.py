#!/usr/bin/env python3
"""
GENI Pill Detection - Webcam Demo
Shows real-time YOLOv8 detection with GENI-style alerts
"""

import cv2
from ultralytics import YOLO
import time
from datetime import datetime

# Configuration
MODEL_PATH = 'runs/detect/pill_detection/weights/best.pt'
CONFIDENCE_THRESHOLD = 0.6  # Minimum confidence to trigger alert

class GENIPillDemo:
    def __init__(self, model_path):
        print("🐾 GENI Pill Detection Demo")
        print("Loading model...")
        
        self.model = YOLO(model_path)
        self.cap = cv2.VideoCapture(0)
        
        # Detection state
        self.last_detection = None
        self.last_alert_time = 0
        self.alert_cooldown = 3  # seconds between alerts
        
        print("✅ Ready! Position pill box in view")
        print("Press 'q' to quit\n")
    
    def get_status_message(self, class_name, confidence):
        """Generate GENI-style status message"""
        if class_name == 'monday_full':
            if confidence > 0.8:
                return "⚠️  Pills detected in Monday compartment. Please take medication."
            else:
                return "🔍 Checking Monday compartment..."
        
        elif class_name == 'monday_empty':
            if confidence > 0.8:
                return "✅ Great job! Monday pills confirmed taken."
            else:
                return "🔍 Verifying pill status..."
        
        return "📷 Scanning for pill box..."
    
    def should_alert(self):
        """Check if enough time has passed since last alert"""
        current_time = time.time()
        if current_time - self.last_alert_time > self.alert_cooldown:
            self.last_alert_time = current_time
            return True
        return False
    
    def run(self):
        """Main detection loop"""
        fps_history = []
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("❌ Failed to read from camera")
                break
            
            # Run detection
            start_time = time.time()
            results = self.model(frame, device='mps', verbose=False)
            inference_time = time.time() - start_time
            
            # Calculate FPS
            fps = 1 / inference_time if inference_time > 0 else 0
            fps_history.append(fps)
            if len(fps_history) > 30:
                fps_history.pop(0)
            avg_fps = sum(fps_history) / len(fps_history)
            
            # Get detection results
            status_message = "📷 Scanning for pill box..."
            detection_color = (255, 255, 255)  # White
            
            if len(results[0].boxes) > 0:
                # Get highest confidence detection
                box = results[0].boxes[0]
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = self.model.names[class_id]
                
                # Update status
                if confidence > CONFIDENCE_THRESHOLD:
                    status_message = self.get_status_message(class_name, confidence)
                    
                    # Console alert
                    if class_name != self.last_detection and self.should_alert():
                        timestamp = datetime.now().strftime("%H:%M:%S")
                        print(f"[{timestamp}] Detected: {class_name} ({confidence:.2f})")
                        
                        if class_name == 'monday_empty':
                            print("           ✅ Medication logged!")
                            detection_color = (0, 255, 0)  # Green
                        elif class_name == 'monday_full':
                            print("           ⚠️  Reminder needed")
                            detection_color = (0, 165, 255)  # Orange
                        
                        self.last_detection = class_name
            
            # Draw results
            annotated_frame = results[0].plot()
            
            # Add UI overlays
            h, w = annotated_frame.shape[:2]
            
            # Status bar (top)
            cv2.rectangle(annotated_frame, (0, 0), (w, 80), (0, 0, 0), -1)
            cv2.putText(annotated_frame, "GENI Pill Detection", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            cv2.putText(annotated_frame, status_message, 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, detection_color, 2)
            
            # Info bar (bottom)
            cv2.rectangle(annotated_frame, (0, h-40), (w, h), (0, 0, 0), -1)
            cv2.putText(annotated_frame, f"FPS: {avg_fps:.1f}", 
                       (10, h-15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            cv2.putText(annotated_frame, "Press 'q' to quit", 
                       (w-200, h-15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Display
            cv2.imshow('GENI Pill Detection', annotated_frame)
            
            # Quit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Cleanup
        self.cap.release()
        cv2.destroyAllWindows()
        print("\n🐾 GENI demo ended")


if __name__ == "__main__":
    import os
    
    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Model not found: {MODEL_PATH}")
        print("\nTrain the model first:")
        print("  yolo task=detect mode=train data=dataset/data.yaml model=yolov8n.pt")
        exit(1)
    
    # Run demo
    try:
        demo = GENIPillDemo(MODEL_PATH)
        demo.run()
    except KeyboardInterrupt:
        print("\n\n🐾 Demo stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")
