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
  MoreVertical
} from 'lucide-react';
import type { BrandingConfig } from '../types/orgChart';

interface HeaderProps {
  branding: BrandingConfig;
  totalEmployeesCount: number;
  onOpenUploadModal: () => void;
  onOpenBrandingModal: () => void;
  onOpenVersionModal: () => void;
  onOpenExportModal: () => void;
  onDownloadTemplate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  branding,
  totalEmployeesCount,
  onOpenUploadModal,
  onOpenBrandingModal,
  onOpenVersionModal,
  onOpenExportModal,
  onDownloadTemplate,
  isFullscreen,
  onToggleFullscreen,
  isDarkMode,
  onToggleTheme,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={`h-16 px-3 sm:px-6 border-b flex items-center justify-between z-30 select-none shadow-sm backdrop-blur-md transition-colors relative ${isDarkMode
        ? 'bg-slate-900/95 border-slate-800 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
    >
      {/* Left: Sidebar Toggle + Branding Logo & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${isSidebarOpen
            ? 'bg-blue-600/10 text-blue-600 border-blue-500/30'
            : isDarkMode
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          title="Toggle Left Hierarchy Sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {branding.companyLogoUrl ? (
          <img
            src={branding.companyLogoUrl}
            alt={branding.companyName}
            className="h-8 sm:h-9 max-w-[100px] sm:max-w-[140px] object-contain rounded flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base sm:text-lg flex-shrink-0"
            style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
          >
            <Building className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate">
              {branding.companyName || 'Enterprise Org Chart'}
            </h1>
            <span
              className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold rounded-full border flex-shrink-0 ${isDarkMode
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
            >
              {totalEmployeesCount} Emp
            </span>
          </div>
          <p className={`text-[10px] sm:text-[11px] font-medium truncate hidden md:block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Interactive Organizational Hierarchy Generator
          </p>
        </div>
      </div>

      {/* Right: Actions & Tools (Desktop) */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Light / Dark Mode Switcher */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          title={`Switch Theme (Currently ${isDarkMode ? 'Dark' : 'Light'})`}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-700">Dark Mode</span>
            </>
          )}
        </button>

        <div className={`h-6 w-px my-auto mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Download Template */}
        <button
          onClick={onDownloadTemplate}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-sm ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          title="Download formatted Excel template (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Excel Template</span>
        </button>

        {/* Upload Excel */}
        <button
          onClick={onOpenUploadModal}
          className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg"
          style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
          title="Upload employee Excel file (.xlsx / .xls)"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Excel</span>
        </button>

        {/* Export Options */}
        <button
          onClick={onOpenExportModal}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          title="Export Chart as PNG, PDF, SVG, or Standalone HTML"
        >
          <Share2 className="w-4 h-4 text-blue-500" />
          <span>Export</span>
        </button>

        {/* Version History */}
        <button
          onClick={onOpenVersionModal}
          className={`p-2 rounded-lg border transition-all ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          title="Version History & Snapshots"
        >
          <History className="w-4 h-4 text-purple-500" />
        </button>

        {/* Admin Branding */}
        <button
          onClick={onOpenBrandingModal}
          className={`p-2 rounded-lg border transition-all ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          title="Customize Company Logo & Theme Colors"
        >
          <Palette className="w-4 h-4 text-amber-500" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className={`p-2 rounded-lg border transition-all ${isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Right: Actions & Tools (Mobile View) */}
      <div className="flex md:hidden items-center gap-1.5">
        <button
          onClick={onOpenUploadModal}
          className="px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
          style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`p-2 rounded-lg border transition-all ${isDarkMode
            ? 'bg-slate-800 border-slate-700 text-slate-200'
            : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Actions Dropdown Sheet / Menu */}
      {isMobileMenuOpen && (
        <div
          className={`absolute top-16 right-3 z-50 w-56 rounded-2xl border shadow-xl p-2 flex flex-col gap-1 transition-all md:hidden ${isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
            }`}
        >
          <button
            onClick={() => {
              onDownloadTemplate();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel Template</span>
          </button>

          <button
            onClick={() => {
              onOpenExportModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>Export Chart</span>
          </button>

          <button
            onClick={() => {
              onOpenVersionModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <History className="w-4 h-4 text-purple-500" />
            <span>Version Snapshots</span>
          </button>

          <button
            onClick={() => {
              onOpenBrandingModal();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Branding Config</span>
          </button>

          <button
            onClick={() => {
              onToggleTheme();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={() => {
              onToggleFullscreen();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

