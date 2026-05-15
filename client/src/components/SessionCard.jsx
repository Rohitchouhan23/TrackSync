export default function SessionCard({ session, onStop, onCopy }) {
  const isActive =
    session.active && new Date(session.expiresAt) > new Date();

  const timeLeft = Math.max(
    0,
    Math.round(
      (new Date(session.expiresAt) - Date.now()) / 60000
    )
  );

  const link = `${window.location.origin}/view/${session.sessionId}`;

  return (
    <div
      className={`group rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isActive
          ? 'border-cyan-400/30 bg-cyan-500/5 shadow-cyan-500/10'
          : 'border-white/10 bg-white/5 shadow-black/20'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isActive
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.9)]'
                : 'bg-slate-500'
            }`}
          />

          <span
            className={`text-xs sm:text-sm font-semibold tracking-wide ${
              isActive ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            {isActive
              ? `Active • ${timeLeft}m left`
              : 'Expired'}
          </span>
        </div>

        {/* Duration */}
        <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10 w-fit">
          {session.duration} min session
        </span>
      </div>

      {/* Link */}
      <div className="mb-4">
        <p className="text-xs sm:text-sm font-mono text-slate-400 truncate bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2">
          {link}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

        {/* Copy Button */}
        <button
          onClick={() => onCopy(link)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
        >
          📋 Copy Link
        </button>

        {/* Stop Button */}
        {isActive && (
          <button
            onClick={() => onStop(session.sessionId)}
            className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300"
          >
            ⏹ Stop Session
          </button>
        )}
      </div>
    </div>
  );
}