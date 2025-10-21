import { useATMConnection } from '@/hooks/useATMConnection';
import { WelcomeScreen } from '@/components/atm/WelcomeScreen';
import { UserDashboard } from '@/components/atm/UserDashboard';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Index = () => {
  const { 
    isConnected, 
    isScanning, 
    currentUser, 
    error,
    scanCard, 
    printReceipt, 
    logout 
  } = useATMConnection();
  
  const { toast } = useToast();

  // Show error notifications
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show success notification when user logs in
  useEffect(() => {
    if (currentUser) {
      toast({
        title: "Welcome!",
        description: `Hello, ${currentUser.name}. Access granted.`,
      });
    }
  }, [currentUser, toast]);

  // Handle print receipt
  const handlePrint = async () => {
    await printReceipt();
    toast({
      title: "Receipt Printed",
      description: "Your transaction receipt has been printed successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {!currentUser ? (
        <WelcomeScreen 
          isConnected={isConnected}
          onScan={scanCard}
          isScanning={isScanning}
        />
      ) : (
        <UserDashboard 
          user={currentUser}
          onPrint={handlePrint}
          onLogout={logout}
        />
      )}
    </div>
  );
};

export default Index;
