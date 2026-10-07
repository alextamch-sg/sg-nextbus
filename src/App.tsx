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
import {
  BUS_STOPS_DATABASE,
  INITIAL_SERVICES,
} from './data/singaporeTransitData';
import { BusService, BusStop } from './types/transit';

export default function App() {
  const [activeTab, setActiveTab] = useState<'nearby' | 'favorites' | 'explorer' | 'map'>('nearby');
  const [services, setServices] = useState<Record<string, BusService>>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<BusService>(INITIAL_SERVICES['65']);
  const [selectedStopCode, setSelectedStopCode] = useState<string>('08031');
  const [radiusFilter, setRadiusFilter] = useState<'200m' | '500m' | '1km'>('200m');
  const [favorites, setFavorites] = useState<string[]>(['65', '190']);
  
  // Real-time telemetry countdown ticker (15s cycle)
  const [syncCountdown, setSyncCountdown] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  // GPS Simulated Location
  const [currentLocationName, setCurrentLocationName] = useState<string>('Dhoby Ghaut / Orchard');
  const [gpsCoords, setGpsCoords] = useState<string>('1.2995° N, 103.8458° E');
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('±8m');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Handle manual or automatic telemetry refresh
  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setSyncCountdown(15);

    // Simulate subtle dynamic shifts in bus arrival minutes and distance
    setTimeout(() => {
      setServices(prev => {
        const next = { ...prev };
        // Jitter service 65 distance and arrivals
        if (next['65']) {
          const currentDistance = next['65'].activeBusTelemetry?.distanceToStopMeters || 30;
          const newDist = Math.max(10, (currentDistance + (Math.random() > 0.5 ? -10 : 5)));
          next['65'] = {
            ...next['65'],
            activeBusTelemetry: {
              ...next['65'].activeBusTelemetry!,
              distanceToStopMeters: newDist,
            },
          };
        }
        return next;
      });
      setIsRefreshing(false);
    }, 450);
  }, []);

  // Sync Countdown Timer Loop
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
  const filteredBusStops = BUS_STOPS_DATABASE.filter(stop => {
    if (radiusFilter === '200m') return stop.distanceMeters <= 250;
    if (radiusFilter === '500m') return stop.distanceMeters <= 500;
    return stop.distanceMeters <= 1000;
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
      />

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

      {/* Footer exactly matching the screenshot */}
      <footer className="mt-auto bg-white border-t border-slate-200 px-4 lg:px-6 py-2.5 text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Data sourced via LTA DataMall v2 API • Real-time telemetry refreshed every 15s</span>
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
        busStops={BUS_STOPS_DATABASE}
        onSelectService={service => {
          setSelectedService(service);
          setActiveTab('nearby');
        }}
        onSelectStop={stopCode => {
          setSelectedStopCode(stopCode);
          setActiveTab('nearby');
        }}
      />

      {/* Location Switcher Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Simulate Transit Geolocation</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an urban transit anchor point across Singapore:
            </p>

            <div className="space-y-2">
              {[
                { name: 'Dhoby Ghaut / Orchard', coords: '1.2995° N, 103.8458° E', acc: '±8m', stopCode: '08031' },
                { name: 'Somerset / 313 Shopping Belt', coords: '1.3008° N, 103.8382° E', acc: '±6m', stopCode: '09037' },
                { name: 'Clarke Quay / Riverside', coords: '1.2887° N, 103.8465° E', acc: '±12m', stopCode: '04229' },
                { name: 'Raffles Place / Financial Ctr', coords: '1.2839° N, 103.8515° E', acc: '±5m', stopCode: '03391' },
              ].map(loc => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setCurrentLocationName(loc.name);
                    setGpsCoords(loc.coords);
                    setGpsAccuracy(loc.acc);
                    setSelectedStopCode(loc.stopCode);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    currentLocationName === loc.name
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900">{loc.name}</div>
                  <div className="font-mono text-[10px] text-slate-400 mt-0.5">{loc.coords} ({loc.acc})</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
