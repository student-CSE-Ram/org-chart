import React, { useState } from 'react';
import {
  Search,
  X,
  RotateCcw,
  ArrowDownUp,
  ArrowLeftRight,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { FilterState, LayoutOrientation } from '../types/orgChart';

interface SearchFilterBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  departments: string[];
  businessUnits: string[];
  locations: string[];
  designations: string[];
  orientation: LayoutOrientation;
  onToggleOrientation: () => void;
  matchCount: number;
  totalCount: number;
  isDarkMode: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  departments,
  businessUnits,
  locations,
  orientation,
  onToggleOrientation,
  matchCount,
  totalCount,
  isDarkMode
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.department !== '' ||
    filters.businessUnit !== '' ||
    filters.location !== '' ||
    filters.designation !== '' ||
    filters.employmentType !== '' ||
    (filters.employeeCategory ?? '') !== '' ||
    filters.status !== '';

  const activeFilterDropdownsCount = [
    filters.department,
    filters.businessUnit,
    filters.location,
    filters.employeeCategory,
    filters.status
  ].filter(Boolean).length;

  return (
    <div
      className={`absolute top-2 left-2 right-2 sm:top-4 sm:left-6 sm:right-6 z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Top Row / Main Bar */}
      <div className="flex items-center gap-2 w-full md:w-auto flex-1 min-w-0">
        {/* Global Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search Name, Code, Dept..."
            className={`w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
              isDarkMode
                ? 'bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-500'
                : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-500 focus:border-blue-500'
            }`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Expander */}
        <button
          onClick={() => setIsFilterPanelOpen((prev) => !prev)}
          className={`md:hidden px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
            activeFilterDropdownsCount > 0 || isFilterPanelOpen
              ? 'bg-blue-600/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300'
              : isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterDropdownsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterDropdownsCount}
            </span>
          )}
          {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Layout Orientation Switcher (Mobile icon view) */}
        <button
          onClick={onToggleOrientation}
          className={`md:hidden p-2 rounded-xl text-xs font-medium border transition-all ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
          title={`Switch Layout (${orientation})`}
        >
          {orientation === 'TB' ? <ArrowDownUp className="w-4 h-4 text-blue-500" /> : <ArrowLeftRight className="w-4 h-4 text-blue-500" />}
        </button>
      </div>

      {/* Middle Dropdown Filters: Always visible on desktop, toggleable on mobile */}
      <div
        className={`${
          isFilterPanelOpen ? 'flex' : 'hidden md:flex'
        } flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 md:pt-0 md:border-t-0`}
      >
        {/* Department Filter */}
        <select
          value={filters.department}
          onChange={(e) => onFilterChange({ department: e.target.value })}
          className={`px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none flex-1 md:flex-none ${
            isDarkMode
              ? 'bg-slate-800 border border-slate-700 text-slate-200 focus:border-blue-500'
              : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-500'
          }`}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Business Unit Filter */}
        {businessUnits.length > 0 && (
          <select
            value={filters.businessUnit}
            onChange={(e) => onFilterChange({ businessUnit: e.target.value })}
            className={`px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none flex-1 md:flex-none ${
              isDarkMode
                ? 'bg-slate-800 border border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="">All Business Units</option>
            {businessUnits.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        )}

        {/* Location Filter */}
        {locations.length > 0 && (
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            className={`px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none flex-1 md:flex-none ${
              isDarkMode
                ? 'bg-slate-800 border border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        )}

        {/* Employee Category Filter (White Collar vs Blue Collar) */}
        <select
          value={filters.employeeCategory || ''}
          onChange={(e) => onFilterChange({ employeeCategory: e.target.value })}
          className={`px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none flex-1 md:flex-none ${
            isDarkMode
              ? 'bg-slate-800 border border-slate-700 text-slate-200 focus:border-blue-500'
              : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-500'
          }`}
        >
          <option value="">All Worker Categories</option>
          <option value="White Collar">White Collar</option>
          <option value="Blue Collar">Blue Collar</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className={`px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none flex-1 md:flex-none ${
            isDarkMode
              ? 'bg-slate-800 border border-slate-700 text-slate-200 focus:border-blue-500'
              : 'bg-slate-100 border border-slate-200 text-slate-800 focus:border-blue-500'
          }`}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Right: Layout & Matching Indicator (Desktop View) */}
      <div className="hidden md:flex items-center gap-3">
        {hasActiveFilters && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {matchCount} / {totalCount} Matched
          </span>
        )}

        {/* Desktop Layout Orientation Switcher */}
        <button
          onClick={onToggleOrientation}
          className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border shadow-sm ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
          }`}
          title={`Switch Layout: Currently ${orientation === 'TB' ? 'Vertical (Top to Bottom)' : 'Horizontal (Left to Right)'}`}
        >
          {orientation === 'TB' ? (
            <>
              <ArrowDownUp className="w-4 h-4 text-blue-500" />
              <span>Vertical</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
              <span>Horizontal</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

