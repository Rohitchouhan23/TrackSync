import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/SessionCard';

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [copied, setCopied] = useState('');

  const fetchSessions = async () => {
    const { data } = await axios.get(`${API}/sessions/mine`);
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStop = async (sessionId) => {
    await axios.patch(`${API}/sessions/${sessionId}/stop`);
    fetchSessions();
  };

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopied(link);
    setTimeout(() => setCopied(''), 2000);
  };

  const active = sessions.filter(
    (s) => s.active && new Date(s.expiresAt) > new Date()
  );

  const past = sessions.filter(
    (s) => !s.active || new Date(s.expiresAt) <= new Date()
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 overflow-hidden">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-cyan-400 text-sm font-medium tracking-widest uppercase mb-2">
              Dashboard
            </p>

            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight break-words">
              Hey,{' '}
              <span className="text-cyan-400 break-all">
                @{user?.username}
              </span>{' '}
              👋
            </h1>

            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Manage your live location sessions easily.
            </p>
          </div>

          <Link
            to="/share"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 hover:scale-[1.03] transition-all duration-300"
          >
            📍 Share Location
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: 'Active Sessions',
              value: active.length,
              color: 'text-cyan-400',
              icon: '🟢',
            },
            {
              label: 'Total Sessions',
              value: sessions.length,
              color: 'text-white',
              icon: '📦',
            },
            {
              label: 'Expired',
              value: past.length,
              color: 'text-slate-400',
              icon: '⏳',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="w-full min-w-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{s.icon}</span>

                <span
                  className={`text-3xl font-bold ${s.color}`}
                >
                  {s.value}
                </span>
              </div>

              <p className="text-sm text-slate-400 break-words">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <Link
          to="/share"
          className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl border border-cyan-400/20 bg-cyan-500/5 p-5 sm:p-6 mb-10 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-all duration-300 overflow-hidden"
        >
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
            📍
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-colors break-words">
              Share Your Live Location
            </h3>

            <p className="text-sm text-slate-400 mt-1 break-words">
              Create a secure time-limited tracking session instantly.
            </p>
          </div>

          <span className="text-cyan-400 text-xl group-hover:translate-x-1 transition-transform duration-300 shrink-0">
            →
          </span>
        </Link>

        {/* Active Sessions */}
        {active.length > 0 && (
          <div className="mb-10 overflow-hidden">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>

              <h2 className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                Active Sessions
              </h2>
            </div>

            <div className="grid gap-4 w-full min-w-0">
              {active.map((s) => (
                <div
                  key={s.sessionId}
                  className="w-full min-w-0 overflow-hidden"
                >
                  <SessionCard
                    session={s}
                    onStop={handleStop}
                    onCopy={handleCopy}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {past.length > 0 && (
          <div className="mb-10 overflow-hidden">
            <h2 className="text-sm uppercase tracking-[0.25em] text-slate-500 font-semibold mb-5">
              Past Sessions
            </h2>

            <div className="grid gap-4 w-full min-w-0">
              {past.map((s) => (
                <div
                  key={s.sessionId}
                  className="w-full min-w-0 overflow-hidden"
                >
                  <SessionCard
                    session={s}
                    onStop={handleStop}
                    onCopy={handleCopy}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 px-6 text-center overflow-hidden">
            <div className="text-6xl mb-5">🗺️</div>

            <h3 className="text-white text-xl font-semibold mb-2">
              No Sessions Yet
            </h3>

            <p className="text-slate-400 text-sm sm:text-base mb-6">
              Share your location to create your first session.
            </p>

            <Link
              to="/share"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:scale-105 transition-all duration-300"
            >
              📍 Start Now
            </Link>
          </div>
        )}

        {/* Copy Toast */}
        {copied && (
          <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-2xl text-center animate-bounce">
            ✓ Link Copied!
          </div>
        )}
      </div>
    </div>
  );
}