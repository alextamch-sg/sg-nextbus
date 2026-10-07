import React, { useState } from 'react';
import { Search, Compass, Clock, MapPin, ArrowRight, ShieldCheck, Bus } from 'lucide-react';
import { BusService } from '../types/transit';

interface RouteExplorerViewProps {
  allServices: Record<string, BusService>;
  onSelectService: (service: BusService) => void;
  onNavigateToNearby: () => void;
}

export const RouteExplorerView: React.FC<RouteExplorerViewProps> = ({
  allServices,
  onSelectService,
  onNavigateToNearby,
}) => {
  const [selectedRouteNo, setSelectedRouteNo] = useState('65');
  const [direction, setDirection] = useState<1 | 2>(2);
  const [searchQuery, setSearchQuery] = useState('');

  const availableServices = Object.values(allServices);
  const filteredServices = availableServices.filter(s =>
    searchQuery ? s.serviceNo.toLowerCase().includes(searchQuery.toLowerCase()) || s.destination.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const currentService = allServices[selectedRouteNo] || availableServices[0];

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>Singapore Bus Route Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lookup LTA route corridors, dispatch frequencies, timetable windows and stop itineraries.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bus service (e.g., 65, 190, 147)..."
            className="w-full bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Route Selector List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1.5 max-h-[700px] overflow-y-auto">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Available Trunk & Feeder Services ({filteredServices.length})
          </div>
          {filteredServices.map(service => (
            <button
              key={service.serviceNo}
              onClick={() => setSelectedRouteNo(service.serviceNo)}
              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                selectedRouteNo === service.serviceNo
                  ? 'bg-[#00704A] text-white shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`font-mono font-extrabold text-xs px-2 py-1 rounded ${
                  selectedRouteNo === service.serviceNo ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
                }`}>
                  {service.serviceNo}
                </span>
                <div>
                  <h4 className="font-bold text-xs leading-tight">{service.destination}</h4>
                  <span className={`text-[10px] ${selectedRouteNo === service.serviceNo ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {service.operator} • {service.corridorTag || 'Trunk'}
                  </span>
                </div>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 ${selectedRouteNo === service.serviceNo ? 'text-white' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>

        {/* Selected Route Detailed Dossier */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
          {/* Dossier Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#00704A] text-white rounded-xl flex items-center justify-center font-mono font-black text-xl shadow-xs">
                {currentService.serviceNo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Service {currentService.serviceNo}
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    {currentService.operator}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terminus: <strong className="text-slate-700">{currentService.destination}</strong>
                </p>
              </div>
            </div>

            {/* Direction Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setDirection(1)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  direction === 1 ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dir 1 (Inbound)
              </button>
              <button
                onClick={() => setDirection(2)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  direction === 2 ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dir 2 (Outbound)
              </button>
            </div>
          </div>

          {/* Operating Schedule & Frequency Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First / Last Bus</span>
              <span className="font-mono font-bold text-xs text-slate-800 mt-1 block">05:30 – 23:45</span>
              <span className="text-[10px] text-slate-500">Daily Dispatch</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Morning Peak</span>
              <span className="font-mono font-bold text-xs text-emerald-700 mt-1 block">04 – 07 mins</span>
              <span className="text-[10px] text-slate-500">06:30 – 09:00</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Off-Peak</span>
              <span className="font-mono font-bold text-xs text-slate-800 mt-1 block">08 – 12 mins</span>
              <span className="text-[10px] text-slate-500">10:00 – 16:30</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evening Peak</span>
              <span className="font-mono font-bold text-xs text-emerald-700 mt-1 block">05 – 08 mins</span>
              <span className="text-[10px] text-slate-500">17:00 – 20:00</span>
            </div>
          </div>

          {/* Stop Progression Itinerary */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Key Route Stops Itinerary (Direction {direction})</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">
                {currentService.stopsProgression.length} stops recorded
              </span>
            </h4>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {currentService.stopsProgression.map((stop, sIdx) => (
                <div key={stop.code} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-500 w-5 text-right font-medium">
                      {sIdx + 1}
                    </span>
                    <span className="font-mono font-bold text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                      {stop.code}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{stop.name}</span>
                      {stop.locationNote && (
                        <span className="text-[10px] text-slate-400 ml-2 font-medium">({stop.locationNote})</span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-slate-500 text-[11px]">
                    +{stop.etaOffsetMin}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                onSelectService(currentService);
                onNavigateToNearby();
              }}
              className="px-4 py-2 bg-[#00704A] hover:bg-[#005a3b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Track Live on Telemetry Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
