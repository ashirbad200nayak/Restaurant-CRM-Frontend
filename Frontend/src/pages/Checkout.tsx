import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VegIndicator } from '@/components/VegIndicator';
import { toast } from 'sonner';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();
  const cart = useCart(tableNumber);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        tableNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          qty: item.qty,
          price: item.price,
          notes: item.notes,
          veg: item.veg,
        })),
      };

      const response = await api.post('/orders', orderData);
      const orderId = response.data.orderId || response.data._id;
      
      toast.success('Order placed successfully!');
      cart.clearCart();
      navigate(`/order/${orderId}?table=${tableNumber}`);
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.total;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/menu?table=${tableNumber}`)}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Please provide your contact details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your phone number"
                    required
                    maxLength={15}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || cart.items.length === 0}
                >
                  {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.menuItemId} className="flex gap-3 pb-3 border-b last:border-0">
                    <VegIndicator veg={item.veg || false} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-medium">₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Qty: {item.qty}</span>
                        <span>₹{item.price} each</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
