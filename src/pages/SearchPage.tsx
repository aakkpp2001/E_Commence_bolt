import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, Home } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';

export default function SearchPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const dealsOnly = searchParams.get('deals') === 'true';
  const featuredOnly = searchParams.get('featured') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 2000 });

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? []);
      if (slug) {
        setCurrentCategory(data?.find((c) => c.slug === slug) ?? null);
      }
    });
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        let q = supabase.from('products').select('*');

        if (slug) {
          const cat = categories.find((c) => c.slug === slug);
          if (cat) q = q.eq('category_id', cat.id);
        }
        if (dealsOnly) q = q.eq('is_deal', true);
        if (featuredOnly) q = q.eq('is_featured', true);
        if (query) {
          q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);
        }

        const { data, error } = await q.order('created_at', { ascending: false });
        if (error) console.error('Search fetch error:', error);
        setProducts(data ?? []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, query, dealsOnly, featuredOnly, categories]);

  // Get unique brands
  const brands = [...new Set(products.map((p) => p.brand))].filter(Boolean).sort();

  // Filter + sort
  const filtered = products
    .filter((p) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (p.price < priceRange.min || p.price > priceRange.max) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return b.review_count - a.review_count;
      }
    });

  const title = currentCategory?.name
    ?? (dealsOnly ? "Today's Deals" : featuredOnly ? 'Featured Products' : query ? `Results for "${query}"` : 'All Products');

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-bold text-text-primary">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
            className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary-500"
            placeholder="Min"
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
            className="w-full rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary-500"
            placeholder="Max"
          />
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-text-primary">Brands</h3>
          <div className="space-y-1.5">
            {brands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded accent-primary-500"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-text-primary">Categories</h3>
        <div className="space-y-1.5">
          <Link to="/search" className="block text-sm text-secondary-600 hover:underline">All Categories</Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className={`block text-sm hover:underline ${currentCategory?.id === cat.id ? 'font-bold text-primary-600' : 'text-text-secondary'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {(selectedBrands.length > 0 || priceRange.min > 0 || priceRange.max < 2000) && (
        <button
          onClick={() => { setSelectedBrands([]); setPriceRange({ min: 0, max: 2000 }); }}
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-text-secondary transition hover:bg-gray-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-text-muted">
        <Link to="/" className="flex items-center hover:text-primary-500"><Home size={14} /></Link>
        <ChevronRight size={14} />
        <span className="text-text-primary">{title}</span>
      </nav>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary sm:text-2xl">{title}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-secondary transition hover:bg-gray-50 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary outline-none focus:border-primary-500"
          >
            <option value="relevance">Most Relevant</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Avg. Customer Rating</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-32 rounded-xl border border-border bg-surface p-4">
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="animate-slide-in absolute right-0 top-0 h-full w-72 overflow-y-auto bg-surface p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)}><X size={20} /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <p className="text-lg font-semibold text-text-primary">No products found</p>
              <p className="mt-1 text-sm text-text-muted">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-text-muted">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
