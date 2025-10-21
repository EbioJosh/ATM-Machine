# 🏧 Mini ATM Machine Simulator

<div align="center">

**A complete ATM simulation system for Raspberry Pi 4B**

*Featuring RFID card authentication and thermal receipt printing*

[Features](#-features) • [Demo](#-demo) • [Setup](#-setup) • [Hardware](#-hardware) • [API](#-api)

</div>

---

## 📋 Overview

A full-stack web application that simulates a professional ATM (Automated Teller Machine) interface, designed to run locally on a Raspberry Pi 4B with real hardware peripherals. The system provides a beautiful, modern UI with support for RFID card scanning and thermal receipt printing.

### 🎯 Project Goals

- **Hardware Integration**: Connect and control RC522 RFID module and thermal printer via Raspberry Pi GPIO
- **Real-Time Communication**: WebSocket-based instant card detection and processing
- **Professional UI**: Modern, responsive ATM interface with smooth animations
- **Cross-Platform**: Works standalone (demo mode) or with actual hardware
- **Educational**: Perfect for learning IoT, hardware integration, and full-stack development

---

## ✨ Features

### Frontend (React + Vite)

- 🎨 **Modern ATM Interface**
  - Professional banking design with gradient effects
  - Smooth card scanning animations
  - Real-time balance and transaction display
  - Responsive layout (desktop, tablet, Raspberry Pi touchscreen)

- 🔄 **Dual Mode Operation**
  - **Demo Mode**: Works without hardware using mock data
  - **Hardware Mode**: Real-time RFID scanning and printer control

- 📊 **Account Dashboard**
  - Current balance display
  - Transaction history
  - Account information
  - Quick action buttons

### Backend (Node.js + Express)

- 🔍 **RFID Integration**
  - RC522 module via SPI interface
  - Real-time card detection (WebSocket)
  - Card UID to user mapping

- 🖨️ **Thermal Printer Support**
  - ESC/POS protocol implementation
  - Receipt formatting with account details
  - USB and UART serial connection support

- 🔌 **API & WebSocket**
  - REST API for manual operations
  - WebSocket for real-time card events
  - Health monitoring and status checks

---

## 🎬 Demo

### Screenshots

**Welcome Screen**
- Animated card scanning prompt
- Connection status indicator
- Demo mode support

**User Dashboard**
- Large balance display with gradients
- Transaction history cards
- Print receipt button
- Logout functionality

### Running Demo Mode

No hardware required! Just run the frontend:

```bash
npm install
npm run dev
```

Visit `http://localhost:8080` and click "Tap Card to Begin" to see a random demo user.

---

## 🛠️ Hardware

### Required Components

| Component | Description | Connection |
|-----------|-------------|------------|
| **Raspberry Pi 4B** | 2GB+ RAM recommended | - |
| **RC522 RFID Module** | 13.56MHz card reader | SPI (GPIO 8-11) |
| **Thermal Printer** | ESC/POS compatible | USB or UART |
| **RFID Cards/Tags** | ISO 14443A (MIFARE) | - |
| **Power Supply** | 5V 3A | USB-C |
| **MicroSD Card** | 16GB+ with Raspberry Pi OS | - |

### Hardware Wiring

#### RC522 RFID Module → Raspberry Pi

```
RC522 Pin    →    Raspberry Pi
─────────────────────────────
SDA          →    GPIO 8  (Pin 24)
SCK          →    GPIO 11 (Pin 23)
MOSI         →    GPIO 10 (Pin 19)
MISO         →    GPIO 9  (Pin 21)
GND          →    GND     (Pin 6)
RST          →    GPIO 25 (Pin 22)
3.3V         →    3.3V    (Pin 1)
```

⚠️ **Critical**: Use 3.3V only! 5V will damage the RC522 module.

#### Thermal Printer → Raspberry Pi

**Option 1: USB**
- Plug into any USB port
- Device path: `/dev/usb/lp0` or `/dev/ttyUSB0`

**Option 2: UART Serial**
- Printer TX → Pi RX (GPIO 15, Pin 10)
- Printer RX → Pi TX (GPIO 14, Pin 8)
- GND → GND
- Device path: `/dev/serial0`

---

## 🚀 Setup

### Prerequisites

- Raspberry Pi 4B with Raspberry Pi OS
- Node.js 18+ and npm
- Git

### Installation

#### 1. Clone Repository

```bash
git clone <repository-url>
cd mini-atm-simulator
```

#### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file (optional)
echo "VITE_BACKEND_URL=http://localhost:3001" > .env
echo "VITE_USE_MOCK_DATA=true" >> .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:8080`

#### 3. Backend Setup (Raspberry Pi)

```bash
cd backend

# Install dependencies
npm install

# Enable SPI (for RFID)
sudo raspi-config
# Navigate to: Interface Options → SPI → Enable
# Reboot after enabling

# Install hardware libraries
npm install mfrc522-rpi serialport

# Add user permissions
sudo usermod -a -G dialout $USER
sudo usermod -a -G gpio $USER

# Start server
npm start
```

Backend will be available at `http://localhost:3001`

#### 4. Connect Frontend to Backend

Update frontend `.env`:

```bash
VITE_BACKEND_URL=http://localhost:3001
VITE_USE_MOCK_DATA=false
```

Restart frontend:
```bash
npm run dev
```

---

## 📡 API Reference

### REST Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "services": {
    "rfid": true,
    "printer": true
  },
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

#### Get User by UID
```http
GET /api/user/:uid
```

