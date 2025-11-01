import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ChefHat, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { MenuItemCard, MenuItem } from '@/components/MenuItemCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  
  const cart = useCart(tableNumber);

  useEffect(() => {
    if (!tableNumber) {
      navigate('/');
      return;
    }
    
    fetchMenu();
  }, [tableNumber, vegFilter]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (vegFilter === 'veg') params.veg = 'true';
      if (vegFilter === 'non-veg') params.veg = 'false';
      
      const response = await api.get('/menu', { params });
      setMenuItems(response.data.items || []);
    } catch (error: any) {
      toast.error('Failed to load menu');
      console.error('Menu fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem, qty: number, notes?: string) => {
    cart.addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      qty,
      notes,
      veg: item.veg,
      imageUrl: item.imageUrl,
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const handleCheckout = () => {
    navigate(`/checkout?table=${tableNumber}`);
  };

  // Group items by category
  const allTimeFavorites = menuItems.filter((item) => item.isAllTimeFavorite);
  const chefsSpecials = menuItems.filter((item) => item.isChefsSpecial);
  
  const categorizedItems = menuItems.reduce((acc, item) => {
    const categoryName = item.categoryId?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const filteredItems = (items: MenuItem[]) => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Our Menu</h1>
              <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            
            <Select value={vegFilter} onValueChange={(value: any) => setVegFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="veg">Veg Only</SelectItem>
                <SelectItem value="non-veg">Non-Veg Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-12">
        {filteredItems(allTimeFavorites).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">All-Time Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems(allTimeFavorites).map((item) => (
                <MenuItemCard key={item._id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        )}

        {filteredItems(chefsSpecials).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-foreground">Chef's Specials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems(chefsSpecials).map((item) => (
                <MenuItemCard key={item._id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </section>
        )}

        {Object.entries(categorizedItems).map(([category, items]) => {
          const filtered = filteredItems(items);
          if (filtered.length === 0) return null;
          
          return (
            <section key={category}>
              <h2 className="text-2xl font-bold text-foreground mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  <MenuItemCard key={item._id} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </section>
          );
        })}

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items available</p>
          </div>
        )}
      </main>

      <CartDrawer
        items={cart.items}
        total={cart.total}
        itemCount={cart.itemCount}
        onUpdateQty={(id, qty) => cart.updateItem(id, { qty })}
        onRemove={cart.removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Menu;
