import React, { useState } from 'react';
import {
  Upload,
  Palette,
  History,
  FileSpreadsheet,
  Building,
  Maximize2,
  Minimize2,
  Share2,
  Sun,
  Moon,
  PanelLeft,
  MoreVertical,
  UserPlus,
  Shield,
  X
} from 'lucide-react';
import type { BrandingConfig } from '../types/orgChart';

interface HeaderProps {
  branding: BrandingConfig;
  totalEmployeesCount: number;
  totalVacantCount?: number;
  onSelectVacantFilter?: () => void;
  onOpenUploadModal: () => void;
  onOpenBrandingModal: () => void;
  onOpenVersionModal: () => void;
  onOpenExportModal: () => void;
  onOpenAddEmployeeModal?: () => void;
  onDownloadTemplate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  userRole: string;
  onRoleChange: (newRole: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  branding,
  totalEmployeesCount,
  totalVacantCount = 0,
  onSelectVacantFilter,
  onOpenUploadModal,
  onOpenBrandingModal,
  onOpenVersionModal,
  onOpenExportModal,
  onOpenAddEmployeeModal,
  onDownloadTemplate,
  isFullscreen,
  onToggleFullscreen,
  isDarkMode,
  onToggleTheme,
  isSidebarOpen,
  onToggleSidebar,
  userRole,
  onRoleChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthorizedRole = ['Admin', 'CMD', 'CEO', 'Director', 'HOD'].some(
    (r) => r.toLowerCase() === userRole.toLowerCase()
  );

  return (
    <header
      className={`h-14 md:h-16 px-2.5 sm:px-4 md:px-6 border-b flex items-center justify-between z-30 select-none shadow-xs backdrop-blur-md transition-colors relative gap-1.5 sm:gap-2 ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      {/* Left Section: Sidebar Toggle + Logo & Branding Title + Badges */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-shrink">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 sm:p-2 rounded-xl border transition-all flex-shrink-0 ${
            isSidebarOpen
              ? 'bg-blue-600/10 text-blue-600 border-blue-500/30'
              : isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle Left Hierarchy Sidebar"
        >
          <PanelLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {branding.companyLogoUrl ? (
          <img
            src={branding.companyLogoUrl}
            alt={branding.companyName}
            className="h-6 sm:h-8 md:h-9 max-w-[60px] xs:max-w-[90px] sm:max-w-[130px] md:max-w-[160px] object-contain rounded flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-xs sm:text-sm flex-shrink-0"
            style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
          >
            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </div>
        )}

        <div className="min-w-0 flex items-center gap-1 sm:gap-2 truncate">
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg font-extrabold tracking-tight truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[220px] md:max-w-none">
            {branding.companyName || 'Enterprise Org Chart'}
          </h1>

          {/* Total Count Badge */}
          <span
            className={`px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-bold rounded-full border flex-shrink-0 whitespace-nowrap ${
              isDarkMode
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {totalEmployeesCount} Total
          </span>

          {/* Vacant Count Badge (ALWAYS VISIBLE) */}
          <button
            onClick={onSelectVacantFilter}
            className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-extrabold rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer whitespace-nowrap"
            title="Click to view all vacant positions"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{totalVacantCount} Vacant</span>
          </button>
        </div>
      </div>

      {/* Right Section: Action Toolbar (Desktop >= 768px) */}
      <div className="hidden md:flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Role Selector Badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 flex-shrink-0">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0 hidden lg:inline">Role:</span>
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer text-blue-700 dark:text-blue-300"
            title="Switch User Role to test permissions"
          >
            <option value="Admin">Admin</option>
            <option value="CMD">CMD</option>
            <option value="CEO">CEO</option>
            <option value="Director">Director</option>
            <option value="HOD">HOD</option>
            <option value="Employee">Employee (Read Only)</option>
          </select>
        </div>

        {/* Add Employee Button (Authorized roles only) */}
        {isAuthorizedRole && onOpenAddEmployeeModal && (
          <button
            onClick={onOpenAddEmployeeModal}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0"
            title="Add a new employee to the DB & Org Chart"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">+ Add Employee</span>
          </button>
        )}

        {/* Upload Excel */}
        <button
          onClick={onOpenUploadModal}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0"
          style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
          title="Upload employee Excel file (.xlsx / .xls)"
        >
          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Upload Excel</span>
        </button>

        {/* Export Options */}
        <button
          onClick={onOpenExportModal}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Export Chart as PNG, PDF, SVG, or Standalone HTML"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
          <span className="whitespace-nowrap hidden lg:inline">Export</span>
        </button>

        {/* Download Excel Template */}
        <button
          onClick={onDownloadTemplate}
          className={`p-2 lg:px-3 lg:py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Download formatted Excel template (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span className="whitespace-nowrap hidden xl:inline">Template</span>
        </button>

        {/* Version History Icon Button */}
        <button
          onClick={onOpenVersionModal}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Version History & Snapshots"
        >
          <History className="w-4 h-4 text-purple-500" />
        </button>

        {/* Admin Branding Icon Button */}
        <button
          onClick={onOpenBrandingModal}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title="Customize Company Logo & Theme Colors"
        >
          <Palette className="w-4 h-4 text-amber-500" />
        </button>

        {/* Light / Dark Mode Switcher */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
          title={`Switch Theme (Currently ${isDarkMode ? 'Dark' : 'Light'})`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Right Section: Compact Touch Controls on Mobile (< 768px) */}
      <div className="flex md:hidden items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {isAuthorizedRole && onOpenAddEmployeeModal && (
          <button
            onClick={onOpenAddEmployeeModal}
            className="p-1.5 xs:px-2.5 xs:py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            title="Add Employee"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+ Add</span>
          </button>
        )}

        <button
          onClick={onOpenUploadModal}
          className="p-1.5 xs:px-2.5 xs:py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
          style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
          title="Upload Excel"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Upload</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="More Actions Menu"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile & Small Tablet Dropdown Sheet Menu */}
      {isMobileMenuOpen && (
        <div
          className={`fixed top-14 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] max-w-xs rounded-2xl border shadow-2xl p-3 flex flex-col gap-2 max-h-[85vh] overflow-y-auto backdrop-blur-xl transition-all md:hidden ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-800 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          {/* Role Switcher in Mobile Menu */}
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Role:
            </span>
            <select
              value={userRole}
              onChange={(e) => {
                onRoleChange(e.target.value);
              }}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer text-blue-700 dark:text-blue-300"
            >
              <option value="Admin">Admin</option>
              <option value="CMD">CMD</option>
              <option value="CEO">CEO</option>
              <option value="Director">Director</option>
              <option value="HOD">HOD</option>
              <option value="Employee">Employee</option>
            </select>
          </div>

          <button
            onClick={() => {
              onDownloadTemplate();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Download Excel Template</span>
          </button>

          <button
            onClick={() => {
              onOpenExportModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>Export Chart</span>
          </button>

          <button
            onClick={() => {
              onOpenVersionModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <History className="w-4 h-4 text-purple-500" />
            <span>Version Snapshots</span>
          </button>

          <button
            onClick={() => {
              onOpenBrandingModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Branding Config</span>
          </button>

          <button
            onClick={() => {
              onToggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={() => {
              onToggleFullscreen();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