**Response:**
```json
{
  "uid": "A1B2C3D4",
  "cardNumber": "4532 1234 5678 9012",
  "name": "Juan Dela Cruz",
  "accountType": "Savings",
  "balance": 15420.50,
  "transactions": [...]
}
```

#### Scan RFID Card
```http
POST /api/rfid/scan
```

**Response:**
```json
{
  "uid": "A1B2C3D4",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

#### Print Receipt
```http
POST /api/print
Content-Type: application/json

{
  "name": "Juan Dela Cruz",
  "accountType": "Savings",
  "balance": 15420.50,
  "cardNumber": "4532 1234 5678 9012"
}
```

### WebSocket

Connect to `ws://localhost:3001/rfid` for real-time card detection.

**Events:**

```javascript
// Connection established
{
  "type": "connected",
  "message": "WebSocket connection established",
  "services": { "rfid": true, "printer": true }
}

// Card detected
{
  "type": "card_detected",
  "uid": "A1B2C3D4",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

---

## 🎨 Design System

The application uses a carefully crafted design system with semantic tokens:

### Color Palette

- **Primary**: Deep Blue (`hsl(221, 83%, 53%)`) - Trust & Security
- **Accent**: Cyan (`hsl(189, 94%, 43%)`) - Modern Tech
- **Success**: Green (`hsl(142, 76%, 36%)`) - Confirmations
- **Warning**: Amber (`hsl(38, 92%, 50%)`) - Alerts
- **Background**: Dark Navy (`hsl(217, 33%, 12%)`) - Professional

### Typography

- Font Family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Large headlines for balance and key info
- Clear, readable transaction details

### Animations

- **Scan Pulse**: 2s ease-in-out infinite (card scanning)
- **Card Slide**: 0.5s ease-out (UI transitions)
- **Glow Effect**: 2s ease-in-out infinite (RFID icon)

---

## 🧪 Testing

### Test RFID Scanner

```bash
curl http://localhost:3001/api/rfid/scan
```

### Test Printer

```bash
curl -X POST http://localhost:3001/api/print \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "accountType": "Savings",
    "balance": 1000,
    "cardNumber": "1234 5678 9012 3456"
  }'
```

### Demo Card UIDs

For testing in mock mode:
- `A1B2C3D4` - Juan Dela Cruz
- `E5F6G7H8` - Maria Santos
- `I9J0K1L2` - Roberto Garcia
- `M3N4O5P6` - Ana Reyes

---

## 🔧 Troubleshooting

### RFID Not Working

1. Verify SPI is enabled: `lsmod | grep spi`
2. Check wiring connections (especially 3.3V!)
3. Test with simple SPI script
4. Ensure RC522 library is installed

### Printer Issues

1. Check device path: `ls -l /dev/tty*`
2. Verify user permissions: `groups $USER`
3. Test with echo command: `echo "Test" > /dev/serial0`
4. Check baud rate matches printer specs

### Backend Won't Start

1. Check port availability: `sudo lsof -i :3001`
2. Verify Node.js version: `node --version`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check logs for specific errors

---

## 📂 Project Structure

```
mini-atm-simulator/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/atm/     # ATM UI components
│   │   │   ├── WelcomeScreen.tsx
│   │   │   └── UserDashboard.tsx
│   │   ├── hooks/
│   │   │   └── useATMConnection.ts  # Backend communication
│   │   ├── data/
│   │   │   └── mockUsers.json      # Demo user data
│   │   ├── pages/
│   │   │   └── Index.tsx           # Main page
│   │   └── index.css               # Design system
│   └── package.json
│
├── backend/                     # Node.js + Express server
│   ├── server.js               # Main server file
│   ├── services/
│   │   ├── rfidReader.js       # RC522 RFID integration
│   │   └── printerService.js   # Thermal printer control
│   ├── data/
│   │   └── users.json          # User database
│   ├── SETUP.md                # Hardware setup guide
│   └── package.json
│
└── README.md                    # This file
```

---

## 🔐 Security Notice

⚠️ **This is a demonstration/educational project**

- No actual financial transactions occur
- User data is stored in plain JSON files
- No encryption or secure authentication
- Not suitable for production use without major security enhancements

For production deployment, implement:
- Encrypted database (PostgreSQL, etc.)
- Secure user authentication (JWT, OAuth)
- HTTPS/TLS encryption
- Transaction logging and audit trails
- Input validation and sanitization

---

## 🚀 Future Enhancements

- [ ] PIN code authentication
- [ ] Cash withdrawal amount selection
- [ ] Transfer between accounts
- [ ] Balance inquiry history
- [ ] Multi-language support
- [ ] Admin dashboard for user management
- [ ] LED feedback indicators
- [ ] Buzzer for audio feedback
- [ ] Receipt preview before printing
- [ ] Network connectivity for real-time balance updates

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📚 Documentation

- [Hardware Setup Guide](backend/SETUP.md) - Detailed Raspberry Pi configuration
- [API Documentation](#-api-reference) - REST and WebSocket endpoints
- [Design System](src/index.css) - Color tokens and animations

---

## 💡 Acknowledgments

- Built with React, Vite, Node.js, and Express
- UI components from shadcn/ui
- RFID library: mfrc522-rpi
- Thermal printing via SerialPort

---

<div align="center">

**Built for Raspberry Pi 4B** 🥧

**Hardware**: RC522 RFID Module • Thermal Printer  
**Stack**: React • Node.js • Express • WebSocket • GPIO/SPI

Made with ❤️ for IoT and Hardware Integration

</div>
