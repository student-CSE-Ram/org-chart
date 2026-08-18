import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile, validateOrgData, downloadErrorReportCSV } from '../utils/excelParser';
import type { Employee, ValidationResult } from '../types/orgChart';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish: (employees: Employee[]) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirmPublish
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'validation' | 'preview'>('validation');
  const [dragActive, setDragActive] = useState(false);
  const [parseErrorMessage, setParseErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setParseErrorMessage(null);

    try {
      const parsedEmployees = await parseExcelFile(selectedFile);
      const valResult = validateOrgData(parsedEmployees);
      setValidationResult(valResult);
    } catch (err) {
      setParseErrorMessage((err as Error).message);
      setValidationResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handlePublish = () => {
    if (validationResult && validationResult.parsedEmployees.length > 0) {
      onConfirmPublish(validationResult.parsedEmployees);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">Upload Employee Excel File</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Upload .xlsx or .xls files to generate hierarchy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 sm:gap-6">
          {/* File Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all flex flex-col items-center justify-center gap-2.5 ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shadow-md">
              <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                {file ? file.name : 'Drag and drop your Excel spreadsheet here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports .xlsx and .xls file formats
              </p>
            </div>
            <label className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer transition-colors shadow-sm">
              <span>Browse File</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <p className="text-xs font-medium">Reading spreadsheet & validating reporting hierarchy...</p>
            </div>
          )}

          {/* Error Message if parsing failed */}
          {parseErrorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{parseErrorMessage}</span>
            </div>
          )}

          {/* Validation Results & Preview */}
          {validationResult && !isProcessing && (
            <div className="flex flex-col gap-4">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">Total Rows</span>
                  <p className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">{validationResult.totalRecords}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] sm:text-[11px] font-medium text-emerald-400">Valid</span>
                  <p className="text-lg sm:text-xl font-bold text-emerald-300 mt-0.5">{validationResult.validCount}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[10px] sm:text-[11px] font-medium text-rose-400">Errors</span>
                  <p className="text-lg sm:text-xl font-bold text-rose-300 mt-0.5">{validationResult.errorCount}</p>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] sm:text-[11px] font-medium text-amber-400">Warnings</span>
                  <p className="text-lg sm:text-xl font-bold text-amber-300 mt-0.5">{validationResult.warningCount}</p>
                </div>
              </div>

              {/* Tabs for Validation Errors vs Data Preview */}
              <div className="flex items-center justify-between border-b border-slate-800 pt-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('validation')}
                    className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                      activeTab === 'validation'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Validation Report ({validationResult.errors.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                      activeTab === 'preview'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Data Preview ({validationResult.parsedEmployees.length})
                  </button>
                </div>

                {validationResult.errors.length > 0 && (
                  <button
                    onClick={() => downloadErrorReportCSV(validationResult.errors)}
                    className="pb-2 text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Error Report (.CSV)
                  </button>
                )}
              </div>

              {/* Tab Content: Validation Error Table */}
              {activeTab === 'validation' && (
                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                  {validationResult.errors.length === 0 ? (
                    <div className="p-8 text-center text-emerald-400 flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <p className="text-sm font-semibold">Validation Passed!</p>
                      <p className="text-xs text-slate-400">
                        All employee records and reporting hierarchy references are 100% valid.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/90 text-slate-300 sticky top-0">
                        <tr>
                          <th className="p-2.5 font-semibold">Row</th>
                          <th className="p-2.5 font-semibold">Emp Code</th>
                          <th className="p-2.5 font-semibold">Name</th>
                          <th className="p-2.5 font-semibold">Field</th>
                          <th className="p-2.5 font-semibold">Severity</th>
                          <th className="p-2.5 font-semibold">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {validationResult.errors.map((err, i) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                            <td className="p-2.5 font-mono text-slate-400">{err.row}</td>
                            <td className="p-2.5 font-mono font-medium">{err.employeeCode}</td>
                            <td className="p-2.5">{err.employeeName}</td>
                            <td className="p-2.5 font-medium text-slate-400">{err.field}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  err.severity === 'error'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {err.severity}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-300">{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Tab Content: Data Preview Table */}
              {activeTab === 'preview' && (
                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/90 text-slate-300 sticky top-0">
                      <tr>
                        <th className="p-2.5 font-semibold">Code</th>
                        <th className="p-2.5 font-semibold">Name</th>
                        <th className="p-2.5 font-semibold">Manager Code</th>
                        <th className="p-2.5 font-semibold">Designation</th>
                        <th className="p-2.5 font-semibold">Department</th>
                        <th className="p-2.5 font-semibold">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {validationResult.parsedEmployees.map((emp, i) => (
                        <tr key={i} className="hover:bg-slate-800/50">
                          <td className="p-2.5 font-mono text-blue-400 font-medium">{emp.employeeCode}</td>
                          <td className="p-2.5 font-semibold text-slate-100">{emp.name}</td>
                          <td className="p-2.5 font-mono text-slate-400">{emp.managerCode || '(CMD/Root)'}</td>
                          <td className="p-2.5">{emp.designation}</td>
                          <td className="p-2.5">{emp.department}</td>
                          <td className="p-2.5 text-slate-400">{emp.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePublish}
            disabled={!validationResult || validationResult.parsedEmployees.length === 0}
            className={`px-5 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
              validationResult && validationResult.parsedEmployees.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-emerald-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>Generate Organization Chart</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
