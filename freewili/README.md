# FREE-WiLi Hardware Integration

This folder contains the hardware integration code for FREE-WiLi (Raspberry Pi-based elder care device).

## Hardware Components

- **Raspberry Pi** - Main controller
- **3x LEDs** (Red, Yellow, Green) - Status indicators
- **Buzzer** - Audio alerts
- **Emergency Button** - Manual help trigger
- **Motion Sensor** (optional) - Fall detection

## Setup

**Partner is responsible for this code.**

Basic structure needed:

```python
# main.py
import requests
from gpiozero import LED, Button, Buzzer

BACKEND_URL = "http://localhost:5000"

# Hardware setup
red_led = LED(17)
yellow_led = LED(27)
green_led = LED(22)
buzzer = Buzzer(23)
emergency_button = Button(24)

def on_button_press():
    # Trigger emergency
    requests.post(f"{BACKEND_URL}/api/button-pressed")
    
emergency_button.when_pressed = on_button_press

# Main loop
while True:
    # Poll backend for LED commands
    # Update hardware state
    pass
```

## API Integration

**Backend expects:**
- `POST /api/button-pressed` - Emergency button pressed
- Hardware should poll `GET /api/status` for LED states

## Testing Without Hardware

Use the frontend's "Test Fall Detection" button or API calls:
```bash
curl -X POST http://localhost:5000/api/emergency
```
