import React from 'react';
import { Navigation, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { BusStop } from '../types/transit';

interface TelemetryBarProps {
  gpsCoords: string;
  gpsAccuracy: string;
  busStops: BusStop[];
  selectedStopCode: string;
  onSelectStopCode: (code: string) => void;
  radiusFilter: '200m' | '500m' | '1km';
  onChangeRadius: (val: '200m' | '500m' | '1km') => void;
  syncSeconds: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  gpsCoords,
  gpsAccuracy,
  busStops,
  selectedStopCode,
  onSelectStopCode,
  radiusFilter,
  onChangeRadius,
  syncSeconds,
  onManualRefresh,
  isRefreshing,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const selectedStop = busStops.find(s => s.code === selectedStopCode) || busStops[0];

  return (
    <div className="bg-[#f1f5f9]/70 border-b border-slate-200/90 px-4 lg:px-6 py-2 text-xs">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: GPS Coordinates Pill + Nearest Stop Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* GPS Fixed Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full font-mono text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-semibold text-emerald-800 text-[11px] tracking-wide">GPS FIXED</span>
            <span className="text-slate-600 text-[11px]">{gpsCoords}</span>
            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded text-[10px] font-medium border border-slate-200/60">
              {gpsAccuracy}
            </span>
          </div>

          {/* Nearest Stop Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Navigation className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-slate-500 font-medium">Nearest:</span>
              <span className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-2">
                {selectedStop ? `${selectedStop.code} · ${selectedStop.name}` : '08031 · Dhoby Ghaut Exit B'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px] border border-emerald-200/70">
                {selectedStop ? `${selectedStop.distanceMeters}m · ${selectedStop.walkMinutes} min` : '65m · 1 min'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Nearby Bus Stop
                  </div>
                  {busStops.map(stop => (
                    <button
                      key={stop.code}
                      onClick={() => {
                        onSelectStopCode(stop.code);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        selectedStopCode === stop.code ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] px-1 bg-slate-100 rounded text-slate-700 border border-slate-200">
                            {stop.code}
                          </span>
                          <span className="font-medium text-slate-900">{stop.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{stop.roadName} • {stop.description}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-medium text-slate-500">{stop.distanceMeters}m</span>
                        {selectedStopCode === stop.code && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto mt-0.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Radius Filter & Live Sync countdown */}
        <div className="flex items-center gap-3">
          {/* Radius Segmented Filter */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => onChangeRadius('200m')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                radiusFilter === '200m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              200m (3 stops)
            </button>
            <button
              onClick={() => onChangeRadius('500m')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                radiusFilter === '500m'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              500m (7 stops)
            </button>
            <button
              onClick={() => onChangeRadius('1km')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                radiusFilter === '1km'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              1km
            </button>
          </div>

          {/* Sync in 10s + Refresh button */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium shadow-2xs">
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="text-[11px]">Sync in</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{syncSeconds}s</span>
            </div>
            <button
              onClick={onManualRefresh}
              className="w-7 h-7 bg-[#00704A] hover:bg-[#005a3b] active:scale-95 text-white rounded-lg flex items-center justify-center transition-all shadow-2xs cursor-pointer"
              title="Refresh arrivals now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
