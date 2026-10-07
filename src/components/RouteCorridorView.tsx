import React from 'react';
import {
  Star,
  Bell,
  MapPin,
  Map,
  Share2,
  ShieldCheck,
  ArrowDownCircle,
  Bus,
  Check,
  Flag,
} from 'lucide-react';
import { BusService, StopProgressionNode } from '../types/transit';
import { MRT_LINE_COLORS } from '../data/singaporeTransitData';

interface RouteCorridorViewProps {
  service: BusService;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenAlightAlert: () => void;
  alightAlertActive?: boolean;
}

export const RouteCorridorView: React.FC<RouteCorridorViewProps> = ({
  service,
  isFavorite,
  onToggleFavorite,
  onOpenAlightAlert,
  alightAlertActive,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Live SGNextBus Telemetry: Bus ${service.serviceNo} to ${service.destination} arriving in ${service.nextBus.min === 'Arr' ? 'now' : service.nextBus.min + 'm'}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header Section */}
      <div className="p-5 border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Operator & Bus Service Badge */}
            <div className="w-14 h-14 bg-[#00704A] text-white rounded-xl flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className="font-extrabold text-2xl font-mono leading-none tracking-tight">
                {service.serviceNo}
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-emerald-100 uppercase mt-0.5">
                {service.operator}
              </span>
            </div>

            <div>
              {/* Service tags */}
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded tracking-wide border border-emerald-200">
                  {service.corridorTag ? `${service.corridorTag.toUpperCase()} SERVICE` : 'TRUNK SERVICE'}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded border border-slate-200">
                  Standard Fare
                </span>
              </div>

              {/* Destination Title */}
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {service.destination}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {service.via}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span>{isFavorite ? 'Starred' : 'Star Route'}</span>
            </button>

            <button
              onClick={onOpenAlightAlert}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs transition-all cursor-pointer ${
                alightAlertActive
                  ? 'bg-emerald-700 ring-2 ring-emerald-400 ring-offset-1'
                  : 'bg-[#00704A] hover:bg-[#005a3b]'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{alightAlertActive ? 'Alert Armed' : 'Alight Alert'}</span>
            </button>
          </div>
        </div>

        {/* Boarding Info Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium gap-2">
          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Boarding:</span>
            <span className="font-bold text-slate-900">Dhoby Ghaut Stn Exit B (08031)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>
              Total: <strong className="text-slate-800 font-semibold">{service.stopsAheadCount} stops ahead</strong>
            </span>
            <span>•</span>
            <span>
              Distance: <strong className="text-slate-800 font-semibold">{service.totalDistanceKm} km</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Corridor Schematic & Live Telemetry Card */}
      <div className="px-5 pt-4 pb-2">
        <div className="bg-[#f0f8ff]/70 border border-sky-100 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-800">
                Corridor Schematic & Live Telemetry
              </h3>
            </div>
            {service.activeBusTelemetry && (
              <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-800 font-mono font-bold text-[10px] rounded-md border border-emerald-300">
                Bus #{service.activeBusTelemetry.plateNumber} Active
              </span>
            )}
          </div>

          {/* Horizontal Track Schematic */}
          <div className="relative py-4 px-2">
            {/* Background Track Line */}
            <div className="absolute top-1/2 left-8 right-8 h-1 -translate-y-1/2 bg-slate-200 rounded-full" />
            {/* Active Progress Line */}
            <div className="absolute top-1/2 left-8 w-[15%] h-1 -translate-y-1/2 bg-emerald-500 rounded-full" />

            <div className="relative flex justify-between items-center z-10">
              {/* Node 1: Boarding Stop */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-2xs">
                  B
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1.5">
                  Dhoby Ghaut
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  You Are Here
                </span>
              </div>

              {/* Floating Bus Indicator (approx positioned) */}
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 bg-emerald-800 text-white text-[10px] font-mono font-bold rounded shadow-sm flex items-center gap-1 ring-2 ring-white">
                  <Bus className="w-3 h-3 text-emerald-300" />
                  <span>#{service.activeBusTelemetry?.plateNumber || 'SBS8492L'}</span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium mt-1">
                  {service.activeBusTelemetry ? `${service.activeBusTelemetry.distanceToStopMeters}m to stop` : '30m to stop'}
                </span>
              </div>

              {/* Intermediate Stops */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white shadow-2xs" />
                <span className="text-[11px] font-medium text-slate-600 mt-2.5">
                  Somerset
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  +6 min
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-slate-300 ring-4 ring-white shadow-2xs" />
                <span className="text-[11px] font-medium text-slate-600 mt-2.5">
                  Great World
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  +19 min
                </span>
              </div>

              {/* Terminus Stop */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-slate-800 ring-4 ring-white shadow-2xs flex items-center justify-center">
                  <Flag className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-2">
                  HarbourFront
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  +42 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forward Stops Progression (Direction 2) */}
      <div className="px-5 pt-3 pb-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-xs font-bold text-slate-800">
            Forward Stops Progression (Direction {service.direction})
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">
            Auto-updates per stop
          </span>
        </div>

        {/* Vertical timeline progression */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {service.stopsProgression.map((stop: StopProgressionNode, idx: number) => {
            const isFirst = idx === 0;
            const isLast = stop.isTerminus || idx === service.stopsProgression.length - 1;

            return (
              <div key={stop.code} className="relative group">
                {/* Node marker */}
                <div className="absolute -left-6 top-0.5">
                  {isFirst ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <ArrowDownCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : isLast ? (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-xs">
                      <Flag className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Stop Content Box */}
                <div className={`p-2.5 rounded-xl transition-all ${
                  isFirst
                    ? 'bg-emerald-50/60 border border-emerald-200/80 shadow-2xs'
                    : isLast
                    ? 'bg-slate-50/80 border border-slate-200'
                    : 'hover:bg-slate-50/60'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded border ${
                          isFirst
                            ? 'bg-emerald-800 text-white border-emerald-900'
                            : isLast
                            ? 'bg-slate-800 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {stop.code}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900">
                          {stop.name}
                        </h4>
                      </div>

                      {/* Subtext, MRT Badges, Location Notes */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        {stop.distanceKmFromBoard !== undefined && (
                          <span>{stop.distanceKmFromBoard} km from board</span>
                        )}
                        {stop.subtext && <span>{stop.subtext}</span>}

                        {/* MRT badges */}
                        {stop.mrtBadges && stop.mrtBadges.map((badge, bIdx) => {
                          const config = MRT_LINE_COLORS[badge.line] || { bg: 'bg-slate-700', text: 'text-white' };
                          return (
                            <span
                              key={bIdx}
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider font-mono ${config.bg} ${config.text}`}
                            >
                              {badge.line}
                            </span>
                          );
                        })}

                        {stop.locationNote && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200/80">
                            {stop.locationNote}
                          </span>
                        )}
                      </div>

                      {/* Bus Live Telemetry Note */}
                      {stop.busStatusNote && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                          <Bus className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{stop.busStatusNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Timing badge on right */}
                    <div className="text-right shrink-0">
                      {isFirst ? (
                        <span className="px-2 py-0.5 bg-emerald-700 text-white text-[11px] font-bold rounded-md shadow-2xs font-mono">
                          Departing: Arr
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            +{stop.etaOffsetMin} min
                          </span>
                          {stop.formattedEta.includes('(') && (
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {stop.formattedEta.substring(stop.formattedEta.indexOf('('))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Official LTA Schedule & Live AVL GPS coordinates tracked</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied!' : 'Share Live Progress'}</span>
        </button>
      </div>
    </div>
  );
};
