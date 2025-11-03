import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ChefHat, Utensils, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VegIndicator } from '@/components/VegIndicator';
import { cn } from '@/lib/utils';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  items: Array<{
    menuItemId: string;
    name: string;
    qty: number;
    price: number;
    notes?: string;
    veg?: boolean;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  estimatedReadyAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'received', label: 'Received', icon: Package },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Utensils },
  { key: 'served', label: 'Served', icon: CheckCircle2 },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { joinTable, on, off } = useSocket();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (tableNumber) {
      joinTable(tableNumber);

      const handleOrderUpdate = (data: any) => {
        if (data.orderId === orderId || data._id === orderId) {
          setOrder((prev) => prev ? { ...prev, ...data } : null);
        }
      };

      on('order_updated', handleOrderUpdate);
      on('order_created', handleOrderUpdate);

      return () => {
        off('order_updated', handleOrderUpdate);
        off('order_created', handleOrderUpdate);
      };
    }
  }, [tableNumber, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const statusMap: Record<string, number> = {
      received: 0,
      preparing: 1,
      ready: 2,
      served: 3,
      completed: 4,
    };
    return statusMap[order.orderStatus.toLowerCase()] || 0;
  };

  const getEstimatedTime = () => {
    if (!order?.estimatedReadyAt) return null;
    const now = new Date();
    const ready = new Date(order.estimatedReadyAt);
    const diff = ready.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ready now';
    
    const minutes = Math.ceil(diff / 1000 / 60);
    return `~${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const estimatedTime = getEstimatedTime();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Order Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Order #{order.orderId} • Table {order.tableNumber}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Status</span>
              {estimatedTime && (
                <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {estimatedTime}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                          isActive && 'bg-primary border-primary text-primary-foreground',
                          isCompleted && 'bg-success border-success text-success-foreground',
                          !isActive && !isCompleted && 'bg-background border-border text-muted-foreground'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 h-12 transition-colors',
                            isCompleted ? 'bg-success' : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-12">
                      <h3
                        className={cn(
                          'font-semibold',
                          isActive && 'text-primary',
                          isCompleted && 'text-success',
                          !isActive && !isCompleted && 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </h3>
                      {isActive && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Your order is currently {step.label.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
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
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {order.orderStatus.toLowerCase() === 'completed' && (
          <Card className="bg-secondary/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Order Completed!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for dining with us. We hope you enjoyed your meal!
              </p>
              <Button onClick={() => navigate(`/order/${orderId}/review?table=${tableNumber}`)}>
                Leave a Review
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default OrderTracking;
