import React from 'react';
import { MapPin, X } from 'lucide-react';
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
  if (!locations || locations.length === 0) return null;

  return (
    <div
      className={`absolute bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:bottom-6 z-20 flex flex-wrap items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all max-w-full sm:max-w-2xl overflow-x-auto ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex-shrink-0 select-none">
        <MapPin className="w-3.5 h-3.5 text-rose-500" />
        <span>Sites:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {locations.map((loc) => {
          const theme = getLocationColorTheme(loc);
          const isSelected = selectedLocation === loc;

          return (
            <button
              key={loc}
              onClick={() => onSelectLocation(isSelected ? '' : loc)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                theme.bgClass
              } ${theme.borderClass} ${theme.textClass} ${
                isSelected
                  ? 'ring-2 ring-blue-500 scale-105 shadow-md font-extrabold'
                  : 'hover:scale-102 hover:shadow-xs opacity-90 hover:opacity-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${theme.dotClass} shadow-2xs`} />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">{loc}</span>
            </button>
          );
        })}

        {selectedLocation && (
          <button
            onClick={() => onSelectLocation('')}
            className="px-2 py-1 rounded-xl text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 flex items-center gap-1 transition-colors flex-shrink-0"
            title="Clear Site Filter"
          >
            <X className="w-3 h-3" />
            <span>Clear Site</span>
          </button>
        )}
      </div>
    </div>
  );
};
