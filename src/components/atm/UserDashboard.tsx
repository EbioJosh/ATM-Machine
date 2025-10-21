import { User } from '@/hooks/useATMConnection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Printer, LogOut, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  onPrint: () => void;
  onLogout: () => void;
}

export const UserDashboard = ({ user, onPrint, onLogout }: UserDashboardProps) => {
  return (
    <div className="min-h-screen bg-atm-screen p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground card-slide">
                Welcome, {user.name}
              </h1>
              <p className="text-muted-foreground">Account: {user.accountType}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="lg"
            className="border-border hover:bg-secondary"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-br from-primary via-primary/90 to-accent border-0 shadow-2xl card-slide">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 mb-2 text-lg">Current Balance</p>
                <p className="text-5xl font-bold text-primary-foreground">
                  ₱{user.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <DollarSign className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary-foreground/20">
              <p className="text-primary-foreground/80">Card Number</p>
              <p className="text-xl font-mono text-primary-foreground mt-1">{user.cardNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={onPrint}
            size="lg"
            className="h-24 text-xl bg-success hover:bg-success/90 text-success-foreground shadow-lg"
          >
            <Printer className="w-8 h-8 mr-3" />
            Print Receipt
          </Button>
          <Button
            size="lg"
            className="h-24 text-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
          >
            <CreditCard className="w-8 h-8 mr-3" />
            Check Balance
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="w-6 h-6" />
                      ) : (
                        <TrendingDown className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.amount > 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: ₱{transaction.balance.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a simulated ATM interface for Raspberry Pi 4B</p>
          <p className="mt-1">Hardware: RC522 RFID Module • Thermal Printer</p>
        </div>
      </div>
    </div>
  );
};
