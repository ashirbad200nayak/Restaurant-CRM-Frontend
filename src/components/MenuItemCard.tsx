import { useState } from 'react';
import { Minus, Plus, ChefHat, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VegIndicator } from './VegIndicator';
import { cn } from '@/lib/utils';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  imageUrl?: string;
  isChefsSpecial?: boolean;
  isAllTimeFavorite?: boolean;
  available: boolean;
  categoryId?: {
    _id: string;
    name: string;
  };
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, qty: number, notes?: string) => void;
}

export const MenuItemCard = ({ item, onAddToCart }: MenuItemCardProps) => {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    onAddToCart(item, qty, notes);
    setQty(1);
    setNotes('');
  };

  return (
    <div className={cn(
      "bg-card rounded-lg overflow-hidden shadow-sm border border-border transition-shadow hover:shadow-md",
      !item.available && "opacity-60"
    )}>
      {item.imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <VegIndicator veg={item.veg} />
              <h3 className="font-semibold text-foreground">{item.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {item.isChefsSpecial && (
                <Badge variant="secondary" className="gap-1">
                  <ChefHat className="w-3 h-3" />
                  Chef's Special
                </Badge>
              )}
              {item.isAllTimeFavorite && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3" />
                  Favorite
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-primary">₹{item.price}</p>
          </div>
        </div>

        {item.available && (
          <>
            <Input
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setQty(qty + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button onClick={handleAdd} className="flex-1">
                Add to Cart
              </Button>
            </div>
          </>
        )}

        {!item.available && (
          <div className="text-center py-2">
            <p className="text-sm font-medium text-destructive">Currently Unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
};
