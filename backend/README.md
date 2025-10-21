# Mini ATM Backend Server

Node.js backend for Mini ATM Simulator running on Raspberry Pi 4B.

## Features

- 🔍 RC522 RFID card reader integration via GPIO/SPI
- 🖨️ Thermal printer support (ESC/POS protocol)
- 🔌 WebSocket server for real-time card detection
- 📡 REST API for manual operations
- 💾 JSON-based user database
- 🎭 Mock mode for testing without hardware

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Development mode (auto-reload)
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/user/:uid` - Get user by card UID
- `POST /api/rfid/scan` - Trigger card scan
- `POST /api/print` - Print receipt

## WebSocket

Connect to `ws://localhost:3001/rfid` for real-time card detection.

## Hardware Setup

See [SETUP.md](./SETUP.md) for complete hardware configuration and installation instructions.

## Environment Variables

- `PORT` - Server port (default: 3001)
- `PRINTER_PATH` - Serial device path (default: /dev/serial0)
- `PRINTER_BAUD` - Baud rate (default: 19200)

## License

MIT
