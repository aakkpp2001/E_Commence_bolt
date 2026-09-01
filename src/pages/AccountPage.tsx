import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, User, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Order, type Profile } from '@/lib/supabase';

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', state: '', zip: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [prof, ords] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      const p = prof.data as Profile | null;
      setProfile(p);
      if (p) {
        setForm({
          fullName: p.full_name ?? '',
          phone: p.phone ?? '',
          address: p.default_address?.address ?? '',
          city: p.default_address?.city ?? '',
          state: p.default_address?.state ?? '',
          zip: p.default_address?.zip ?? '',
        });
      }
      setOrders(ords.data ?? []);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.fullName,
      phone: form.phone,
      default_address: { address: form.address, city: form.city, state: form.state, zip: form.zip },
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Please sign in to view your account</h1>
        <Link to="/signin" className="btn-primary mt-4 inline-block rounded-lg px-6 py-3 font-semibold">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Your Account</h1>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="space-y-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-lg font-bold text-secondary-700">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{profile?.full_name ?? user.email}</p>
                <p className="truncate text-xs text-text-muted">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="rounded-xl border border-border bg-surface p-2">
            <Link to="/account" className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-700">
              <User size={18} /> Account Details
            </Link>
            <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-gray-50">
              <Package size={18} /> Your Orders
            </Link>
            <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-gray-50">
              Sign Out
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {saved && (
            <div className="rounded-lg border border-success-500/30 bg-success-500/10 px-4 py-3 text-sm font-medium text-success-600">
              Profile saved successfully!
            </div>
          )}

          {/* Profile section */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-sm font-medium text-secondary-600 hover:underline">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Full Name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
                />
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
                />
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500 sm:col-span-2"
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <input
                  placeholder="ZIP"
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  className="rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary-500"
                />
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" className="btn-primary rounded-lg px-6 py-2 text-sm font-semibold">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-6 py-2 text-sm font-semibold text-text-secondary transition hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-text-muted">Full Name</dt>
                  <dd className="font-medium text-text-primary">{profile?.full_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd className="font-medium text-text-primary">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Phone</dt>
                  <dd className="font-medium text-text-primary">{profile?.phone || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="flex items-center gap-1 text-text-muted"><MapPin size={14} /> Default Address</dt>
                  <dd className="font-medium text-text-primary">
                    {profile?.default_address?.address
                      ? `${profile.default_address.address}, ${profile.default_address.city ?? ''}, ${profile.default_address.state ?? ''} ${profile.default_address.zip ?? ''}`
                      : '—'}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Recent orders preview */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Recent Orders</h2>
              <Link to="/orders" className="flex items-center gap-1 text-sm font-medium text-secondary-600 hover:underline">
                See all <ChevronRight size={16} />
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-text-muted">You haven&apos;t placed any orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">${order.total.toFixed(2)}</p>
                      <span className="text-xs font-medium text-success-600 capitalize">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
