import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Navigation,
  Accessibility,
  ArrowRight,
  Check,
  Repeat,
} from 'lucide-react';
import { BusStop, BusService, BusArrivalInfo } from '../types/transit';
import { RouteCorridorView } from './RouteCorridorView';

interface NearbyStopsViewProps {
  busStops: BusStop[];
  selectedService: BusService;
  onSelectService: (service: BusService) => void;
  favorites: string[];
  onToggleFavorite: (serviceNo: string) => void;
  onOpenAlightAlert: () => void;
  alightAlertActive: boolean;
}

export const NearbyStopsView: React.FC<NearbyStopsViewProps> = ({
  busStops,
  selectedService,
  onSelectService,
  favorites,
  onToggleFavorite,
  onOpenAlightAlert,
  alightAlertActive,
}) => {
  const [busFilter, setBusFilter] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({
    '08041': false,
    '08019': false,
    '09037': false,
    '09048': false,
  });

  const toggleStopExpanded = (code: string) => {
    setExpandedStops(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const primaryStop = busStops[0];
  const secondaryStops = busStops.slice(1);

  // Filter services by bus number
  const filteredPrimaryServices = primaryStop?.services.filter(s =>
    busFilter ? s.serviceNo.toLowerCase().includes(busFilter.toLowerCase()) : true
  ) || [];

  return (
    <div className="max-w-[1720px] mx-auto p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Bus Stops and Arrival Cards (~5-6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busFilter}
                onChange={e => setBusFilter(e.target.value)}
                placeholder="Filter bus number (e.g., 65, 190, 147)..."
                className="w-full bg-[#f1f5f9]/70 hover:bg-[#f1f5f9] focus:bg-white text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition-all placeholder:text-slate-400"
              />
              {busFilter && (
                <button
                  onClick={() => setBusFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setIsCompact(!isCompact)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isCompact
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Compact</span>
            </button>
          </div>

          {/* PRIMARY BUS STOP CONTAINER (08031 - Dhoby Ghaut Stn Exit B) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#006040] to-[#00704A] text-white p-3.5 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm bg-black/25 px-2.5 py-1 rounded-md tracking-wider border border-white/20">
                  {primaryStop.code}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm md:text-base leading-tight">
                      {primaryStop.name}
                    </h2>
                    <span className="bg-emerald-400/25 text-emerald-100 text-[10px] font-bold px-2 py-0.2 rounded uppercase tracking-wider border border-emerald-300/30">
                      Active Boarding
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 font-normal mt-0.5">
                    {primaryStop.roadName} • {primaryStop.description}
                  </p>
                </div>
              </div>

              {/* Distance badge */}
              <div className="flex items-center gap-1.5 text-right bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                <Navigation className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                <div className="leading-tight">
                  <div className="text-xs font-bold font-mono">65m</div>
                  <div className="text-[10px] text-emerald-100">~1 min walk</div>
                </div>
              </div>
            </div>

            {/* List of Bus Service Cards */}
            <div className="divide-y divide-slate-100">
              {filteredPrimaryServices.map(service => {
                const isSelected = selectedService.serviceNo === service.serviceNo;

                return (
                  <div
                    key={service.serviceNo}
                    onClick={() => onSelectService(service)}
                    className={`p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/40 ring-1 ring-inset ring-emerald-400/50'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Bus Header & Route row */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Bus Number & Destinations */}
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Bus Badge */}
                        <div className="w-11 h-11 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="font-extrabold text-base font-mono leading-none tracking-tight">
                            {service.serviceNo}
                          </span>
                          <span className="text-[8px] font-medium text-slate-300 tracking-wider uppercase mt-0.5">
                            {service.operator.split(' ')[0]}
                          </span>
                        </div>

                        {/* Destination & Via */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-slate-900 truncate">
                              {service.destination}
                            </h3>
                            {service.destination.includes('Loop') ? (
                              <Repeat className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {service.via}
                          </p>

                          {/* Corridor tag & Active in pane badge */}
                          <div className="flex items-center gap-2 mt-1.5">
                            {service.corridorTag && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {service.corridorTag}
                              </span>
                            )}
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300/80">
                                <Check className="w-2.5 h-2.5" />
                                <span>Active Route in Pane</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Arrival Time Slots (3 Slots) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <ArrivalSlot slot={service.nextBus} />
                        <ArrivalSlot slot={service.secondBus} />
                        <ArrivalSlot slot={service.thirdBus} />
                      </div>
                    </div>

                    {/* Bottom row: stops ahead & prompt */}
                    {!isCompact && (
                      <div className="mt-3 pt-2 border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{service.stopsAheadCount} stops ahead available</span>
                        </span>
                        <span className="text-slate-400 group-hover:text-slate-700 flex items-center gap-0.5 font-medium">
                          <span>Tap to view progression</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECONDARY BUS STOPS (08041 - MacDonald House & 08019 - Opp Plaza Singapura) */}
          {secondaryStops.map(stop => {
            const isExpanded = expandedStops[stop.code];

            return (
              <div
                key={stop.code}
                className="bg-[#f0f4fa]/70 rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleStopExpanded(stop.code)}
                  className="p-3 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded shadow-2xs">
                      {stop.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">
                        {stop.name}
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {stop.roadName} • {stop.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleStopExpanded(stop.code);
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer"
                  >
                    <span>View All</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Compact Bus Badges Grid */}
                {stop.compactServices && (
                  <div className="p-3 pt-1 border-t border-slate-200/60 bg-white">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {stop.compactServices.map((bus, bIdx) => (
                        <div
                          key={bIdx}
                          onClick={() => {
                            // If user clicks a compact service, mock select it or switch
                            const mockedService = {
                              ...selectedService,
                              serviceNo: bus.serviceNo,
                              destination: `${bus.serviceNo} Corridor Line`,
                              nextBus: {
                                min: bus.arrivalText === 'Arr' ? 'Arr' : parseInt(bus.arrivalText, 10) || 5,
                                crowding: bus.crowding || 'SEA',
                                deck: bus.deck,
                                isWab: true,
                              },
                            };
                            onSelectService(mockedService as BusService);
                          }}
                          className="bg-slate-50 hover:bg-emerald-50/60 hover:border-emerald-300 border border-slate-200 rounded-xl p-2 text-center cursor-pointer transition-all"
                        >
                          <div className="font-mono font-extrabold text-xs text-white bg-slate-800 rounded px-1.5 py-0.5 mx-auto inline-block mb-1">
                            {bus.serviceNo}
                          </div>
                          <div className={`font-mono font-bold text-xs ${
                            bus.arrivalText === 'Arr'
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }`}>
                            {bus.arrivalText}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                            <span>{bus.deck}</span>
                            {bus.crowding && (
                              <>
                                <span>•</span>
                                <span>{bus.crowding}</span>
                              </>
                            )}
                            {bus.tag && (
                              <span className="text-emerald-700 font-semibold">{bus.tag}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>All 6 active services operational</span>
                        <span className="text-emerald-700 font-semibold">Live GPS signal locked</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Route Corridor Schematic & Live Progression (~6-7 cols) */}
        <div className="lg:col-span-6 sticky top-20">
          <RouteCorridorView
            service={selectedService}
            isFavorite={favorites.includes(selectedService.serviceNo)}
            onToggleFavorite={() => onToggleFavorite(selectedService.serviceNo)}
            onOpenAlightAlert={onOpenAlightAlert}
            alightAlertActive={alightAlertActive}
          />
        </div>
      </div>
    </div>
  );
};

// Arrival Slot Component
const ArrivalSlot: React.FC<{ slot: BusArrivalInfo }> = ({ slot }) => {
  if (slot.min === '--') {
    return (
      <div className="w-14 sm:w-16 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs font-semibold">
        --
      </div>
    );
  }

  const isArr = slot.min === 'Arr';
  const minutes = typeof slot.min === 'number' ? slot.min : 0;

  // Determine container styling based on arrival time & crowding
  let bgBorderClass = 'bg-slate-100/90 border-slate-200 text-slate-700';
  let dotClass = 'bg-slate-400';
  let textClass = 'text-slate-800';

  if (isArr) {
    bgBorderClass = 'bg-emerald-50/90 border-emerald-300/80';
    dotClass = 'bg-emerald-500';
    textClass = 'text-emerald-800';
  } else if (minutes <= 3) {
    bgBorderClass = 'bg-amber-50/90 border-amber-300/80';
    dotClass = 'bg-amber-500';
    textClass = 'text-amber-800';
  } else if (slot.crowding === 'LSD') {
    bgBorderClass = 'bg-rose-50/90 border-rose-300/80';
    dotClass = 'bg-rose-500';
    textClass = 'text-rose-800';
  } else if (minutes <= 8) {
    bgBorderClass = 'bg-emerald-50/80 border-emerald-300/70';
    dotClass = 'bg-emerald-500';
    textClass = 'text-emerald-800';
  }

  return (
    <div
      className={`w-14 sm:w-16 h-12 rounded-xl border flex flex-col items-center justify-center p-1 shadow-2xs ${bgBorderClass}`}
    >
      {/* Time and Status Dot */}
      <div className="flex items-center gap-1 font-mono font-bold text-xs leading-none">
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`}></span>
        <span className={textClass}>
          {isArr ? 'Arr' : `${slot.min}m`}
        </span>
      </div>

      {/* Subtext: Deck and Wheelchair */}
      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-slate-500 leading-none">
        <span className="font-semibold">{slot.deck}</span>
        {slot.isWab && <Accessibility className="w-2.5 h-2.5 text-slate-400" />}
      </div>
    </div>
  );
};
