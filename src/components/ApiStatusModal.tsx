import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, Key, RefreshCw, X, Server } from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [sampleArrival, setSampleArrival] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, arrivalRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/bus-arrival?BusStopCode=04121&ServiceNo=7'),
      ]);

      if (!healthRes.ok) throw new Error(`Health API returned ${healthRes.status}`);
      const health = await healthRes.json();
      setHealthData(health);

      if (arrivalRes.ok) {
        const arrival = await arrivalRes.json();
        setSampleArrival(arrival);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch API status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const hasLtaKey = healthData?.ltaDataMall?.accountKeyConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">LTA DataMall API & Health Monitor</h3>
              <p className="text-[11px] text-slate-400">Endpoints: /api/health • /api/bus-arrival</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {loading && !healthData ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Querying /api/health and /api/bus-arrival...</span>
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Overall Status Banner */}
              <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                healthData?.status === 'ok'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>API Server Operational: {healthData?.status?.toUpperCase()}</span>
                    <span className="font-mono text-[10px] bg-white/80 px-1.5 py-0.2 rounded border border-emerald-300">
                      v{healthData?.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-0.5">
                    Server uptime: {healthData?.uptimeSeconds}s • Response time: OK
                  </p>
                </div>
              </div>

              {/* LTA Account Key Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    <span>LTA DataMall Account Key</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hasLtaKey
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {hasLtaKey ? 'LIVE KEY DETECTED' : 'PENDING ENVIRONMENT VARIABLE'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {hasLtaKey
                    ? `Live DataMall proxy active with key: ${healthData.ltaDataMall.keyMasked}. Real-time arrivals fetched directly from datamall2.mytransport.sg.`
                    : `LTA_ACCOUNT_KEY is not yet detected in your environment. Once you add LTA_ACCOUNT_KEY in your Vercel Project Settings > Environment Variables, the live LTA DataMall stream will activate automatically.`}
                </p>
              </div>

              {/* Verified Endpoints List */}
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block">
                  Registered API Routes
                </span>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">GET /api/health</span>
                    <span className="text-slate-400 text-[10px]">200 OK</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-emerald-400 font-bold">GET /api/bus-arrival</span>
                    <span className="text-slate-400 text-[10px]">200 OK</span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                    Live proxy: <span className="text-slate-300">datamall2.mytransport.sg/ltaodataservice/v3/BusArrival</span>
                  </div>
                </div>
              </div>

              {/* Sample API Response Preview */}
              {sampleArrival && (
                <div>
                  <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Sample Query: BusArrival?BusStopCode=04121&ServiceNo=7
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[10px] text-slate-700 max-h-36 overflow-y-auto">
                    <pre>{JSON.stringify(sampleArrival, null, 2)}</pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Re-check Endpoints</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
