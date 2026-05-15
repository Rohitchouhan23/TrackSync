import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-cyan-500/5">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300">
              📍
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-lg tracking-wide">
                TrackSync
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.25em]">
                Live Tracker
              </span>
            </div>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">

            {user ? (
              <>
                {/* Username */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-sm text-slate-300 font-medium">
                    @{user.username}
                  </span>
                </div>

                {/* Share Button */}
                <Link
                  to="/share"
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">Share Location</span>
                  <span className="sm:hidden">Share</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 text-sm font-semibold shadow-md hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}