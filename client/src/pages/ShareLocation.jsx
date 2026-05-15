import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket/socket';
import MapView from '../components/MapView';

const API = import.meta.env.VITE_API_URL;

const DURATIONS = [
  { label: '10 min', value: 10, desc: 'Quick check-in' },
  { label: '30 min', value: 30, desc: 'Short trip' },
  { label: '60 min', value: 60, desc: 'Long journey' },
  { label: '120 min', value: 120, desc: 'All day' },
];

export default function ShareLocation() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [duration, setDuration] = useState(10);
  const [session, setSession] = useState(null);
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);

  const startSharing = async () => {
    setError('');

    try {
      const { data } = await axios.post(`${API}/sessions`, {
        duration,
      });

      setSession(data);
      setStatus('sharing');
      setTimeLeft(duration * 60);

      const socket = getSocket(token);
      socketRef.current = socket;

      socket.emit('startSharing', {
        sessionId: data.sessionId,
      });

      intervalRef.current =
        navigator.geolocation.watchPosition(
          (pos) => {
            const {
              latitude: lat,
              longitude: lng,
            } = pos.coords;

            setPosition([lat, lng]);

            socket.emit('sendLocation', {
              sessionId: data.sessionId,
              lat,
              lng,
            });
          },
          () => setError('Location access denied'),
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
          }
        );

      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            stopSharing();
            return 0;
          }

          return t - 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to start session'
      );
    }
  };

  const stopSharing = async () => {
    if (intervalRef.current)
      navigator.geolocation.clearWatch(
        intervalRef.current
      );

    if (timerRef.current)
      clearInterval(timerRef.current);

    if (session)
      await axios
        .patch(
          `${API}/sessions/${session.sessionId}/stop`
        )
        .catch(() => {});

    setStatus('stopped');
  };

  useEffect(() => () => stopSharing(), []);

  const shareLink = session
    ? `${window.location.origin}/view/${session.sessionId}`
    : '';

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(
      2,
      '0'
    )}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-cyan-400 text-sm uppercase tracking-[0.25em] font-medium mb-2">
            Live Tracking
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Share Location
          </h1>

          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Generate a secure live location link for others.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Left Panel */}
          <div className="space-y-6">

            {/* Duration Picker */}
            {status === 'idle' && (
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <h2 className="text-sm uppercase tracking-[0.25em] text-slate-400 font-medium mb-5">
                  Session Duration
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() =>
                        setDuration(d.value)
                      }
                      className={`rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                        duration === d.value
                          ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg font-bold text-white">
                        {d.label}
                      </div>

                      <div className="text-sm text-slate-400 mt-1">
                        {d.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sharing Status */}
            {status === 'sharing' && (
              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/5 p-6 backdrop-blur-xl">

                <div className="flex items-center gap-3 mb-5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>

                  <span className="text-cyan-400 font-semibold">
                    Live Sharing Active
                  </span>
                </div>

                <div className="text-5xl font-bold text-white tracking-tight">
                  {fmt(timeLeft)}
                </div>

                <p className="text-slate-400 text-sm mt-1">
                  Remaining Time
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                  <p className="flex-1 truncate text-xs sm:text-sm text-slate-300 font-mono">
                    {shareLink}
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        shareLink
                      );
                      setCopied(true);

                      setTimeout(
                        () => setCopied(false),
                        2000
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm"
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Stopped */}
            {status === 'stopped' && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-5xl mb-4">
                  ⏹
                </div>

                <h3 className="text-white text-xl font-semibold">
                  Session Ended
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  This tracking link is no longer active.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {status === 'idle' && (
                <button
                  onClick={startSharing}
                  className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300"
                >
                  📍 Start Sharing
                </button>
              )}

              {status === 'sharing' && (
                <button
                  onClick={stopSharing}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all duration-300"
                >
                  ⏹ Stop Sharing
                </button>
              )}

              {status === 'stopped' && (
                <button
                  onClick={() => {
                    setStatus('idle');
                    setSession(null);
                    setPosition(null);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300"
                >
                  ↺ New Session
                </button>
              )}

              <button
                onClick={() =>
                  navigate('/dashboard')
                }
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl min-h-[500px]">
            <MapView
              position={position}
              username={user?.username}
            />

            {!position &&
              status === 'sharing' && (
                <p className="text-center text-slate-500 text-sm mt-4">
                  Waiting for GPS signal...
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}