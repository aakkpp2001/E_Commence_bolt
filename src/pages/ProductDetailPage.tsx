import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ShoppingCart, Check, Truck, RotateCcw, ShieldCheck, Minus, Plus } from 'lucide-react';
import { supabase, type Product, type Review, type Category } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    setAdded(false);
    (async () => {
      try {
        const { data: prod, error: prodError } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
        if (prodError) console.error('Product fetch error:', prodError);
        if (!prod) {
          setLoading(false);
          return;
        }
        setProduct(prod as Product);

        const [revs, cat, rel] = await Promise.all([
          supabase.from('reviews').select('*').eq('product_id', prod.id).order('created_at', { ascending: false }),
          prod.category_id ? supabase.from('categories').select('*').eq('id', prod.category_id).maybeSingle() : Promise.resolve({ data: null }),
          supabase.from('products').select('*').neq('id', prod.id).limit(6),
        ]);

        if (revs.error) console.error('Reviews fetch error:', revs.error);
        if (rel.error) console.error('Related fetch error:', rel.error);
        setReviews(revs.data ?? []);
        setCategory(cat.data as Category | null);
        setRelated(rel.data ?? []);
      } catch (err) {
        console.error('Failed to fetch product detail:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      navigate('/signin');
      return;
    }
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    if (reviewForm.comment.trim().length < 5) {
      setReviewError('Please write at least a few words.');
      return;
    }
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      author_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Anonymous',
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    });
    if (error) {
      setReviewError(error.message);
      return;
    }
    setReviewSubmitted(true);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
    const { data: revData } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
    setReviews(revData ?? []);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-xl" />
          <div className="space-y-3">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-24 rounded" />
            <div className="skeleton h-10 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/" className="mt-4 inline-block text-secondary-600 hover:underline">Return to home</Link>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted">
        <Link to="/" className="flex items-center hover:text-primary-500"><Home size={14} /></Link>
        <ChevronRight size={14} />
        {category && (
          <>
            <Link to={`/category/${category.slug}`} className="hover:text-primary-500">{category.name}</Link>
            <ChevronRight size={14} />
          </>
        )}
        <span className="line-clamp-1 text-text-primary">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_300px]">
        {/* Images */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <img
              src={product.images[activeImage]}
              alt={product.title}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === i ? 'border-primary-500' : 'border-border hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-sm font-medium text-text-muted">{product.brand}</span>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">{product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.rating} size={18} showNumber />
            <span className="text-sm text-text-muted">{product.review_count.toLocaleString()} ratings</span>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-text-primary">${product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <>
                  <span className="text-lg text-text-muted line-through">${product.compare_at_price.toFixed(2)}</span>
                  <span className="rounded bg-error-500/10 px-2 py-0.5 text-sm font-bold text-error-600">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-text-muted">FREE delivery on orders over $35</p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{product.description}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Truck size={18} className="text-success-500" />
              <span className="text-text-secondary">Free & Fast Shipping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw size={18} className="text-secondary-500" />
              <span className="text-text-secondary">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-success-500" />
              <span className="text-text-secondary">2-Year Warranty</span>
            </div>
          </div>

          {product.stock > 0 ? (
            <p className="mt-4 text-sm font-medium text-success-600">In Stock ({product.stock} available)</p>
          ) : (
            <p className="mt-4 text-sm font-medium text-error-600">Out of Stock</p>
          )}
        </div>

        {/* Buy box */}
        <div className="h-fit rounded-xl border border-border bg-surface p-4">
          <p className="text-2xl font-bold text-text-primary">${product.price.toFixed(2)}</p>
          <p className="mt-1 text-sm text-success-600">FREE delivery in 2-3 days</p>
          <p className="mt-1 text-sm font-medium text-text-primary">In Stock</p>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Qty:</span>
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-1.5 text-text-secondary transition hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-2.5 py-1.5 text-text-secondary transition hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Cart</>}
          </button>
          {!user && (
            <p className="mt-2 text-center text-xs text-text-muted">
              <Link to="/signin" className="text-secondary-600 hover:underline">Sign in</Link> to add to cart
            </p>
          )}

          <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-text-muted">
            <p>Ships from ShopVerse</p>
            <p>Sold by ShopVerse</p>
            <p>Payment secured by Supabase Auth</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-text-primary">Customer Reviews</h2>
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Review summary + form */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-text-primary">{product.rating.toFixed(1)}</p>
                <StarRating rating={product.rating} size={18} className="mt-1 justify-center" />
                <p className="mt-1 text-sm text-text-muted">{product.review_count.toLocaleString()} global ratings</p>
              </div>
            </div>

            {user && !reviewSubmitted && (
              <form onSubmit={handleReviewSubmit} className="rounded-xl border border-border bg-surface p-4">
                <h3 className="mb-3 font-semibold text-text-primary">Write a Review</h3>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Your Rating</label>
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="text-2xl transition"
                    >
                      <span className={star <= reviewForm.rating ? 'text-accent-400' : 'text-gray-300'}>&#9733;</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your thoughts about this product..."
                  className="w-full rounded-lg border border-border p-2.5 text-sm outline-none focus:border-primary-500"
                  rows={3}
                />
                {reviewError && <p className="mt-1.5 text-xs text-error-600">{reviewError}</p>}
                <button type="submit" className="btn-primary mt-2 w-full rounded-lg py-2 text-sm font-semibold">
                  Submit Review
                </button>
              </form>
            )}
            {reviewSubmitted && (
              <div className="rounded-xl border border-success-500/30 bg-success-500/5 p-4 text-center">
                <Check className="mx-auto text-success-500" size={28} />
                <p className="mt-2 text-sm font-medium text-success-600">Review submitted! Thank you.</p>
              </div>
            )}
            {!user && (
              <div className="rounded-xl border border-border bg-surface p-4 text-center text-sm text-text-muted">
                <Link to="/signin" className="font-semibold text-secondary-600 hover:underline">Sign in</Link> to write a review
              </div>
            )}
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-muted">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-sm font-bold text-secondary-700">
                      {rev.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{rev.author_name}</p>
                      <StarRating rating={rev.rating} size={14} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">{rev.comment}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    {new Date(rev.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-text-primary">You might also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {related.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
