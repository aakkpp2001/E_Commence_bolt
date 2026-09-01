import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= 35 || subtotal === 0 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-text-muted" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Sign in to view your cart</h1>
        <p className="mt-2 text-text-muted">Your shopping cart is tied to your account.</p>
        <Link
          to="/signin"
          className="btn-primary mt-6 inline-block rounded-lg px-6 py-3 font-semibold"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="skeleton h-12 w-48 rounded mb-4" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-text-muted" />
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Your cart is empty</h1>
        <p className="mt-2 text-text-muted">Browse our products and find something you love.</p>
        <Link
          to="/search"
          className="btn-primary mt-6 inline-block rounded-lg px-6 py-3 font-semibold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-text-primary">
        Shopping Cart <span className="text-lg font-normal text-text-muted">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-border bg-surface p-3 sm:p-4"
              >
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-text-muted">{product.brand}</span>
                      <Link
                        to={`/product/${product.slug}`}
                        className="block line-clamp-2 text-sm font-medium text-text-primary hover:text-primary-600 sm:text-base"
                      >
                        {product.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="shrink-0 rounded-lg p-1.5 text-text-muted transition hover:bg-error-500/10 hover:text-error-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-success-600 font-medium">In Stock</span>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1.5 text-text-secondary transition hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1.5 text-text-secondary transition hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-text-primary">
                        ${(product.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-text-muted">${product.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-lg font-bold text-text-primary">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal ({itemCount} items)</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? <span className="text-success-600">FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Estimated Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            {subtotal < 35 && subtotal > 0 && (
              <p className="rounded-lg bg-warning-500/10 px-3 py-2 text-xs text-warning-600">
                Add ${(35 - subtotal).toFixed(2)} more to get FREE shipping!
              </p>
            )}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-bold text-text-primary">Total</span>
            <span className="text-xl font-bold text-primary-600">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
          <Link
            to="/search"
            className="mt-2 block text-center text-sm font-medium text-secondary-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
