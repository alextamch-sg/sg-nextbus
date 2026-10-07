import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { CrowdingLegend } from './components/CrowdingLegend';
import { NearbyStopsView } from './components/NearbyStopsView';
import { FavoritesView } from './components/FavoritesView';
import { RouteExplorerView } from './components/RouteExplorerView';
import { ServiceMapView } from './components/ServiceMapView';
import { AlightAlertModal } from './components/AlightAlertModal';
import { CommandPalette } from './components/CommandPalette';
import { ApiStatusModal } from './components/ApiStatusModal';
import {
  BUS_STOPS_DATABASE,
  INITIAL_SERVICES,
} from './data/singaporeTransitData';
import { BusService, BusStop, CrowdingLevel, BusDeck, TransitOperator, BusArrivalInfo } from './types/transit';
import {
  getBrowserGeolocation,
  calculateDistanceMeters,
  formatCoordinates,
  isInSingapore,
} from './utils/geolocation';
import { Navigation, Compass, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'nearby' | 'favorites' | 'explorer' | 'map'>('nearby');
  const [services, setServices] = useState<Record<string, BusService>>(INITIAL_SERVICES);
  const [activeStopServices, setActiveStopServices] = useState<BusService[]>([]);
  const [selectedService, setSelectedService] = useState<BusService>(INITIAL_SERVICES['65']);
  const [selectedStopCode, setSelectedStopCode] = useState<string>('08031');
  const [busStopsList, setBusStopsList] = useState<BusStop[]>(BUS_STOPS_DATABASE);
  const [radiusFilter, setRadiusFilter] = useState<'200m' | '500m' | '1km'>('200m');
  const [favorites, setFavorites] = useState<string[]>(['65', '190']);
  
  // Real-time telemetry countdown ticker (15s cycle)
  const [syncCountdown, setSyncCountdown] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Alight alert modal & state
  const [isAlightModalOpen, setIsAlightModalOpen] = useState<boolean>(false);
  const [armedAlightAlert, setArmedAlightAlert] = useState<{
    serviceNo: string;
    stopCode: string;
    stopName: string;
    leadStops: number;
  } | null>(null);

  // Command palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // API Status Modal
  const [isApiStatusModalOpen, setIsApiStatusModalOpen] = useState<boolean>(false);

  // GPS Location State
  const [currentLocationName, setCurrentLocationName] = useState<string>('Dhoby Ghaut / Orchard');
  const [gpsCoords, setGpsCoords] = useState<string>('1.2995° N, 103.8458° E');
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('±8m');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Real device Geolocation detection
  const handleDetectGeolocation = useCallback(async () => {
    setIsLocating(true);
    setGpsNotice(null);
    try {
      const coords = await getBrowserGeolocation();
      const { latitude, longitude, accuracyMeters } = coords;

      setGpsCoords(formatCoordinates(latitude, longitude));
      setGpsAccuracy(`±${accuracyMeters || 8}m`);

      // Calculate distances to all bus stops
      let minDistance = Infinity;
      let closestStop = busStopsList[0];

      const updatedStops = busStopsList.map(stop => {
        if (stop.latitude && stop.longitude) {
          const dist = calculateDistanceMeters(latitude, longitude, stop.latitude, stop.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closestStop = stop;
          }
          return {
            ...stop,
            distanceMeters: dist,
            walkMinutes: Math.max(1, Math.round(dist / 80)),
          };
        }
        return stop;
      });

      // Sort by closest distance
      updatedStops.sort((a, b) => a.distanceMeters - b.distanceMeters);
      setBusStopsList(updatedStops);

      if (isInSingapore(latitude, longitude)) {
        setSelectedStopCode(closestStop.code);
        setCurrentLocationName(`${closestStop.name}`);
        setGpsNotice(`GPS locked: Nearest stop is ${closestStop.name} (${closestStop.code}, ${minDistance}m away).`);
      } else {
        // Outside Singapore: inform user gently while showing real GPS coordinates
        setCurrentLocationName(`Dhoby Ghaut / Orchard`);
        setGpsNotice(`Real Device GPS (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°) is outside Singapore. Auto-anchored to Central Hub (Dhoby Ghaut).`);
      }
    } catch (err: any) {
      console.warn('Geolocation access failed:', err?.message || err);
      setGpsNotice('Could not retrieve browser GPS. Using Central Singapore anchor point.');
    } finally {
      setIsLocating(false);
    }
  }, [busStopsList]);

  // Run geolocation detection on load
  useEffect(() => {
    handleDetectGeolocation();
  }, []);

  // Map raw LTA service JSON to complete BusService
  const mapLtaService = useCallback((s: any, stopCode: string, nowMs: number): BusService => {
    const existing = services[s.ServiceNo];

    const parseArrival = (busObj: any): BusArrivalInfo => {
      if (!busObj || !busObj.EstimatedArrival) {
        return { min: '--', crowding: 'SEA', deck: 'SD', isWab: false };
      }
      const etaTime = new Date(busObj.EstimatedArrival).getTime();
      const diffMin = Math.round((etaTime - nowMs) / 60000);
      const min = diffMin <= 1 ? 'Arr' : diffMin < 0 ? 'Arr' : diffMin;
      const crowding = (busObj.Load || 'SEA') as CrowdingLevel;
      const deck = (busObj.Type || 'DD') as BusDeck;
      const isWab = busObj.Feature === 'WAB';
      return {
        min,
        crowding,
        deck,
        isWab,
        plateNumber: busObj.VisitNumber ? `SG${busObj.VisitNumber}L` : undefined,
      };
    };

    const nextBus = parseArrival(s.NextBus);
    const secondBus = parseArrival(s.NextBus2);
    const thirdBus = parseArrival(s.NextBus3);

    const opMap: Record<string, TransitOperator> = {
      SBST: 'SBS TRANSIT',
      SMRT: 'SMRT',
      TTS: 'TOWER',
      GAS: 'GO-AHEAD',
    };
    const operator: TransitOperator = opMap[s.Operator] || existing?.operator || 'SBS TRANSIT';

    if (existing) {
      return {
        ...existing,
        operator,
        nextBus,
        secondBus,
        thirdBus,
      };
    }

    const destCode = s.NextBus?.DestinationCode || '';
    const destStop = busStopsList.find(b => b.code === destCode);
    const destination = destStop ? destStop.name : destCode ? `Interchange (${destCode})` : `Loop Line`;

    return {
      serviceNo: s.ServiceNo,
      operator,
      destination,
      via: 'Singapore Transit Corridor',
      corridorTag: 'Trunk',
      stopsAheadCount: 16,
      direction: 1,
      totalDistanceKm: 9.2,
      nextBus,
      secondBus,
      thirdBus,
      schematicStops: [
        { code: stopCode, name: 'Current Boarding Stop', etaMinutes: 0, isBoarding: true },
        { code: destCode || '99999', name: destination, etaMinutes: 32, isTerminus: true },
      ],
      stopsProgression: [
        {
          code: stopCode,
          name: 'Current Boarding Stop',
          isBoarding: true,
          etaOffsetMin: 0,
          formattedEta: nextBus.min === 'Arr' ? 'Departing: Arr' : `In ${nextBus.min} mins`,
        },
        {
          code: destCode || '99999',
          name: destination,
          isTerminus: true,
          etaOffsetMin: 32,
          formattedEta: '+32 min',
        },
      ],
    };
  }, [services, busStopsList]);

  // Handle telemetry refresh from /api/bus-arrival
  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSyncCountdown(15);

    try {
      const storedKey = localStorage.getItem('lta_account_key') || '';
      const headers: Record<string, string> = {};
      if (storedKey) {
        headers['X-LTA-Account-Key'] = storedKey;
      }

      const queryParams = new URLSearchParams({
        BusStopCode: selectedStopCode,
      });
      if (storedKey) {
        queryParams.set('AccountKey', storedKey);
      }

      const response = await fetch(`/api/bus-arrival?${queryParams.toString()}`, { headers });

      if (response.ok) {
        const data = await response.json();
        setIsLiveApi(Boolean(data.isLive));
        setLastSyncTime(new Date().toLocaleTimeString());

        if (data && Array.isArray(data.Services) && data.Services.length > 0) {
          const nowMs = Date.now();
          const mappedServicesList: BusService[] = data.Services.map((s: any) =>
            mapLtaService(s, selectedStopCode, nowMs)
          );

          setActiveStopServices(mappedServicesList);

          // Update services lookup
          setServices(prev => {
            const next = { ...prev };
            mappedServicesList.forEach(s => {
              next[s.serviceNo] = s;
            });
            return next;
          });

          // Ensure selectedService stays current
          const matching = mappedServicesList.find(s => s.serviceNo === selectedService.serviceNo);
          if (matching) {
            setSelectedService(matching);
          } else if (mappedServicesList.length > 0) {
            setSelectedService(mappedServicesList[0]);
          }
        }
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedStopCode, selectedService.serviceNo, mapLtaService]);

  // Refresh whenever selectedStopCode changes
  useEffect(() => {
    triggerRefresh();
  }, [selectedStopCode]);

  // 15-second sync Countdown Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setSyncCountdown(prev => {
        if (prev <= 1) {
          triggerRefresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [triggerRefresh]);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle Favorite handler
  const handleToggleFavorite = (serviceNo: string) => {
    setFavorites(prev =>
      prev.includes(serviceNo)
        ? prev.filter(no => no !== serviceNo)
        : [...prev, serviceNo]
    );
  };

  // Select service
  const handleSelectService = (service: BusService) => {
    setSelectedService(service);
  };

  // Arm Alight Alert
  const handleArmAlightAlert = (stopCode: string, stopName: string, leadStops: number) => {
    setArmedAlightAlert({
      serviceNo: selectedService.serviceNo,
      stopCode,
      stopName,
      leadStops,
    });
  };

  const handleDisarmAlightAlert = () => {
    setArmedAlightAlert(null);
  };

  // Filter bus stops based on radius
  const filteredBusStops = busStopsList.filter(stop => {
    if (radiusFilter === '200m') return stop.distanceMeters <= 350;
    if (radiusFilter === '500m') return stop.distanceMeters <= 750;
    return stop.distanceMeters <= 2500;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* Top Main Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        syncCountdown={syncCountdown}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onRefresh={triggerRefresh}
        isRefreshing={isRefreshing}
        currentLocationName={currentLocationName}
        onToggleLocationModal={() => setIsLocationModalOpen(true)}
        onOpenApiStatus={() => setIsApiStatusModalOpen(true)}
      />

      {/* Telemetry Bar (GPS, Nearest Stop, Radius filter, Sync button) */}
      <TelemetryBar
        gpsCoords={gpsCoords}
        gpsAccuracy={gpsAccuracy}
        busStops={filteredBusStops}
        selectedStopCode={selectedStopCode}
        onSelectStopCode={code => setSelectedStopCode(code)}
        radiusFilter={radiusFilter}
        onChangeRadius={setRadiusFilter}
        syncSeconds={syncCountdown}
        onManualRefresh={triggerRefresh}
        isRefreshing={isRefreshing}
        onTriggerGeolocation={handleDetectGeolocation}
        isLocating={isLocating}
      />

      {/* GPS Notice Banner (if any) */}
      {gpsNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 text-[11px] text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{gpsNotice}</span>
          </div>
          <button
            onClick={() => setGpsNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Crowding Legend Bar */}
      <CrowdingLegend />

      {/* Main Content Area Based on Tab */}
      <main className="flex-1">
        {activeTab === 'nearby' && (
          <NearbyStopsView
            busStops={filteredBusStops}
            selectedService={selectedService}
            onSelectService={handleSelectService}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenAlightAlert={() => setIsAlightModalOpen(true)}
            alightAlertActive={armedAlightAlert?.serviceNo === selectedService.serviceNo}
            selectedStopCode={selectedStopCode}
            activeStopServices={activeStopServices}
            isLiveApi={isLiveApi}
            lastSyncTime={lastSyncTime}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteServiceNos={favorites}
            allServices={services}
            onSelectService={handleSelectService}
            onToggleFavorite={handleToggleFavorite}
            onOpenAlightAlert={service => {
              setSelectedService(service);
              setIsAlightModalOpen(true);
            }}
            onBackToNearby={() => setActiveTab('nearby')}
          />
        )}

        {activeTab === 'explorer' && (
          <RouteExplorerView
            allServices={services}
            onSelectService={handleSelectService}
            onNavigateToNearby={() => setActiveTab('nearby')}
          />
        )}

        {activeTab === 'map' && (
          <ServiceMapView
            allServices={services}
            onSelectService={handleSelectService}
            onNavigateToNearby={() => setActiveTab('nearby')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-4 lg:px-6 py-2.5 text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'} inline-block`}></span>
            <span>
              {isLiveApi
                ? `Live LTA DataMall v3 Feed Connected • Last sync: ${lastSyncTime || 'Just now'}`
                : 'Data sourced via LTA DataMall v2/v3 API • Telemetry refreshed every 15s'}
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-3">
            <span>© 2025 SGNextBus Urban Transit Platform</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              v4.2-prod
            </span>
          </div>
        </div>
      </footer>

      {/* Alight Alert Assistant Modal */}
      <AlightAlertModal
        isOpen={isAlightModalOpen}
        onClose={() => setIsAlightModalOpen(false)}
        service={selectedService}
        isArmed={armedAlightAlert?.serviceNo === selectedService.serviceNo}
        onArmAlert={handleArmAlightAlert}
        onDisarmAlert={handleDisarmAlightAlert}
        currentArmedStopName={armedAlightAlert?.stopName}
      />

      {/* Command Palette Modal (⌘ K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        allServices={services}
        busStops={busStopsList}
        onSelectService={service => {
          setSelectedService(service);
          setActiveTab('nearby');
        }}
        onSelectStop={stopCode => {
          setSelectedStopCode(stopCode);
          setActiveTab('nearby');
        }}
      />

      {/* API Health & Diagnostics Monitor Modal */}
      <ApiStatusModal
        isOpen={isApiStatusModalOpen}
        onClose={() => setIsApiStatusModalOpen(false)}
        onKeyUpdated={() => triggerRefresh()}
      />

      {/* Location Switcher Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Transit Geolocation Settings</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Live GPS Detection Button */}
            <button
              onClick={() => {
                handleDetectGeolocation();
                setIsLocationModalOpen(false);
              }}
              disabled={isLocating}
              className="w-full py-2.5 px-3 bg-[#00704A] hover:bg-[#005a3b] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS Signal...' : 'Acquire My Device GPS (Browser)'}</span>
            </button>

            <p className="text-[11px] text-slate-500">
              Or pick an urban transit anchor point across Singapore:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {busStopsList.map(stop => (
                <button
                  key={stop.code}
                  onClick={() => {
                    setSelectedStopCode(stop.code);
                    setCurrentLocationName(`${stop.name}`);
                    if (stop.latitude && stop.longitude) {
                      setGpsCoords(formatCoordinates(stop.latitude, stop.longitude));
                    }
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedStopCode === stop.code
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{stop.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{stop.code}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stop.roadName} • {stop.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
