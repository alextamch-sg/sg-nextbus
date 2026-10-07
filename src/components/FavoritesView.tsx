import React from 'react';
import { Star, Bus, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { BusService } from '../types/transit';

interface FavoritesViewProps {
  favoriteServiceNos: string[];
  allServices: Record<string, BusService>;
  onSelectService: (service: BusService) => void;
  onToggleFavorite: (serviceNo: string) => void;
  onOpenAlightAlert: (service: BusService) => void;
  onBackToNearby: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteServiceNos,
  allServices,
  onSelectService,
  onToggleFavorite,
  onOpenAlightAlert,
  onBackToNearby,
}) => {
  const favoriteServices = favoriteServiceNos
    .map(no => allServices[no])
    .filter(Boolean);

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Favorite Routes & Monitored Corridors</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pinned Singapore bus services with instantaneous arrival tracking and quick alight alerts.
          </p>
        </div>

        <button
          onClick={onBackToNearby}
          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          ← Back to Nearby Stops
        </button>
      </div>

      {favoriteServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 stroke-1" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No Starred Routes Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the <strong className="text-slate-700 font-semibold">Star Route</strong> button on any bus line in the Nearby Stops view to bookmark it here.
          </p>
          <button
            onClick={onBackToNearby}
            className="px-4 py-2 bg-[#00704A] hover:bg-[#005a3b] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Explore Nearby Stops
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteServices.map(service => (
            <div
              key={service.serviceNo}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-2xs">
                      <span className="text-sm">{service.serviceNo}</span>
                      <span className="text-[7px] text-slate-300 uppercase">{service.operator.split(' ')[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {service.destination}
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        {service.corridorTag || 'Trunk'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(service.serviceNo)}
                    className="text-amber-500 hover:text-amber-600 p-1 cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Star className="w-4 h-4 fill-amber-500" />
                  </button>
                </div>

                {/* Arrival Slots */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-emerald-800 font-medium block">Next</span>
                    <span className="font-mono font-bold text-base text-emerald-700">
                      {service.nextBus.min === 'Arr' ? 'Arr' : `${service.nextBus.min}m`}
                    </span>
                    <span className="text-[9px] text-slate-500 block">{service.nextBus.deck}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">2nd</span>
                    <span className="font-mono font-bold text-sm text-slate-800">
                      {service.secondBus.min === '--' ? '--' : `${service.secondBus.min}m`}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{service.secondBus.deck}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-slate-500 font-medium block">3rd</span>
                    <span className="font-mono font-bold text-sm text-slate-800">
                      {service.thirdBus.min === '--' ? '--' : `${service.thirdBus.min}m`}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{service.thirdBus.deck}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
                  {service.via}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onSelectService(service);
                    onBackToNearby();
                  }}
                  className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors text-center cursor-pointer"
                >
                  View Live Progression
                </button>
                <button
                  onClick={() => onOpenAlightAlert(service)}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  title="Arm Alight Alert"
                >
                  <Bell className="w-4 h-4 text-emerald-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
