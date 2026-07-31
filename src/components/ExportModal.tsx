import React, { useState } from 'react';
import {
  X,
  Share2,
  FileImage,
  FileText,
  Printer,
  Code,
  Download,
  Loader2
} from 'lucide-react';
import {
  exportCompleteOrgChartImage,
  exportCompleteOrgChartPDF,
  printCompleteOrgChart,
  downloadStandaloneHtmlBundle
} from '../utils/exportUtils';
import type { Employee, BrandingConfig } from '../types/orgChart';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  branding: BrandingConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  employees,
  branding
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (type: 'png' | 'jpeg' | 'pdf' | 'svg' | 'print' | 'html') => {
    setIsExporting(true);
    setExportType(type);

    try {
      if (type === 'png' || type === 'jpeg' || type === 'svg') {
        await exportCompleteOrgChartImage(
          employees,
          branding,
          type,
          `${branding.companyName || 'Gallantt'}_OrgChart`
        );
      } else if (type === 'pdf') {
        await exportCompleteOrgChartPDF(
          employees,
          branding,
          `${branding.companyName || 'Gallantt'}_OrgChart.pdf`
        );
      } else if (type === 'print') {
        printCompleteOrgChart(employees, branding);
      } else if (type === 'html') {
        downloadStandaloneHtmlBundle(
          employees,
          branding,
          `${branding.companyName || 'Gallantt'}_OrgChart_Interactive.html`
        );
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex-shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold truncate">Export Complete Org Chart</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Exports 100% of ALL employees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
          {/* PNG Export */}
          <button
            onClick={() => handleExport('png')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileImage className="w-5 h-5" />
              </div>
              {isExporting && exportType === 'png' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">PNG Image (Complete)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">100% uncropped full org chart image</p>
            </div>
          </button>

          {/* JPEG Export */}
          <button
            onClick={() => handleExport('jpeg')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileImage className="w-5 h-5" />
              </div>
              {isExporting && exportType === 'jpeg' && (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">JPEG Image (Complete)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">100% uncropped compressed image</p>
            </div>
          </button>

          {/* PDF Document */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              {isExporting && exportType === 'pdf' && (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">PDF Document (Full Page)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Printable full-size vector PDF</p>
            </div>
          </button>

          {/* SVG Vector */}
          <button
            onClick={() => handleExport('svg')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Code className="w-5 h-5" />
              </div>
              {isExporting && exportType === 'svg' && (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">SVG Vector Graphic</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Scalable 100% full org chart SVG</p>
            </div>
          </button>

          {/* Print View */}
          <button
            onClick={() => handleExport('print')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Printer className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Print Complete Chart</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Prints 100% uncropped chart to printer</p>
            </div>
          </button>

          {/* Standalone HTML Bundle */}
          <button
            onClick={() => handleExport('html')}
            disabled={isExporting}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-300 dark:border-blue-500/40 hover:border-blue-500 text-left flex flex-col gap-2 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-md">
                <Download className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Standalone HTML Bundle</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Self-contained offline HTML report for HR</p>
            </div>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
