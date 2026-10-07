import React, { useState } from 'react';
import { Bus, MapPin, Navigation, Compass, Layers, Info } from 'lucide-react';
import { BusService } from '../types/transit';

interface ServiceMapViewProps {
  onSelectService: (service: BusService) => void;
  onNavigateToNearby: () => void;
  allServices: Record<string, BusService>;
}

export const ServiceMapView: React.FC<ServiceMapViewProps> = ({
  onSelectService,
  onNavigateToNearby,
  allServices,
}) => {
  const [activeCorridor, setActiveCorridor] = useState<'all' | '65' | '190' | '147'>('all');
  const [selectedStation, setSelectedStation] = useState<string | null>('Dhoby Ghaut Stn Exit B');

  const stations = [
    { id: 'dhoby', code: '08031', name: 'Dhoby Ghaut Stn Exit B', x: 380, y: 150, nsl: true, nel: true, ccl: true, active: true },
    { id: 'somerset', code: '09037', name: 'Somerset Stn / 313@Somerset', x: 260, y: 160, nsl: true },
    { id: 'orchard', code: '09059', name: 'Bef Orchard Stn Exit B', x: 160, y: 175, nsl: true, tel: true },
    { id: 'greatworld', code: '13019', name: 'Opp Great World City', x: 210, y: 280, tel: true },
    { id: 'clarkequay', code: '04229', name: 'Clarke Quay Stn Exit E', x: 440, y: 270, nel: true },
    { id: 'chinatown', code: '05013', name: 'Chinatown Stn Exit E', x: 410, y: 350, nel: true, dtl: true },
    { id: 'cityhall', code: '04169', name: 'City Hall Stn', x: 520, y: 220, nsl: true, ewl: true },
    { id: 'marinabay', code: '03391', name: 'The Sail / Marina Bay', x: 570, y: 340, dtl: true, tel: true },
    { id: 'harbourfront', code: '14009', name: 'HarbourFront Int (Terminus)', x: 240, y: 460, nel: true, ccl: true },
  ];

  const busLocations = [
    { plate: 'SBS8492L', service: '65', x: 340, y: 155, speed: '18 km/h', status: 'At Penang Rd jct' },
    { plate: 'SMB5011R', service: '190', x: 400, y: 210, speed: '28 km/h', status: 'Passing Bras Basah' },
    { plate: 'SG5821Y', service: '857', x: 460, y: 180, speed: '14 km/h', status: 'Bencoolen Link' },
    { plate: 'SBS6722D', service: '147', x: 425, y: 310, speed: '32 km/h', status: 'Approaching Chinatown' },
  ];

  return (
    <div className="max-w-[1500px] mx-auto p-4 lg:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700" />
            <span>Singapore Transit Central Corridor Service Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time AVL GPS telemetric positions superimposed on Singapore MRT & bus trunk lines.
          </p>
        </div>

        {/* Filter corridor */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold">
          <span className="text-slate-400 px-2 text-[11px]">Filter Route:</span>
          {(['all', '65', '190', '147'] as const).map(corridor => (
            <button
              key={corridor}
              onClick={() => setActiveCorridor(corridor)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeCorridor === corridor
                  ? 'bg-[#00704A] text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {corridor === 'all' ? 'All Corridors' : `Service ${corridor}`}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-md relative overflow-hidden min-h-[520px]">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          {/* Map Overlay Header */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-semibold text-emerald-400">LIVE AVL GPS STREAM</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">Orchard Rd / River Valley Sector</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Refresh Interval: 15s
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg className="w-full h-[460px] relative z-10" viewBox="0 0 700 500">
            {/* Route Lines */}
            {/* Route 65 Path: Dhoby Ghaut -> Somerset -> Paterson -> Great World -> Lower Delta -> HarbourFront */}
            {(activeCorridor === 'all' || activeCorridor === '65') && (
              <path
                d="M 380 150 L 260 160 L 160 175 L 210 280 L 190 380 L 240 460"
                fill="none"
                stroke="#10B981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-90"
              />
            )}

            {/* Route 190 Path: Dhoby Ghaut -> Clarke Quay -> Chinatown -> Kampong Bahru */}
            {(activeCorridor === 'all' || activeCorridor === '190') && (
              <path
                d="M 380 150 L 440 270 L 410 350 L 320 440"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
            )}

            {/* Route 147 Path: Dhoby Ghaut -> City Hall / Chinatown -> Queenstown */}
            {(activeCorridor === 'all' || activeCorridor === '147') && (
              <path
                d="M 380 150 L 470 200 L 440 270 L 410 350 L 280 400"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
            )}

            {/* Station Nodes */}
            {stations.map(station => (
              <g
                key={station.id}
                className="cursor-pointer group"
                onClick={() => setSelectedStation(station.name)}
              >
                {/* Node Outer Halo */}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={station.active ? 10 : 7}
                  fill={station.active ? '#10B981' : '#1E293B'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-all group-hover:scale-125"
                />

                {/* Node Code/Name Text */}
                <text
                  x={station.x + 12}
                  y={station.y + 4}
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {station.name.split(' ')[0]}
                </text>
              </g>
            ))}

            {/* Live Moving Buses */}
            {busLocations.map(bus => (
              <g key={bus.plate} className="cursor-pointer group">
                <circle
                  cx={bus.x}
                  cy={bus.y}
                  r="14"
                  fill="#00704A"
                  stroke="#34D399"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <text
                  x={bus.x}
                  y={bus.y + 3}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {bus.service}
                </text>

                {/* Callout tooltip */}
                <g transform={`translate(${bus.x - 35}, ${bus.y - 28})`}>
                  <rect
                    width="70"
                    height="18"
                    rx="4"
                    fill="#0F172A"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <text
                    x="35"
                    y="12"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    #{bus.plate}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>

        {/* Selected Point Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Inspected Node Details</h3>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mb-4">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Currently Selected</span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedStation}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Singapore Central Shopping & Transit Hub (Triple MRT Interchange NSL / NEL / CCL)
              </p>
            </div>

            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
              Tracked Fleet Vehicles on Vector
            </h4>

            <div className="space-y-2">
              {busLocations.map(bus => (
                <div
                  key={bus.plate}
                  onClick={() => {
                    if (allServices[bus.service]) {
                      onSelectService(allServices[bus.service]);
                      onNavigateToNearby();
                    }
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#00704A] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {bus.service}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-slate-800">#{bus.plate}</div>
                      <div className="text-[10px] text-slate-400">{bus.status}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-700">{bus.speed}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onNavigateToNearby}
              className="w-full mt-4 py-2 bg-[#00704A] hover:bg-[#005a3b] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Back to Telemetry Arrival Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
