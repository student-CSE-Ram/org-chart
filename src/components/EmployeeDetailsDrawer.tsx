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
  Crown,
  Wrench,
  Users
} from 'lucide-react';
import type { TreeNode, Employee } from '../types/orgChart';
import { getLocationColorTheme } from '../utils/locationColors';

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
  const locationTheme = getLocationColorTheme(employee.location);

  // Find manager
  const manager = allEmployees.find((emp) => emp.employeeCode === employee.managerCode);

  // Find direct reportees split by worker category
  const directReports = allEmployees.filter(
    (emp) => emp.managerCode === employee.employeeCode
  );
  const whiteCollarReports = directReports.filter((e) => e.employeeCategory !== 'Blue Collar');
  const blueCollarReports = directReports.filter((e) => e.employeeCategory === 'Blue Collar');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/35 backdrop-blur-xs animate-fadeIn">
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
                <Crown className="w-3 h-3 text-amber-600" /> CMD
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                employee.status?.toLowerCase() === 'active'
                  ? isDarkMode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDarkMode
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
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
              <h2 className={`text-base sm:text-xl font-bold tracking-normal truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{employee.name}</h2>
              <p className={`text-xs sm:text-sm font-semibold mt-0.5 truncate ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
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
              <div className="flex items-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${locationTheme.bgClass} ${locationTheme.borderClass} ${locationTheme.textClass}`}>
                  <span className={`w-2 h-2 rounded-full ${locationTheme.dotClass} flex-shrink-0`} />
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{employee.location}</span>
                </span>
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

            <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
              <span className="font-semibold text-slate-500">Worker Category:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                employee.employeeCategory === 'Blue Collar'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {employee.employeeCategory || 'White Collar'}
              </span>
            </div>
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
                Top Level Executive (CMD)
              </div>
            )}
          </div>

          {/* White Collar Direct Reports Section */}
          {whiteCollarReports.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  White Collar Direct Reports ({whiteCollarReports.length})
                </h3>
              </div>

              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
                {whiteCollarReports.map((report) => (
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
            </div>
          )}

          {/* Blue Collar Workforce Breakdown List for Direct Managers / Shift Incharges */}
          {blueCollarReports.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                    Blue Collar Direct Workforce
                  </h3>
                </div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {blueCollarReports.length} {blueCollarReports.length === 1 ? 'Worker' : 'Workers'}
                </span>
              </div>

              <div className={`flex flex-col gap-2 max-h-56 overflow-y-auto p-2.5 rounded-2xl border shadow-inner ${
                isDarkMode ? 'bg-slate-950/60 border-amber-500/20' : 'bg-gradient-to-b from-amber-50/50 to-amber-100/30 border-amber-200/80'
              }`}>
                {blueCollarReports.map((worker) => (
                  <div
                    key={worker.employeeCode}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-100'
                        : 'bg-white border-amber-200/90 text-slate-950 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center flex-shrink-0 border ${
                        isDarkMode
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      }`}>
                        {worker.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold text-sm truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-950'}`}>
                            {worker.name}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            isDarkMode
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}>
                            {worker.employeeCode}
                          </span>
                        </div>
                        <p className={`text-[11px] font-semibold truncate mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
                          {worker.designation} {worker.employmentType ? `• ${worker.employmentType}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-lg flex-shrink-0 ${
                      isDarkMode
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-amber-500 text-white font-black shadow-2xs'
                    }`}>
                      Blue Collar
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback if no reportees at all */}
          {whiteCollarReports.length === 0 && blueCollarReports.length === 0 && (
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
