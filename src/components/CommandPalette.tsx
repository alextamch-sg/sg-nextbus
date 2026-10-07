import React, { useState, useEffect } from 'react';
import { Search, Bus, MapPin, ArrowRight, X } from 'lucide-react';
import { BusService, BusStop } from '../types/transit';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  allServices: Record<string, BusService>;
  busStops: BusStop[];
  onSelectService: (service: BusService) => void;
  onSelectStop: (stopCode: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  allServices,
  busStops,
  onSelectService,
  onSelectStop,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const servicesList = Object.values(allServices);
  const matchedServices = servicesList.filter(
    s =>
      s.serviceNo.toLowerCase().includes(query.toLowerCase()) ||
      s.destination.toLowerCase().includes(query.toLowerCase()) ||
      s.via.toLowerCase().includes(query.toLowerCase())
  );

  const matchedStops = busStops.filter(
    st =>
      st.code.toLowerCase().includes(query.toLowerCase()) ||
      st.name.toLowerCase().includes(query.toLowerCase()) ||
      st.roadName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type bus number (e.g. 65, 190) or bus stop (e.g. 08031, Dhoby Ghaut)..."
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
          {/* Matched Bus Services */}
          <div className="pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Bus Services
            </span>
            {matchedServices.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 italic text-[11px]">No services found matching "{query}"</div>
            ) : (
              matchedServices.map(service => (
                <button
                  key={service.serviceNo}
                  onClick={() => {
                    onSelectService(service);
                    onClose();
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#00704A] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {service.serviceNo}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {service.destination}
                      </h4>
                      <p className="text-[10px] text-slate-400">{service.via}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700 font-bold">
                    <span>{service.nextBus.min === 'Arr' ? 'Arr' : `${service.nextBus.min}m`}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Matched Bus Stops */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              Bus Stops & Interchanges
            </span>
            {matchedStops.map(stop => (
              <button
                key={stop.code}
                onClick={() => {
                  onSelectStop(stop.code);
                  onClose();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200">
                    {stop.code}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {stop.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">{stop.roadName} • {stop.description}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stop.distanceMeters}m
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span>Navigate with arrows, press Enter to select</span>
          <span className="font-mono text-emerald-700 font-semibold">LTA DataMall Active</span>
        </div>
      </div>
    </div>
  );
};
