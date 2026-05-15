import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import MapView from '../components/MapView';

const API = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function ViewLocation() {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [updates, setUpdates] = useState(0);
  const [lastSeen, setLastSeen] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.get(
          `${API}/sessions/${sessionId}`
        );

        setSession(data);

        const socket = io(SOCKET_URL, {
          transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.emit('watchSession', {
          sessionId,
        });

        socket.on(
          'locationUpdate',
          ({ lat, lng, timestamp }) => {
            setPosition([lat, lng]);
            setUpdates((u) => u + 1);
            setLastSeen(new Date(timestamp));
          }
        );

        socket.on(
          'sessionExpired',
          () =>
            setError(
              'Session has expired'
            )
        );
      } catch {
        setError(
          'Session not found or expired'
        );
      }
    };

    init();

    return () =>
      socketRef.current?.disconnect();
  }, [sessionId]);

  const timeLeft = session
    ? Math.max(
        0,
        Math.round(
          (new Date(session.expiresAt) -
            Date.now()) /
            60000
        )
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className={`w-3 h-3 rounded-full ${
                position
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-slate-600'
              }`}
            ></span>

            <h1 className="text-2xl sm:text-4xl font-bold text-white">
              {session
                ? `@${session.sender?.username}'s Location`
                : 'Loading Session...'}
            </h1>
          </div>

          <p className="text-slate-400 text-sm sm:text-base">
            Live tracking • Read-only secure view
          </p>
        </div>

        {/* Error State */}
        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 sm:p-10 text-center backdrop-blur-xl">
            <div className="text-5xl mb-4">
              ⚠️
            </div>

            <h2 className="text-xl font-semibold text-red-400">
              {error}
            </h2>

            <p className="text-sm text-red-300/70 mt-2">
              This tracking link may
              have expired or been
              stopped.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Stats Panel */}
            <div className="space-y-4">

              {[
                {
                  label:
                    'Time Remaining',
                  value: session
                    ? `${timeLeft}m`
                    : '—',
                  color:
                    'text-cyan-400',
                  icon: '⏳',
                },
                {
                  label:
                    'Location Updates',
                  value: updates,
                  color:
                    'text-white',
                  icon: '📍',
                },
                {
                  label: 'Last Seen',
                  value: lastSeen
                    ? lastSeen.toLocaleTimeString()
                    : 'Waiting...',
                  color:
                    'text-slate-300',
                  icon: '🕒',
                },
                {
                  label:
                    'Coordinates',
                  value: position
                    ? `${position[0].toFixed(
                        4
                      )}, ${position[1].toFixed(
                        4
                      )}`
                    : '—',
                  color:
                    'text-slate-400',
                  icon: '🌐',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:border-cyan-400/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">
                      {s.icon}
                    </span>

                    <span
                      className={`text-sm font-semibold ${s.color}`}
                    >
                      {s.value}
                    </span>
                  </div>

                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {s.label}
                  </p>
                </div>
              ))}

              {!position && !error && (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6 text-center backdrop-blur-xl">
                  <div className="text-4xl mb-3">
                    📡
                  </div>

                  <p className="text-sm text-cyan-400 font-medium">
                    Waiting for sender
                    to share location...
                  </p>
                </div>
              )}
            </div>

            {/* Map Panel */}
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl min-h-[500px]">
              <MapView
                position={position}
                username={
                  session?.sender
                    ?.username
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}