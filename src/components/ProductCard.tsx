import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import StarRating from './StarRating';

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/signin');
      return;
    }
    await addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const img = product.images?.[0] ?? '';

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={img}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-error-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            -{discount}%
          </span>
        )}
        {product.is_deal && (
          <span className="absolute right-2 top-2 rounded-md bg-primary-500 px-2 py-0.5 text-xs font-bold text-white shadow">
            Deal
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className="text-xs font-medium text-text-muted">{product.brand}</span>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-text-primary">{product.title}</h3>
        <div className="mt-1.5">
          <StarRating rating={product.rating} size={13} showNumber reviewCount={product.review_count} />
        </div>
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">${product.price.toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-text-muted line-through">${product.compare_at_price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
