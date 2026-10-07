import React from 'react';
import { Search, Compass, RefreshCw, User, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: 'nearby' | 'favorites' | 'explorer' | 'map';
  setActiveTab: (tab: 'nearby' | 'favorites' | 'explorer' | 'map') => void;
  favoritesCount: number;
  syncCountdown: number;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  currentLocationName: string;
  onToggleLocationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  syncCountdown,
  onOpenSearch,
  onRefresh,
  isRefreshing,
  currentLocationName,
  onToggleLocationModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Sync Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('nearby')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-600/30">
              {/* SG Bus Logo Icon */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" />
                <path d="M15 6v6" />
                <path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-3-2-6-7-6H9c-5 0-7 3-7 6 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-extrabold text-[17px] tracking-tight text-slate-900 font-sans">
                  SGNextBus
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mt-0.5">
                LTA Datamall Live
              </span>
            </div>
          </div>

          {/* LTA Data Live Sync badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 border border-emerald-200/90 rounded-full text-[11px] font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LTA Data Live Sync</span>
          </div>
        </div>

        {/* Center: Search trigger & Navigation tabs */}
        <div className="flex items-center gap-2 lg:gap-3 flex-1 max-w-2xl justify-center">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs transition-colors w-44 md:w-56 cursor-pointer"
            title="Search bus number, stop code, or road (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-left text-slate-400">Search bus or stop...</span>
            <span className="ml-auto text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono shadow-2xs font-semibold">
              ⌘ K
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'nearby'
                  ? 'bg-[#00704A] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Nearby Stops
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-[#00704A] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Favorite Routes</span>
              {favoritesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`hidden md:inline-flex px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'explorer'
                  ? 'bg-[#00704A] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Route Explorer
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-[#00704A] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Service Map
            </button>
          </nav>
        </div>

        {/* Right: GPS Location, Refresh Ticker & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Current GPS button */}
          <button
            onClick={onToggleLocationModal}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-slate-400 block font-medium">Current GPS</span>
              <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate block">
                {currentLocationName}
              </span>
            </div>
          </button>

          {/* Sync status ring */}
          <div
            onClick={onRefresh}
            role="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
            title="Click to force refresh telemetry now"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="font-mono text-slate-700">{syncCountdown}s</span>
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium shadow-xs border border-slate-300">
            <User className="w-4 h-4 text-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
};
