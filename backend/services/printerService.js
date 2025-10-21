/**
 * Thermal Printer Service
 * Supports ESC/POS compatible printers (Adafruit Mini Thermal Printer, etc.)
 * Connects via USB or UART serial interface
 * 
 * Common USB paths: /dev/usb/lp0, /dev/ttyUSB0
 * UART path: /dev/serial0 (Raspberry Pi)
 */

import { SerialPort } from 'serialport';

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;

const COMMANDS = {
  INIT: [ESC, 0x40],                    // Initialize printer
  ALIGN_CENTER: [ESC, 0x61, 0x01],      // Center align
  ALIGN_LEFT: [ESC, 0x61, 0x00],        // Left align
  BOLD_ON: [ESC, 0x45, 0x01],           // Bold on
  BOLD_OFF: [ESC, 0x45, 0x00],          // Bold off
  UNDERLINE_ON: [ESC, 0x2D, 0x01],      // Underline on
  UNDERLINE_OFF: [ESC, 0x2D, 0x00],     // Underline off
  FONT_SIZE_NORMAL: [GS, 0x21, 0x00],   // Normal size
  FONT_SIZE_DOUBLE: [GS, 0x21, 0x11],   // Double size
  FEED_LINE: [0x0A],                     // Line feed
  CUT_PAPER: [GS, 0x56, 0x00],          // Cut paper
};

export class PrinterService {
  constructor(portPath = '/dev/serial0', baudRate = 19200) {
    this.portPath = portPath;
    this.baudRate = baudRate;
    this.port = null;
    this.isConnected = false;

    this.connect();
  }

  /**
   * Connect to thermal printer
   */
  connect() {
    try {
      this.port = new SerialPort({
        path: this.portPath,
        baudRate: this.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      this.port.on('open', () => {
        this.isConnected = true;
        console.log('✅ Thermal printer connected:', this.portPath);
        this.sendCommand(COMMANDS.INIT);
      });

      this.port.on('error', (err) => {
        console.error('❌ Printer error:', err.message);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to connect to printer:', error.message);
      throw new Error('Printer hardware not available');
    }
  }

  /**
   * Send raw command to printer
   */
  async sendCommand(command) {
    if (!this.isConnected || !this.port) {
      throw new Error('Printer not connected');
    }

    return new Promise((resolve, reject) => {
      this.port.write(Buffer.from(command), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Print text with optional formatting
   */
  async printText(text, options = {}) {
    const { bold = false, center = false, doubleSize = false } = options;

    if (center) await this.sendCommand(COMMANDS.ALIGN_CENTER);
    if (bold) await this.sendCommand(COMMANDS.BOLD_ON);
    if (doubleSize) await this.sendCommand(COMMANDS.FONT_SIZE_DOUBLE);

    await this.sendCommand([...Buffer.from(text, 'utf-8'), ...COMMANDS.FEED_LINE]);

    // Reset formatting
    if (bold) await this.sendCommand(COMMANDS.BOLD_OFF);
    if (doubleSize) await this.sendCommand(COMMANDS.FONT_SIZE_NORMAL);
    if (center) await this.sendCommand(COMMANDS.ALIGN_LEFT);
  }

  /**
   * Print ATM receipt
   */
  async printReceipt(data) {
    const { name, accountType, balance, cardNumber, timestamp } = data;

    try {
      // Initialize
      await this.sendCommand(COMMANDS.INIT);
      
      // Header
      await this.printText('================================', { center: true });
      await this.printText('MINI ATM RECEIPT', { center: true, bold: true, doubleSize: true });
      await this.printText('================================', { center: true });
      await this.printText('', {});
      
      // Account Info
      await this.printText(`Name: ${name}`, { bold: true });
      await this.printText(`Account: ${accountType}`, {});
      await this.printText(`Card: ${cardNumber.replace(/(\d{4})/g, '$1 ').trim()}`, {});
      await this.printText('', {});
      
      // Balance
      await this.printText('--------------------------------', { center: true });
      await this.printText('AVAILABLE BALANCE', { center: true, bold: true });
      await this.printText(`PHP ${balance.toFixed(2)}`, { center: true, doubleSize: true });
      await this.printText('--------------------------------', { center: true });
      await this.printText('', {});
      
      // Footer
      await this.printText(`Date: ${new Date(timestamp).toLocaleString()}`, { center: true });
      await this.printText('', {});
      await this.printText('Thank you for using Mini ATM', { center: true });
      await this.printText('Raspberry Pi 4B Simulator', { center: true });
      await this.printText('================================', { center: true });
      await this.printText('', {});
      await this.printText('', {});
      await this.printText('', {});
      
      // Cut paper
      await this.sendCommand(COMMANDS.CUT_PAPER);
      
      console.log('✅ Receipt printed successfully');
      
    } catch (error) {
      console.error('❌ Failed to print receipt:', error.message);
      throw error;
    }
  }

  /**
   * Test print
   */
  async testPrint() {
    await this.printText('=== PRINTER TEST ===', { center: true, bold: true });
    await this.printText('Mini ATM System', { center: true });
    await this.printText(`Test Date: ${new Date().toLocaleString()}`, { center: true });
    await this.printText('', {});
    await this.sendCommand(COMMANDS.CUT_PAPER);
    console.log('✅ Test print completed');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.port && this.port.isOpen) {
      this.port.close((err) => {
        if (err) console.error('Error closing printer:', err.message);
        else console.log('✅ Printer connection closed');
      });
    }
  }
}

// Mock Printer Service for testing without hardware
export class MockPrinterService {
  async printReceipt(data) {
    console.log('\n🖨️  ================================');
    console.log('     MINI ATM RECEIPT (MOCK)');
    console.log('   ================================');
    console.log('');
    console.log(`   Name: ${data.name}`);
    console.log(`   Account: ${data.accountType}`);
    console.log(`   Card: ${data.cardNumber}`);
    console.log('');
    console.log('   --------------------------------');
    console.log('       AVAILABLE BALANCE');
    console.log(`       PHP ${data.balance.toFixed(2)}`);
    console.log('   --------------------------------');
    console.log('');
    console.log(`   ${new Date(data.timestamp).toLocaleString()}`);
    console.log('');
    console.log('   Thank you for using Mini ATM');
    console.log('   ================================\n');
  }

  async testPrint() {
    console.log('🖨️  [MOCK] Test print executed');
  }

  cleanup() {
    console.log('✅ [MOCK] Printer cleaned up');
  }
}
