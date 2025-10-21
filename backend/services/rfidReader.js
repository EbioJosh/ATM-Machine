/**
 * RFID Reader Service for RC522 Module on Raspberry Pi
 * Connects via SPI interface (GPIO pins)
 * 
 * Hardware Connections:
 * RC522 -> Raspberry Pi
 * SDA  -> GPIO 8  (Pin 24)
 * SCK  -> GPIO 11 (Pin 23)
 * MOSI -> GPIO 10 (Pin 19)
 * MISO -> GPIO 9  (Pin 21)
 * GND  -> GND     (Pin 6)
 * RST  -> GPIO 25 (Pin 22)
 * 3.3V -> 3.3V    (Pin 1)
 */

import { promisify } from 'util';

// Conditionally import mfrc522-rpi only on Raspberry Pi
let MFRC522;
const isRaspberryPi = process.platform === 'linux' && (process.arch === 'arm' || process.arch === 'arm64');

if (isRaspberryPi) {
  try {
    MFRC522 = (await import('mfrc522-rpi')).default;
  } catch (error) {
    console.warn('⚠️  mfrc522-rpi not available. Install with: npm install mfrc522-rpi');
  }
}

export class RFIDReader {
  constructor() {
    this.reader = null;
    this.isInitialized = false;
    
    if (MFRC522) {
      try {
        this.reader = new MFRC522();
        this.isInitialized = true;
        console.log('✅ RC522 RFID Reader initialized on SPI');
      } catch (error) {
        console.error('❌ Failed to initialize RFID reader:', error.message);
        throw new Error('RFID hardware not available');
      }
    } else {
      console.warn('⚠️  Running in simulation mode (no RFID hardware)');
      throw new Error('RFID hardware not available');
    }
  }

  /**
   * Read card UID from RC522 module
   * @returns {Promise<string|null>} Card UID in hex format (e.g., "A1B2C3D4")
   */
  async readCard() {
    if (!this.isInitialized || !this.reader) {
      throw new Error('RFID reader not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        // Request card presence
        this.reader.reset();
        const response = this.reader.findCard();
        
        if (!response.status) {
          resolve(null); // No card present
          return;
        }

        // Read card UID
        const uid = this.reader.getUid();
        
        if (!uid.status) {
          resolve(null);
          return;
        }

        // Convert UID bytes to hex string
        const uidHex = uid.data
          .map(byte => byte.toString(16).toUpperCase().padStart(2, '0'))
          .join('');
        
        console.log('📇 Card UID read:', uidHex);
        resolve(uidHex);
        
      } catch (error) {
        console.error('❌ RFID read error:', error.message);
        reject(error);
      }
    });
  }

  /**
   * Continuous card detection with callback
   * @param {Function} onCardDetected - Callback function(uid)
   * @param {number} interval - Polling interval in ms (default: 1000)
   */
  startContinuousRead(onCardDetected, interval = 1000) {
    if (!this.isInitialized) {
      throw new Error('RFID reader not initialized');
    }

    let lastUid = null;
    
    const pollInterval = setInterval(async () => {
      try {
        const uid = await this.readCard();
        
        // Only trigger callback if new card detected (different from last)
        if (uid && uid !== lastUid) {
          lastUid = uid;
          onCardDetected(uid);
          
          // Clear lastUid after 5 seconds (allow re-scanning same card)
          setTimeout(() => {
            if (lastUid === uid) {
              lastUid = null;
            }
          }, 5000);
        }
      } catch (error) {
        console.error('Continuous read error:', error.message);
      }
    }, interval);

    return {
      stop: () => {
        clearInterval(pollInterval);
        console.log('🛑 Stopped RFID continuous reading');
      }
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.reader) {
      try {
        this.reader.reset();
        console.log('✅ RFID reader cleaned up');
      } catch (error) {
        console.error('Cleanup error:', error.message);
      }
    }
  }
}

// Mock RFID Reader for testing without hardware
export class MockRFIDReader {
  constructor() {
    this.mockCards = ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6'];
    this.currentIndex = 0;
  }

  async readCard() {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return random mock card
    const card = this.mockCards[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.mockCards.length;
    
    console.log('🎭 [MOCK] Card read:', card);
    return card;
  }

  startContinuousRead(onCardDetected, interval = 2000) {
    const pollInterval = setInterval(async () => {
      const uid = await this.readCard();
      onCardDetected(uid);
    }, interval);

    return {
      stop: () => clearInterval(pollInterval)
    };
  }

  cleanup() {
    console.log('✅ [MOCK] RFID reader cleaned up');
  }
}
