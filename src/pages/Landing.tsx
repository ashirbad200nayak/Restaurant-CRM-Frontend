import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QrCode, UtensilsCrossed, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Landing = () => {
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      navigate(`/menu?table=${table}`);
    }
  }, [searchParams, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tableNumber.trim()) {
      navigate(`/menu?table=${tableNumber.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
            <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to Our Restaurant
          </h1>
          <p className="text-muted-foreground text-lg">
            Order delicious food right from your table
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Enter your table number to view the menu and place an order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter table number (e.g., 12)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="text-center text-lg"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                View Menu
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <QrCode className="w-4 h-4" />
            <span>Or scan the QR code on your table</span>
          </div>
          
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
