import React, { useState } from 'react';
import { Bell, Volume2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { BusService } from '../types/transit';
import { playBusBellChime } from '../utils/audio';

interface AlightAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: BusService;
  isArmed: boolean;
  onArmAlert: (stopCode: string, stopName: string, leadStops: number) => void;
  onDisarmAlert: () => void;
  currentArmedStopName?: string;
}

export const AlightAlertModal: React.FC<AlightAlertModalProps> = ({
  isOpen,
  onClose,
  service,
  isArmed,
  onArmAlert,
  onDisarmAlert,
  currentArmedStopName,
}) => {
  const [selectedStopCode, setSelectedStopCode] = useState(
    service.stopsProgression[service.stopsProgression.length - 1]?.code || ''
  );
  const [leadStops, setLeadStops] = useState<number>(1);
  const [testChimePlaying, setTestChimePlaying] = useState(false);

  if (!isOpen) return null;

  const handleTestChime = () => {
    setTestChimePlaying(true);
    playBusBellChime();
    setTimeout(() => setTestChimePlaying(false), 1200);
  };

  const handleSave = () => {
    const targetStop = service.stopsProgression.find(s => s.code === selectedStopCode);
    if (targetStop) {
      playBusBellChime();
      onArmAlert(targetStop.code, targetStop.name, leadStops);
    }
    onClose();
  };

  const selectedStopObj = service.stopsProgression.find(s => s.code === selectedStopCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006040] to-[#00704A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Alight Alert Assistant</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Service {service.serviceNo} • Towards {service.destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isArmed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block mb-1 ring-4 ring-emerald-200"></span>
              <h4 className="font-bold text-sm text-emerald-900">Alight Alert Armed!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                We will sound the Singapore bus bell chime before arriving at:
              </p>
              <div className="font-bold text-sm text-slate-900 bg-white border border-emerald-200 rounded-xl py-2 px-3 mt-2 shadow-2xs">
                {currentArmedStopName || selectedStopObj?.name || 'Destination Stop'}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={handleTestChime}
                  className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Test Bus Bell Chime</span>
                </button>
                <button
                  onClick={() => {
                    onDisarmAlert();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Disarm Alert
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Select Destination Stop */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Select Your Alighting Stop
                </label>
                <select
                  value={selectedStopCode}
                  onChange={e => setSelectedStopCode(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {service.stopsProgression.slice(1).map(stop => (
                    <option key={stop.code} value={stop.code}>
                      {stop.code} — {stop.name} ({stop.formattedEta})
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert Warning Threshold */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Ring Notification Lead Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(stops => (
                    <button
                      key={stops}
                      type="button"
                      onClick={() => setLeadStops(stops)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        leadStops === stops
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {stops} stop {stops === 1 ? 'before' : 'ahead'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chime Sound Preview */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block leading-tight">
                      Auditory Bus Chime (Ding-Dong)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Authentic Singapore transit melodic chime
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestChime}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    testChimePlaying
                      ? 'bg-emerald-600 text-white border-emerald-600 scale-95'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {testChimePlaying ? 'Chiming...' : 'Preview'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isArmed && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#00704A] hover:bg-[#005a3b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Arm Alight Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
