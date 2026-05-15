import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-4xl shadow-lg shadow-cyan-500/20 mb-5">
            🚀
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Create Account
          </h1>

          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Join <span className="text-cyan-400 font-medium">TrackSync</span> today
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10">

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {[
              {
                key: 'username',
                label: 'Username',
                type: 'text',
                ph: 'yourname',
              },
              {
                key: 'email',
                label: 'Email Address',
                type: 'email',
                ph: 'you@example.com',
              },
              {
                key: 'password',
                label: 'Password',
                type: 'password',
                ph: '••••••••',
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  {f.label}
                </label>

                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [f.key]: e.target.value,
                    }))
                  }
                  placeholder={f.ph}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                />
              </div>
            ))}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3.5 text-sm sm:text-base font-bold text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Fast signup • Secure access • Real-time tracking
        </p>
      </div>
    </div>
  );
}