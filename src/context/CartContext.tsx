import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type CartItem, type Product } from '@/lib/supabase';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  updateQuantity: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data ?? []) as unknown as CartItem[]);
    setLoading(false);
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (product: Product, qty = 1) => {
    if (!user) return;
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + qty);
      return;
    }
    await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity: qty });
    await refreshCart();
  };

  const updateQuantity = async (itemId: string, qty: number) => {
    if (!user) return;
    if (qty <= 0) {
      await removeItem(itemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', itemId);
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('id', itemId);
    await refreshCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await refreshCart();
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const price = i.product?.price ?? 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, subtotal, addToCart, updateQuantity, removeItem, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
