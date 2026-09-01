import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [form, setForm] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProcessing(true);

    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      title: item.product?.title ?? '',
      price: item.product?.price ?? 0,
      quantity: item.quantity,
      image: item.product?.images?.[0] ?? '',
    }));

    const { data, error } = await supabase.from('orders').insert({
      user_id: user.id,
      status: 'confirmed',
      total,
      shipping_address: {
        fullName: form.fullName,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
      },
      items: orderItems,
    }).select('id').single();

    setProcessing(false);

    if (error) {
      alert('Order failed: ' + error.message);
      return;
    }

    setOrderId(data.id);
    await clearCart();
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-500/10">
          <Check size={40} className="text-success-600" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Order Confirmed!</h1>
        <p className="mt-2 text-text-secondary">Thank you for your purchase. Your order has been placed successfully.</p>
        <p className="mt-1 text-sm text-text-muted">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders" className="btn-primary rounded-lg px-6 py-3 font-semibold">View Your Orders</Link>
          <Link to="/search" className="rounded-lg border border-border px-6 py-3 font-semibold text-text-secondary transition hover:bg-gray-50">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Your cart is empty</h1>
        <Link to="/search" className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-semibold">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Shipping */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-600 text-xs text-white">1</span>
              Shipping Address
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
              />
              <input
                required
                placeholder="Street Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
              />
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <input
                required
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <input
                required
                placeholder="ZIP Code"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <input
                required
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-600 text-xs text-white">2</span>
              Payment Method
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Card Number"
                value={form.cardNumber}
                onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
              />
              <input
                required
                placeholder="Name on Card"
                value={form.cardName}
                onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
              />
              <input
                required
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
              <input
                required
                placeholder="CVV"
                value={form.cvv}
                onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
              <Lock size={14} /> This is a demo store. No real payment will be processed.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-lg font-bold text-text-primary">Your Order</h2>
          <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <img src={item.product?.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-xs font-medium text-text-primary">{item.product?.title}</p>
                  <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">${((item.product?.price ?? 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? <span className="text-success-600">FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-bold text-text-primary">Total</span>
            <span className="text-xl font-bold text-primary-600">${total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <><CreditCard size={18} /> Place Order</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
