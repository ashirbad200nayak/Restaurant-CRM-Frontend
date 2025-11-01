import { useState, useEffect } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  veg?: boolean;
  imageUrl?: string;
}

export const useCart = (tableNumber: string) => {
  const CART_KEY = `restaurant_cart_table_${tableNumber}`;
  
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, CART_KEY]);

  const addItem = (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId && i.notes === item.notes);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId && i.notes === item.notes
            ? { ...i, qty: i.qty + (item.qty || 1) }
            : i
        );
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  };

  const updateItem = (menuItemId: string, updates: Partial<CartItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, ...updates } : item
      )
    );
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    total,
    itemCount,
  };
};
