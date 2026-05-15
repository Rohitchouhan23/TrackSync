import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pulseIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px">
      <div style="position:absolute;inset:0;background:#06b6d4;border-radius:50%;opacity:0.3;animation:ping 1.5s infinite"></div>
      <div style="position:absolute;inset:4px;background:#06b6d4;border-radius:50%;border:2px solid white;box-shadow:0 0 15px #06b6d4"></div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FlyTo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1.2 });
  }, [position]);

  return null;
}

export default function MapView({ position, username = 'User' }) {
  const center = position || [20.5937, 78.9629];

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-cyan-400/30 bg-slate-900 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_35px_rgba(6,182,212,0.45)]">
      
      <style>{`
        @keyframes ping{
          0%,100%{transform:scale(1);opacity:0.3}
          50%{transform:scale(1.8);opacity:0}
        }

        .leaflet-container{
          background:#0f172a;
          font-family:Inter, sans-serif;
        }

        .leaflet-popup-content-wrapper{
          background:#0f172a;
          color:white;
          border-radius:12px;
          border:1px solid rgba(34,211,238,0.4);
          box-shadow:0 0 20px rgba(34,211,238,0.2);
        }

        .leaflet-popup-tip{
          background:#0f172a;
        }

        .leaflet-control-zoom a{
          background:#111827 !important;
          color:#22d3ee !important;
          border:none !important;
        }

        .leaflet-control-zoom a:hover{
          background:#06b6d4 !important;
          color:white !important;
        }
      `}</style>

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-400/20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-white tracking-wide">
          📍 Live Location Tracker
        </h2>

        <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
          {username}
        </span>
      </div>

      {/* Map */}
      <div className="w-full h-[350px] sm:h-[450px] md:h-[550px]">
        <MapContainer
          center={center}
          zoom={position ? 16 : 5}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
          />

          {position && (
            <>
              <FlyTo position={position} />

              <Marker position={position} icon={pulseIcon}>
                <Popup>
                  <div className="text-sm font-medium">
                    📌 {username} is here
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>

      {/* Bottom Status */}
      <div className="px-4 sm:px-6 py-3 border-t border-cyan-400/20 bg-slate-900 flex justify-between items-center">
        <p className="text-xs sm:text-sm text-slate-300">
          {position ? 'Live tracking active' : 'Waiting for location...'}
        </p>

        <div className="flex items-center gap-2 text-cyan-400 text-xs sm:text-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Online
        </div>
      </div>
    </div>
  );
}