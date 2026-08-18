import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  RotateCcw,
  ArrowDownUp,
  ArrowLeftRight,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import type { Employee, FilterState, LayoutOrientation } from '../types/orgChart';

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
  employees: Employee[];
  onGoToEmployee: (employeeCode: string) => void;
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
  isDarkMode,
  employees,
  onGoToEmployee
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isBarMinimized, setIsBarMinimized] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const matchingEmployees = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();
    if (!query) return [];
    return employees.filter((emp) => {
      return (
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query) ||
        (emp.location && emp.location.toLowerCase().includes(query)) ||
        (emp.businessUnit && emp.businessUnit.toLowerCase().includes(query))
      );
    });
  }, [employees, filters.searchQuery]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [filters.searchQuery]);

  const handleGo = useCallback(
    (targetIdx?: number) => {
      if (matchingEmployees.length === 0) return;
      const idx = targetIdx !== undefined ? targetIdx : currentMatchIndex;
      const emp = matchingEmployees[idx];
      if (emp) {
        onGoToEmployee(emp.employeeCode);
        setIsDropdownOpen(false);
        if (matchingEmployees.length > 1 && targetIdx === undefined) {
          setCurrentMatchIndex((prev) => (prev + 1) % matchingEmployees.length);
        }
      }
    },
    [matchingEmployees, currentMatchIndex, onGoToEmployee]
  );

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

  // Minimized Trigger Button View when bar is hidden
  if (isBarMinimized) {
    return (
      <button
        onClick={() => setIsBarMinimized(false)}
        className={`absolute top-2 left-2 sm:top-4 sm:left-6 z-20 px-3.5 py-2 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 ${
          isDarkMode
            ? 'bg-slate-900/95 border-slate-800 text-slate-100 hover:bg-slate-800'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/60 hover:bg-slate-50'
        }`}
        title="Show Search & Filter Bar"
      >
        <div className="p-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
          <Search className="w-4 h-4" />
        </div>
        <span>Search & Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Active filters applied" />
        )}
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <div
      className={`absolute top-2 left-2 right-2 sm:top-4 sm:left-6 sm:right-6 z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Backdrop overlay to dismiss dropdown on outside click */}
      {isDropdownOpen && matchingEmployees.length > 0 && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Top Row / Main Bar */}
      <div className="flex items-center gap-2 w-full md:w-auto flex-1 min-w-0 z-40">
        {/* Hide / Collapse Bar Toggle Button */}
        <button
          onClick={() => setIsBarMinimized(true)}
          className={`p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border transition-all shrink-0 ${
            isDarkMode
              ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
          }`}
          title="Hide Search & Filter Bar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Global Search Input & Go Button */}
        <div className="relative flex-1 min-w-0 flex items-center gap-1.5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                onFilterChange({ searchQuery: e.target.value });
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGo();
                } else if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                }
              }}
              placeholder="Search Name, Code, Dept... (Press Enter or Go)"
              className={`w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl text-xs font-medium focus:outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-500 focus:border-blue-500'
              }`}
            />
            {filters.searchQuery && (
              <button
                onClick={() => {
                  onFilterChange({ searchQuery: '' });
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Candidate Search Matches Dropdown Menu */}
            {isDropdownOpen && matchingEmployees.length > 0 && (
              <div
                className={`absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl border shadow-2xl z-50 py-1.5 transition-all ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div
                  className={`px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-between border-b ${
                    isDarkMode
                      ? 'border-slate-800 text-slate-400 bg-slate-900'
                      : 'border-slate-100 text-slate-500 bg-slate-50'
                  }`}
                >
                  <span>Matching Employees ({matchingEmployees.length})</span>
                  <span>Click or Press Go</span>
                </div>
                {matchingEmployees.slice(0, 8).map((emp, index) => {
                  const isSelected = index === currentMatchIndex;
                  return (
                    <button
                      key={emp.employeeCode}
                      onClick={() => {
                        setCurrentMatchIndex(index);
                        handleGo(index);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-all border-l-4 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-slate-800 border-blue-500 text-slate-100 font-bold'
                            : 'bg-blue-50 border-blue-600 text-blue-950 font-bold'
                          : isDarkMode
                          ? 'border-transparent text-slate-200 hover:bg-slate-800/60'
                          : 'border-transparent text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold truncate text-xs ${
                              isSelected
                                ? isDarkMode
                                  ? 'text-blue-300'
                                  : 'text-blue-950 font-black'
                                : isDarkMode
                                ? 'text-slate-100'
                                : 'text-slate-900'
                            }`}
                          >
                            {emp.name}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                              isSelected
                                ? isDarkMode
                                  ? 'bg-blue-900/80 text-blue-200 border border-blue-700/50'
                                  : 'bg-blue-200 text-blue-950 border border-blue-300'
                                : isDarkMode
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {emp.employeeCode}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected
                              ? isDarkMode
                                ? 'text-blue-200/80 font-medium'
                                : 'text-blue-800 font-medium'
                              : isDarkMode
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {emp.designation} &bull; {emp.department}
                        </span>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected
                            ? isDarkMode
                              ? 'text-blue-400 translate-x-0.5'
                              : 'text-blue-600 translate-x-0.5'
                            : 'text-slate-400 opacity-50'
                        }`}
                      />
                    </button>
                  );
                })}
                {matchingEmployees.length > 8 && (
                  <div
                    className={`px-3.5 py-2 text-[11px] font-semibold text-center border-t ${
                      isDarkMode
                        ? 'border-slate-800 text-slate-400 bg-slate-900'
                        : 'border-slate-100 text-slate-500 bg-slate-50'
                    }`}
                  >
                    +{matchingEmployees.length - 8} more matches... Press Go or Enter to cycle
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dedicated "Go" Navigation Button */}
          <button
            onClick={() => handleGo()}
            disabled={matchingEmployees.length === 0 && !filters.searchQuery.trim()}
            className={`px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
              matchingEmployees.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Focus & navigate directly to searched employee"
          >
            <span>Go</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
            {matchingEmployees.length > 1 && (
              <span className="text-[10px] bg-blue-700 px-1.5 py-0.5 rounded-full text-white font-mono">
                {currentMatchIndex + 1}/{matchingEmployees.length}
              </span>
            )}
          </button>
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
          <option value="Vacant">Vacant Only</option>
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

