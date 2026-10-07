import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, Key, RefreshCw, X, Server, Check } from 'lucide-react';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (newKey: string) => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [sampleArrival, setSampleArrival] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // User input key state
  const [inputKey, setInputKey] = useState<string>(() => {
    return localStorage.getItem('lta_account_key') || '';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStatus = async (keyToTest?: string) => {
    setLoading(true);
    setError(null);
    try {
      const activeKey = keyToTest !== undefined ? keyToTest : (localStorage.getItem('lta_account_key') || '');
      const headers: Record<string, string> = {};
      if (activeKey) {
        headers['X-LTA-Account-Key'] = activeKey;
      }

      const [healthRes, arrivalRes] = await Promise.all([
        fetch('/api/health' + (activeKey ? `?AccountKey=${encodeURIComponent(activeKey)}` : ''), { headers }),
        fetch('/api/bus-arrival?BusStopCode=04121&ServiceNo=7' + (activeKey ? `&AccountKey=${encodeURIComponent(activeKey)}` : ''), { headers }),
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

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (trimmed) {
      localStorage.setItem('lta_account_key', trimmed);
    } else {
      localStorage.removeItem('lta_account_key');
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    if (onKeyUpdated) onKeyUpdated(trimmed);
    fetchStatus(trimmed);
  };

  if (!isOpen) return null;

  const hasLtaKey = healthData?.ltaDataMall?.accountKeyConfigured || Boolean(inputKey.trim());
  const isVerifiedActive = healthData?.ltaDataMall?.status === 'VERIFIED_ACTIVE';
  const isKeyRejected = healthData?.ltaDataMall?.status?.startsWith('KEY_REJECTED');

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
              <h3 className="font-bold text-sm">LTA DataMall API & Key Configuration</h3>
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
          {/* Key Input Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>LTA Account Key (DataMall)</span>
              </label>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isVerifiedActive
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isKeyRejected
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : hasLtaKey
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isVerifiedActive
                  ? 'LIVE & VERIFIED'
                  : isKeyRejected
                  ? 'INVALID KEY (LTA 401)'
                  : hasLtaKey
                  ? 'KEY CONFIGURED'
                  : 'AWAITING KEY'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="Paste your LTA DataMall AccountKey here..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleSaveKey}
                disabled={loading}
                className="px-3.5 py-2 bg-[#00704A] hover:bg-[#005a3b] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save & Test</span>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              You can set <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">LTA_ACCOUNT_KEY</code> in Vercel Environment Variables, or paste it here directly. Stored safely in your browser and automatically sent to live proxy endpoints.
            </p>
          </div>

          {loading && !healthData ? (
            <div className="py-6 text-center text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Verifying LTA DataMall connection...</span>
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
                sampleArrival?.isLive || isVerifiedActive
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${sampleArrival?.isLive ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div className="flex-1">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>
                      {sampleArrival?.isLive
                        ? 'LIVE LTA DATAMALL FEED ACTIVE'
                        : 'LOCAL FALLBACK TELEMETRY STREAM'}
                    </span>
                    <span className="font-mono text-[10px] bg-white/80 px-1.5 py-0.2 rounded border border-slate-300">
                      {sampleArrival?.source}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {sampleArrival?.isLive
                      ? 'Real fleet GPS coordinates and live bus ETAs arriving every 15–20s from Singapore LTA DataMall v3.'
                      : sampleArrival?.message || 'Ready for live key.'}
                  </p>
                </div>
              </div>

              {/* Verified Endpoints List */}
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block">
                  API Telemetry Health
                </span>
                <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">GET /api/health</span>
                    <span className="text-slate-400 text-[10px]">{healthData?.status === 'ok' ? '200 OK' : 'CHECKING'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-emerald-400 font-bold">GET /api/bus-arrival</span>
                    <span className="text-slate-400 text-[10px]">
                      {sampleArrival?.isLive ? '200 OK (LIVE FEED)' : '200 OK (MOCK SYNC)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 truncate">
                    Target: <span className="text-slate-300">datamall2.mytransport.sg/ltaodataservice/v3/BusArrival</span>
                  </div>
                </div>
              </div>

              {/* Sample API Response Preview */}
              {sampleArrival && (
                <div>
                  <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Live Response Sample (BusStopCode 04121 • Service 7)
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
            onClick={() => fetchStatus()}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Re-verify Connection</span>
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
