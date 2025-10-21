# Mini ATM Backend Setup Guide
## Raspberry Pi 4B Hardware Integration

This guide explains how to set up the Mini ATM backend on a Raspberry Pi 4B with RFID and thermal printer hardware.

---

## 📋 Prerequisites

### Hardware Required
- Raspberry Pi 4B (2GB+ RAM recommended)
- RC522 RFID Module
- Thermal Printer (ESC/POS compatible, e.g., Adafruit Mini Thermal Printer)
- MicroSD Card (16GB+, with Raspberry Pi OS installed)
- Power Supply (5V 3A for Pi + peripherals)
- Jumper wires
- (Optional) Breadboard for connections

### Software Required
- Raspberry Pi OS (Bullseye or newer)
- Node.js 18+ and npm
- Git

---

## 🔧 Hardware Setup

### RC522 RFID Module Connection

Connect the RC522 module to the Raspberry Pi GPIO pins:

| RC522 Pin | Raspberry Pi Pin | GPIO     |
|-----------|------------------|----------|
| SDA       | Pin 24           | GPIO 8   |
| SCK       | Pin 23           | GPIO 11  |
| MOSI      | Pin 19           | GPIO 10  |
| MISO      | Pin 21           | GPIO 9   |
| GND       | Pin 6            | GND      |
| RST       | Pin 22           | GPIO 25  |
| 3.3V      | Pin 1            | 3.3V     |

⚠️ **Important**: DO NOT connect to 5V! The RC522 operates at 3.3V.

### Thermal Printer Connection

**Option 1: USB Connection**
1. Connect printer via USB to any USB port on the Pi
2. Default device path: `/dev/usb/lp0` or `/dev/ttyUSB0`

**Option 2: UART Serial Connection**
1. Connect printer TX to Pi RX (Pin 10, GPIO 15)
2. Connect printer RX to Pi TX (Pin 8, GPIO 14)
3. Connect GND to GND
4. Power printer with external 5-9V supply
5. Default device path: `/dev/serial0`

---

## 🚀 Installation Steps

### 1. Enable SPI Interface

RFID requires SPI to be enabled:

```bash
sudo raspi-config
```

Navigate to:
- **Interface Options** → **SPI** → **Enable**

Reboot after enabling:
```bash
sudo reboot
```

### 2. Install Node.js (if not installed)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Clone and Setup Backend

```bash
# Navigate to project directory
cd ~/mini-atm-simulator

# Install backend dependencies
cd backend
npm install

# Install hardware-specific dependencies
npm install mfrc522-rpi serialport
```

### 4. Configure Serial Permissions

Grant user access to serial devices:

```bash
sudo usermod -a -G dialout $USER
sudo usermod -a -G gpio $USER

# Log out and back in for changes to take effect
```

### 5. Update Configuration

Edit `backend/server.js` if needed to change:
- Port number (default: 3001)
- Printer device path (default: `/dev/serial0`)
- Printer baud rate (default: 19200)

---

## ▶️ Running the Server

### Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ User database loaded: 4 users
✅ RFID Reader initialized
✅ Printer Service initialized
🚀 Mini ATM Backend Server running on port 3001
📡 HTTP API: http://localhost:3001
🔌 WebSocket: ws://localhost:3001/rfid
```

### Run in Development Mode (with auto-reload)

```bash
npm run dev
```

---

## 🌐 Running the Frontend

### Option 1: On Raspberry Pi

```bash
# Navigate to frontend directory
cd ~/mini-atm-simulator

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Access at: `http://localhost:8080`

### Option 2: On Another Device

Set the backend URL in frontend:

```bash
# In frontend root directory
echo "VITE_BACKEND_URL=http://<raspberry-pi-ip>:3001" > .env
echo "VITE_USE_MOCK_DATA=false" >> .env

npm run dev
```

---

## 🧪 Testing

### Test RFID Reader

```bash
# Test card scanning
curl http://localhost:3001/api/rfid/scan
```

Expected response:
```json
{
  "uid": "A1B2C3D4",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

### Test Printer

```bash
# Print a test receipt
curl -X POST http://localhost:3001/api/print \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "accountType": "Savings",
    "balance": 1000,
    "cardNumber": "1234 5678 9012 3456"
  }'
```

### Health Check

```bash
curl http://localhost:3001/api/health
```

---

## 🐛 Troubleshooting

### RFID Not Detected

**Check SPI is enabled:**
```bash
lsmod | grep spi
# Should show: spi_bcm2835
```

**Verify wiring:**
- Double-check all connections match the pinout table
- Ensure 3.3V connection (NOT 5V!)

**Test SPI communication:**
```bash
sudo apt-get install python3-spidev
python3 -c "import spidev; print('SPI OK')"
```

### Printer Not Working

**Check device path:**
```bash
# List serial devices
ls -l /dev/tty* /dev/usb/*

# For USB printer
ls -l /dev/usb/lp0

# For serial printer
ls -l /dev/serial0
```

**Check permissions:**
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Reboot to apply
sudo reboot
```

**Test serial communication:**
```bash
# Send test data to printer
echo "Test" > /dev/serial0
```

### Backend Won't Start

**Check if port is in use:**
```bash
sudo lsof -i :3001
```

**View logs:**
```bash
npm start 2>&1 | tee atm-backend.log
```

**Reset everything:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🔄 Auto-Start on Boot

Create a systemd service to auto-start the backend:

```bash
sudo nano /etc/systemd/system/mini-atm.service
```

Add:
```ini
[Unit]
Description=Mini ATM Backend Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/mini-atm-simulator/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mini-atm.service
sudo systemctl start mini-atm.service
sudo systemctl status mini-atm.service
```

---

## 📊 Mock Data vs Hardware Mode

The system supports both modes:

**Mock Mode** (default for testing):
```bash
# Frontend .env
VITE_USE_MOCK_DATA=true
```

**Hardware Mode** (for Raspberry Pi):
```bash
# Frontend .env
VITE_USE_MOCK_DATA=false
VITE_BACKEND_URL=http://localhost:3001
```

---

## 🔐 Security Notes

- This is a **demonstration system** - do not use in production
- No actual financial transactions occur
- User data is stored in a local JSON file
- For production use, implement:
  - Database with encryption
  - Secure authentication
  - Network security (HTTPS, VPN)
  - Transaction logging and audit trails

---

## 📚 API Reference

### REST Endpoints

#### GET `/api/health`
Health check and service status

#### GET `/api/user/:uid`
Fetch user by card UID

#### POST `/api/rfid/scan`
Trigger manual RFID scan

#### POST `/api/print`
Print receipt (requires user data in body)

### WebSocket

Connect to `ws://localhost:3001/rfid` for real-time card detection events.

**Events:**
- `connected` - Connection established
- `card_detected` - Card scanned with UID

---

## 💡 Tips

- Use a **powered USB hub** if experiencing power issues
- Keep RFID antenna away from metal surfaces
- Test thermal printer with ESC/POS test tools first
- Monitor system temperature: `vcgencmd measure_temp`
- Use quality jumper wires to avoid connection issues

---

## 📝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs on both frontend and backend
3. Verify hardware connections
4. Test components individually before integration

---

**Built for Raspberry Pi 4B** 🥧  
**Hardware**: RC522 RFID + Thermal Printer  
**Stack**: Node.js + Express + React + Vite
