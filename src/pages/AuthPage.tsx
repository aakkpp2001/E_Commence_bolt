import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <Link to="/" className="text-2xl font-extrabold">
              Shop<span className="text-primary-500">Verse</span>
            </Link>
            <h1 className="mt-4 text-xl font-bold text-text-primary">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {isSignUp ? 'Join ShopVerse and start shopping today' : 'Welcome back! Please enter your details.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Full Name</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-lg py-3 font-semibold disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            {isSignUp ? (
              <>Already have an account? <Link to="/signin" className="font-semibold text-secondary-600 hover:underline">Sign in</Link></>
            ) : (
              <>Don&apos;t have an account? <Link to="/signup" className="font-semibold text-secondary-600 hover:underline">Sign up</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
