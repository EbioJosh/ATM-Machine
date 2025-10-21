import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import services
import { RFIDReader } from './services/rfidReader.js';
import { PrinterService } from './services/printerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load user database
let usersDatabase;
try {
  const usersData = readFileSync(join(__dirname, 'data', 'users.json'), 'utf-8');
  usersDatabase = JSON.parse(usersData);
  console.log('✅ User database loaded:', usersDatabase.users.length, 'users');
} catch (error) {
  console.error('❌ Failed to load users database:', error.message);
  usersDatabase = { users: [] };
}

// Initialize services
let rfidReader;
let printerService;

try {
  rfidReader = new RFIDReader();
  console.log('✅ RFID Reader initialized');
} catch (error) {
  console.warn('⚠️  RFID Reader not available:', error.message);
}

try {
  printerService = new PrinterService();
  console.log('✅ Printer Service initialized');
} catch (error) {
  console.warn('⚠️  Printer Service not available:', error.message);
}

// ========== REST API Endpoints ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      rfid: !!rfidReader,
      printer: !!printerService
    },
    timestamp: new Date().toISOString()
  });
});

// Get user by UID
app.get('/api/user/:uid', (req, res) => {
  const { uid } = req.params;
  const user = usersDatabase.users.find(u => u.uid === uid);
  
  if (user) {
    console.log('✅ User found:', user.name);
    res.json(user);
  } else {
    console.log('❌ User not found:', uid);
    res.status(404).json({ error: 'User not found' });
  }
});

// Trigger RFID scan (manual)
app.post('/api/rfid/scan', async (req, res) => {
  if (!rfidReader) {
    return res.status(503).json({ error: 'RFID reader not available' });
  }

  try {
    const uid = await rfidReader.readCard();
    console.log('🔍 Card scanned:', uid);
    res.json({ uid, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    res.status(500).json({ error: 'Scan failed: ' + error.message });
  }
});

// Print receipt
app.post('/api/print', async (req, res) => {
  if (!printerService) {
    console.log('🖨️  [MOCK] Print request:', req.body);
    return res.json({ 
      success: true, 
      message: 'Mock print (no hardware available)',
      data: req.body 
    });
  }

  try {
    const { name, accountType, balance, cardNumber } = req.body;
    
    await printerService.printReceipt({
      name,
      accountType,
      balance,
      cardNumber,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Receipt printed for:', name);
    res.json({ success: true, message: 'Receipt printed' });
  } catch (error) {
    console.error('❌ Print failed:', error.message);
    res.status(500).json({ error: 'Print failed: ' + error.message });
  }
});

// ========== WebSocket Server ==========

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Mini ATM Backend Server running on port ${PORT}`);
  console.log(`📡 HTTP API: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/rfid\n`);
});

const wss = new WebSocketServer({ server, path: '/rfid' });

wss.on('connection', (ws) => {
  console.log('👤 Client connected to WebSocket');

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connection established',
    services: {
      rfid: !!rfidReader,
      printer: !!printerService
    }
  }));

  // Start RFID polling if available
  let rfidInterval;
  if (rfidReader) {
    rfidInterval = setInterval(async () => {
      try {
        const uid = await rfidReader.readCard();
        if (uid) {
          console.log('🔍 Card detected (WebSocket):', uid);
          ws.send(JSON.stringify({
            type: 'card_detected',
            uid,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        // Silent fail for polling
      }
    }, 1000); // Poll every second
  }

  ws.on('close', () => {
    console.log('👋 Client disconnected');
    if (rfidInterval) {
      clearInterval(rfidInterval);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});

// ========== Graceful Shutdown ==========

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  if (rfidReader) {
    rfidReader.cleanup();
  }
  
  if (printerService) {
    printerService.cleanup();
  }
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
