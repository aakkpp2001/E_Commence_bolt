import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

const categoryImages: Record<string, string> = {
  electronics: 'https://images.pexels.com/photos/14979013/pexels-photo-14979013.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  computers: 'https://images.pexels.com/photos/18311089/pexels-photo-18311089.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  audio: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  wearables: 'https://images.pexels.com/photos/31541678/pexels-photo-31541678.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  fashion: 'https://images.pexels.com/photos/38561616/pexels-photo-38561616.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  shoes: 'https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'home-kitchen': 'https://images.pexels.com/photos/36573009/pexels-photo-36573009.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  beauty: 'https://images.pexels.com/photos/36339062/pexels-photo-36339062.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  books: 'https://images.pexels.com/photos/8207315/pexels-photo-8207315.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  sports: 'https://images.pexels.com/photos/29342147/pexels-photo-29342147.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  accessories: 'https://images.pexels.com/photos/32677219/pexels-photo-32677219.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  gaming: 'https://images.pexels.com/photos/16070479/pexels-photo-16070479.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [feat, deal, cats, recent] = await Promise.all([
          supabase.from('products').select('*').eq('is_featured', true).limit(10),
          supabase.from('products').select('*').eq('is_deal', true).limit(10),
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('*').order('created_at', { ascending: false }).limit(10),
        ]);
        if (feat.error || deal.error || cats.error || recent.error) {
          console.error('DB fetch errors:', { feat: feat.error, deal: deal.error, cats: cats.error, recent: recent.error });
          setError(true);
        }
        setFeatured(feat.data ?? []);
        setDeals(deal.data ?? []);
        setCategories(cats.data ?? []);
        setNewArrivals(recent.data ?? []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-surface-dark via-surface-mid to-surface-dark">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url(https://images.pexels.com/photos/6956903/pexels-photo-6956903.jpeg?auto=compress&cs=tinysrgb&h=650&w=1260)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-20">
          <div className="max-w-2xl">
            <span className="animate-hero-slide inline-block rounded-full bg-primary-500/20 px-3 py-1 text-sm font-semibold text-primary-300" style={{ animationDelay: '0.1s' }}>
              Welcome to ShopVerse
            </span>
            <h1 className="animate-hero-slide mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl" style={{ animationDelay: '0.25s' }}>
              Everything you love, <span className="text-primary-400">delivered fast</span>
            </h1>
            <p className="animate-hero-slide mt-4 max-w-lg text-lg text-gray-300" style={{ animationDelay: '0.4s' }}>
              Shop millions of products across electronics, fashion, home, beauty and more. Free delivery on orders over $35.
            </p>
            <div className="animate-hero-slide mt-6 flex flex-wrap gap-3" style={{ animationDelay: '0.55s' }}>
              <Link
                to="/search?deals=true"
                className="btn-primary flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold"
              >
                <Zap size={20} /> Shop Today&apos;s Deals
              </Link>
              <Link
                to="/search"
                className="rounded-lg border border-gray-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4">
          {[
            { icon: <Truck size={28} />, title: 'Free Delivery', desc: 'On orders over $35' },
            { icon: <RotateCcw size={28} />, title: 'Easy Returns', desc: '30-day return policy' },
            { icon: <ShieldCheck size={28} />, title: 'Secure Payment', desc: 'Protected checkout' },
            { icon: <Zap size={28} />, title: 'Fast Shipping', desc: 'Same-day dispatch' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-primary-500">{item.icon}</div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-bold text-text-primary">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card-hover group flex flex-col items-center overflow-hidden rounded-xl border border-border bg-surface p-3"
            >
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                <img
                  src={categoryImages[cat.slug] ?? ''}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="mt-2 text-center text-sm font-medium text-text-primary">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-xl" />
            ))}
          </div>
        </div>
      ) : error && featured.length === 0 && deals.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <p className="text-lg font-semibold text-text-primary">We couldn&apos;t load products right now.</p>
          <p className="mt-1 text-sm text-text-muted">Please check your connection and try refreshing the page.</p>
        </div>
      ) : (
        <>
          {/* Deals section */}
          {deals.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                  <Zap className="text-primary-500" size={22} /> Today&apos;s Deals
                </h2>
                <Link to="/search?deals=true" className="flex items-center gap-1 text-sm font-medium text-secondary-600 hover:underline">
                  See all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {deals.slice(0, 5).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Featured products */}
          {featured.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">Featured Products</h2>
                <Link to="/search?featured=true" className="flex items-center gap-1 text-sm font-medium text-secondary-600 hover:underline">
                  See all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {featured.slice(0, 5).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Banner CTA */}
          <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-secondary-600 to-secondary-800 p-8 text-white sm:p-12">
              <div className="max-w-lg">
                <h3 className="text-2xl font-bold sm:text-3xl">New to ShopVerse?</h3>
                <p className="mt-2 text-secondary-100">
                  Create an account today and get 10% off your first order. Plus, track orders, save favorites, and check out faster.
                </p>
                <Link
                  to="/signup"
                  className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-secondary-700 transition hover:bg-secondary-50"
                >
                  Create Your Account
                </Link>
              </div>
            </div>
          </section>

          {/* New arrivals */}
          {newArrivals.length > 0 && (
            <section className="mx-auto max-w-7xl px-4 py-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">New Arrivals</h2>
                <Link to="/search" className="flex items-center gap-1 text-sm font-medium text-secondary-600 hover:underline">
                  See all <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {newArrivals.slice(0, 5).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
