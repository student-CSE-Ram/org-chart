import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  ChevronRight,
  Focus,
  Crown
} from 'lucide-react';
import type { TreeNode, Employee } from '../types/orgChart';

interface EmployeeDetailsDrawerProps {
  employee: TreeNode | null;
  allEmployees: Employee[];
  onClose: () => void;
  onSelectEmployeeByCode: (code: string) => void;
  onFocusNode: (code: string) => void;
  isDarkMode?: boolean;
}

export const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({
  employee,
  allEmployees,
  onClose,
  onSelectEmployeeByCode,
  onFocusNode,
  isDarkMode = false
}) => {
  if (!employee) return null;

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isCEO = !employee.managerCode;

  // Find manager
  const manager = allEmployees.find((emp) => emp.employeeCode === employee.managerCode);

  // Find direct reportees
  const directReports = allEmployees.filter(
    (emp) => emp.managerCode === employee.employeeCode
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-scaleUp transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Card Header */}
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                isDarkMode
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {employee.employeeCode}
            </span>
            {isCEO && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" /> CEO
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                employee.status?.toLowerCase() === 'active'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {employee.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                onFocusNode(employee.employeeCode);
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              title="Focus & Center on Node in Chart"
            >
              <Focus className="w-3.5 h-3.5" />
              <span>Focus</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5 sm:gap-6">
          {/* User Icon Avatar & Headline */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-700 border-2 border-blue-200 font-extrabold text-lg sm:text-xl flex items-center justify-center flex-shrink-0 shadow-md">
              {initials || <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">{employee.name}</h2>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                {employee.designation}
              </p>
              <p className={`text-[11px] sm:text-xs mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {employee.department} {employee.businessUnit ? `• ${employee.businessUnit}` : ''}
              </p>
            </div>
          </div>

          {/* Contact & Detail Items Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border text-xs ${
              isDarkMode
                ? 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 hover:text-blue-500 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">{employee.email}</span>
              </a>
            )}

            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center gap-2 hover:text-blue-500 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{employee.phone}</span>
              </a>
            )}

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="truncate">{employee.department}</span>
            </div>

            {employee.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="truncate">{employee.location}</span>
              </div>
            )}

            {employee.dateOfJoining && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Joined: {employee.dateOfJoining}</span>
              </div>
            )}

            {employee.employmentType && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Type: {employee.employmentType}</span>
              </div>
            )}
          </div>

          {/* Reporting Manager Section */}
          <div className="flex flex-col gap-2">
            <h3
              className={`text-xs font-bold uppercase tracking-wider ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Reporting Manager
            </h3>
            {manager ? (
              <div
                onClick={() => onSelectEmployeeByCode(manager.employeeCode)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200">
                    {manager.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{manager.name}</h4>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {manager.designation}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ) : (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  isDarkMode
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                Top Level Executive (CEO / MD)
              </div>
            )}
          </div>

          {/* Direct Reports Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Direct Reports ({directReports.length})
              </h3>
              <span className="text-[11px] text-blue-500 font-semibold">
                Total Subtree: {employee.totalSubtreeCount}
              </span>
            </div>

            {directReports.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                {directReports.map((report) => (
                  <div
                    key={report.employeeCode}
                    onClick={() => onSelectEmployeeByCode(report.employeeCode)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode
                        ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-200">
                        {report.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold">{report.name}</h4>
                        <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {report.designation}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  isDarkMode
                    ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                No direct reports.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex justify-end ${
            isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/90'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
