import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Menu, ChevronDown, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Category } from '@/lib/supabase';

export default function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-surface-dark text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-4">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-1">
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              Shop<span className="text-primary-400">Verse</span>
            </span>
          </Link>

          {/* Deliver to */}
          <div className="hidden items-center gap-1 px-2 text-xs lg:flex">
            <MapPin size={16} className="text-text-muted" />
            <div>
              <p className="text-xs text-gray-400">Deliver to</p>
              <p className="text-sm font-semibold leading-none">United States</p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-1 items-center">
            <div className="flex w-full overflow-hidden rounded-md ring-2 ring-transparent transition focus-within:ring-primary-500">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full px-3 py-2 text-sm text-text-primary outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-primary-500 px-3 text-white transition hover:bg-primary-600 sm:px-4"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Account */}
          <div className="relative hidden items-center sm:flex" ref={accountRef}>
            {user ? (
              <>
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-sm transition hover:bg-surface-mid"
                >
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Hello, {user.email?.split('@')[0]}</p>
                    <p className="flex items-center gap-0.5 text-sm font-semibold leading-none">
                      Account <ChevronDown size={14} />
                    </p>
                  </div>
                </button>
                {accountOpen && (
                  <div className="animate-scale-in absolute right-0 top-full mt-1 w-52 overflow-hidden rounded-lg border border-border bg-surface py-1 text-text-primary shadow-xl">
                    <Link to="/account" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Your Account
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Your Orders
                    </Link>
                    <button
                      onClick={() => { setAccountOpen(false); signOut(); }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/signin" className="flex items-center gap-1 rounded px-2 py-1 text-sm transition hover:bg-surface-mid">
                <User size={18} />
                <span className="font-semibold">Sign In</span>
              </Link>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex shrink-0 items-center gap-1 rounded px-2 py-1 transition hover:bg-surface-mid"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden text-sm font-semibold sm:inline">Cart</span>
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded p-1 transition hover:bg-surface-mid lg:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="hidden bg-surface-mid text-white lg:block">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5">
          <Link to="/" className="rounded px-2 py-1 text-sm font-medium transition hover:bg-surface-dark">
            Home
          </Link>
          <Link to="/search?deals=true" className="rounded px-2 py-1 text-sm font-medium transition hover:bg-surface-dark">
            Today&apos;s Deals
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="rounded px-2 py-1 text-sm font-medium transition hover:bg-surface-dark"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-fade-in border-b border-border bg-surface lg:hidden">
          <nav className="flex flex-col px-3 py-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Home
            </Link>
            <Link to="/search?deals=true" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Today&apos;s Deals
            </Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-50">
                  Your Account
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-50">
                  Your Orders
                </Link>
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="rounded px-3 py-2 text-left text-sm font-medium hover:bg-gray-50">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/signin" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-gray-50">
                Sign In
              </Link>
            )}
            <hr className="my-1 border-border" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2 text-sm hover:bg-gray-50"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
