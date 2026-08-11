import React, { useState, useMemo } from 'react';
import { MapPin, X, Globe, Search, Check } from 'lucide-react';
import { getLocationColorTheme } from '../utils/locationColors';

interface LocationLegendProps {
  locations: string[];
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  isDarkMode: boolean;
}

export const LocationLegend: React.FC<LocationLegendProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  isDarkMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!locations || locations.length === 0) return null;

  // Identify front locations: Gorakhpur & Gujarat/Gujrat
  const frontLocations = useMemo(() => {
    const gorakhpur = locations.find((l) => l.toLowerCase().includes('gorakhpur'));
    const gujarat = locations.find((l) => l.toLowerCase().includes('gujarat') || l.toLowerCase().includes('gujrat'));

    const items: string[] = [];
    if (gorakhpur) items.push(gorakhpur);
    if (gujarat && gujarat !== gorakhpur) items.push(gujarat);

    // Fallbacks if not found in current dataset
    locations.forEach((loc) => {
      if (items.length < 2 && !items.includes(loc)) {
        items.push(loc);
      }
    });

    return items;
  }, [locations]);

  // Filtered locations for the modal popover
  const modalFilteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter((loc) => loc.toLowerCase().includes(q));
  }, [locations, searchQuery]);

  return (
    <>
      {/* Fixed Front Bar on Canvas */}
      <div
        className={`absolute bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:bottom-6 z-20 flex flex-wrap items-center gap-2 p-2 sm:p-2.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all max-w-full sm:max-w-2xl ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mr-1 flex-shrink-0 select-none">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Sites:</span>
        </div>

        {/* Front Featured Locations (Gorakhpur & Gujarat) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {frontLocations.map((loc) => {
            const theme = getLocationColorTheme(loc);
            const isSelected = selectedLocation === loc;

            // Short display label
            const shortName = loc.toLowerCase().includes('gorakhpur')
              ? 'Gorakhpur'
              : loc.toLowerCase().includes('gujarat') || loc.toLowerCase().includes('gujrat')
              ? 'Gujarat'
              : loc;

            return (
              <button
                key={loc}
                onClick={() => onSelectLocation(isSelected ? '' : loc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  theme.bgClass
                } ${theme.borderClass} ${theme.textClass} ${
                  isSelected
                    ? 'ring-2 ring-blue-500 scale-105 shadow-md font-black'
                    : 'hover:scale-102 hover:shadow-xs opacity-95 hover:opacity-100'
                }`}
                title={`Filter by ${loc}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${theme.dotClass} shadow-xs flex-shrink-0`} />
                <span className="truncate">{shortName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}

          {/* "See All Locations" Trigger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-blue-600'
            }`}
            title="View all plant and office locations"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>See All Locations ({locations.length})</span>
          </button>

          {/* Clear Selected Filter Pill */}
          {selectedLocation && (
            <button
              onClick={() => onSelectLocation('')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 flex items-center gap-1 transition-colors flex-shrink-0"
              title="Clear Site Filter"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* "See All Locations" Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-scaleUp transition-colors ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-5 py-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">All Company Locations</h3>
                  <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select a site to filter the org chart view ({locations.length} total sites)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search site location name..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-500'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Modal Locations Grid List */}
            <div className="p-4 overflow-y-auto max-h-80 flex flex-col gap-2">
              {/* Reset Option */}
              <button
                onClick={() => {
                  onSelectLocation('');
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                  selectedLocation === ''
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : isDarkMode
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>All Sites (Show Entire Org Chart)</span>
                </span>
                {selectedLocation === '' && <Check className="w-4 h-4 text-white" />}
              </button>

              {/* Individual Site Buttons */}
              {modalFilteredLocations.map((loc) => {
                const theme = getLocationColorTheme(loc);
                const isSelected = selectedLocation === loc;

                return (
                  <button
                    key={loc}
                    onClick={() => {
                      onSelectLocation(isSelected ? '' : loc);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all ${
                      theme.bgClass
                    } ${theme.borderClass} ${theme.textClass} ${
                      isSelected ? 'ring-2 ring-blue-500 scale-[1.01] shadow-md' : 'hover:scale-[1.01] opacity-95 hover:opacity-100'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-3 h-3 rounded-full ${theme.dotClass} shadow-xs flex-shrink-0`} />
                      <span className="truncate">{loc}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-300 flex-shrink-0" />}
                  </button>
                );
              })}

              {modalFilteredLocations.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching locations found.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`px-5 py-3 border-t flex justify-end ${
                isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
              }`}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
