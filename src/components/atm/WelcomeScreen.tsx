import { CreditCard, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  isConnected: boolean;
  onScan: () => void;
  onDemoLogin: () => void;
  isScanning: boolean;
}

export const WelcomeScreen = ({ isConnected, onScan, onDemoLogin, isScanning }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-atm-screen">
      {/* Connection Status */}
      <div className="absolute top-6 right-6 flex items-center gap-2 text-sm">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-success" />
            <span className="text-success">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-warning" />
            <span className="text-warning">Demo Mode</span>
          </>
        )}
      </div>

      {/* Logo/Branding */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-primary/20 glow-effect">
          <CreditCard className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-2">Mini ATM</h1>
        <p className="text-xl text-muted-foreground">Raspberry Pi 4B Simulator</p>
      </div>

      {/* Card Scanning Animation */}
      <div className="relative mb-12">
        <div className={`w-64 h-40 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isScanning ? 'scale-105 card-slide' : 'scale-100'
        }`}>
          <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          <div className="relative flex items-center justify-center h-full">
            <CreditCard className={`w-16 h-16 text-white ${isScanning ? 'scan-pulse' : ''}`} />
          </div>
          {isScanning && (
            <div className="absolute inset-0 rounded-2xl border-4 border-accent animate-pulse" />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-foreground mb-4">
          {isScanning ? 'Scanning Card...' : 'Welcome'}
        </h2>
        <p className="text-xl text-muted-foreground max-w-md">
          {isScanning 
            ? 'Please wait while we verify your card'
            : 'Tap your RFID card or click the button below to begin'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onScan}
          disabled={isScanning}
          size="lg"
          className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isScanning ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Scanning...
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6 mr-3" />
              Tap Card to Begin
            </>
          )}
        </Button>
        
        <Button
          onClick={onDemoLogin}
          disabled={isScanning}
          size="lg"
          variant="secondary"
          className="text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Quick Demo Login
        </Button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-sm text-muted-foreground">
        <p>Supports RC522 RFID • Thermal Printer Ready</p>
        <p className="mt-1">Demo cards: A1B2C3D4, E5F6G7H8, I9J0K1L2, M3N4O5P6</p>
      </div>
    </div>
  );
};
