import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Order } from '@/lib/supabase';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setOrders(data ?? []);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Please sign in to view your orders</h1>
        <Link to="/signin" className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-semibold">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Your Orders</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Package size={48} className="mx-auto text-text-muted" />
          <p className="mt-4 text-lg font-semibold text-text-primary">No orders yet</p>
          <p className="mt-1 text-sm text-text-muted">When you place orders, they&apos;ll appear here.</p>
          <Link to="/search" className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-semibold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-gray-50 px-4 py-3">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-xs text-text-muted">Order Placed</p>
                    <p className="font-medium text-text-primary">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Total</p>
                    <p className="font-medium text-text-primary">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Order ID</p>
                    <p className="font-medium text-text-primary">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <span className="rounded-full bg-success-500/10 px-3 py-1 text-sm font-medium capitalize text-success-600">
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 p-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-sm font-medium text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity} · ${item.price.toFixed(2)} each</p>
                    </div>
                    <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-end border-t border-border pt-3 text-sm text-text-muted">
                  Shipping to: {order.shipping_address?.fullName ?? '—'}, {order.shipping_address?.city ?? ''}, {order.shipping_address?.state ?? ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
