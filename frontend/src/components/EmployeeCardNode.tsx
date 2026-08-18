import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, ChevronDown, ChevronRight, Building2, MapPin, Crown, Zap, Wrench, UserPlus, AlertCircle } from 'lucide-react';
import type { TreeNode } from '../types/orgChart';
import { getLocationColorTheme } from '../utils/locationColors';
import { isShiftInchargeRole } from '../utils/excelParser';
import { isVacantEmployee } from '../utils/vacantUtils';

interface EmployeeNodeData {
  employee: TreeNode;
  hasChildren: boolean;
  isCollapsed: boolean;
  directReportsCount: number;
  totalSubtreeCount: number;
  blueCollarCount?: number;
  isShiftIncharge?: boolean;
  isSearchMatch?: boolean;
  isFilterMatch?: boolean;
  isFilteredOut?: boolean;
  isSelected?: boolean;
  onToggleExpand?: (id: string) => void;
  onSelectEmployee?: (emp: TreeNode) => void;
  primaryColor?: string;
}

export const EmployeeCardNode = memo(({ data }: { data: EmployeeNodeData }) => {
  const {
    employee,
    hasChildren,
    isCollapsed,
    directReportsCount,
    totalSubtreeCount,
    isSearchMatch,
    isFilterMatch,
    isFilteredOut,
    isSelected,
    onToggleExpand,
    onSelectEmployee
  } = data;

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isCEO = !employee.managerCode;
  const isShiftIncharge = employee.isShiftIncharge || isShiftInchargeRole(employee.designation);
  const isBlueCollar = employee.employeeCategory === 'Blue Collar';
  const isVacant = isVacantEmployee(employee);
  const locationTheme = getLocationColorTheme(employee.location);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(employee.employeeCode);
    }
  };

  const handleCardClick = () => {
    if (onSelectEmployee) {
      onSelectEmployee(employee);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative w-72 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden bg-white text-slate-900 ${
        isFilteredOut && !isSelected
          ? 'opacity-40 scale-95 border-slate-200 bg-white'
          : isSelected
          ? 'ring-4 ring-blue-500/50 border-blue-600 bg-white shadow-2xl scale-[1.02] z-10 opacity-100'
          : isSearchMatch
          ? 'ring-4 ring-amber-400/80 border-amber-500 bg-white shadow-2xl opacity-100'
          : isFilterMatch
          ? 'border-cyan-500 bg-white shadow-xl opacity-100'
          : isVacant
          ? 'border-2 border-dashed border-amber-400 bg-amber-50/30 hover:border-amber-500 shadow-md hover:shadow-xl opacity-100'
          : isShiftIncharge
          ? 'border-violet-300 bg-white hover:border-violet-500 shadow-md hover:shadow-xl opacity-100 ring-1 ring-violet-500/20'
          : isBlueCollar
          ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400 shadow-sm opacity-100'
          : 'border-slate-200 bg-white text-slate-900 hover:border-blue-500 shadow-md hover:shadow-xl opacity-100'
      }`}
    >
      {/* Location Site Color Accent Top Bar */}
      <div className={`h-1.5 w-full ${isVacant ? 'bg-gradient-to-r from-amber-400 to-amber-500' : isShiftIncharge ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : locationTheme.accentBgClass}`} title={`Site: ${employee.location || 'Default'}`} />

      {/* Top Handle for Manager Edge */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-600 !w-3.5 !h-3.5 !-top-1.5 border-2 border-white"
      />

      {/* Card Header Bar */}
      <div className={`py-1.5 px-3.5 w-full flex items-center justify-between border-b ${
        isVacant ? 'bg-amber-100/70 border-amber-200 text-amber-900' : isShiftIncharge ? 'bg-violet-50 border-violet-100 text-violet-900' : 'bg-slate-50 border-slate-100 text-slate-600'
      }`}>
        <span className="text-[10.5px] font-extrabold uppercase tracking-wider truncate flex items-center gap-1 text-slate-700">
          {employee.department || 'Executive'}
        </span>
        {isCEO ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs uppercase tracking-wider flex-shrink-0">
            <Crown className="w-3 h-3 text-amber-600" /> CMD
          </span>
        ) : isVacant ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs uppercase tracking-wider flex-shrink-0">
            <AlertCircle className="w-3 h-3 text-amber-100" /> VACANT ROLE
          </span>
        ) : isShiftIncharge ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-2xs uppercase tracking-wider flex-shrink-0">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> Shift Incharge
          </span>
        ) : isBlueCollar ? (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0">
            Blue Collar
          </span>
        ) : null}
      </div>

      <div className={`p-3.5 flex flex-col gap-2.5 ${isVacant ? 'bg-amber-50/20' : 'bg-white'}`}>
        {/* Header: Icon Avatar + Name & Designation */}
        <div className="flex items-center gap-2.5">
          {/* User Icon Badge */}
          <div className={`w-10 h-10 rounded-xl font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs border ${
            isVacant
              ? 'bg-amber-100 text-amber-700 border-dashed border-amber-300'
              : isShiftIncharge
              ? 'bg-violet-100 text-violet-800 border-violet-300'
              : isBlueCollar
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {isVacant ? <UserPlus className="w-5 h-5 text-amber-600" /> : initials || <User className="w-4 h-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className={`text-sm font-semibold tracking-tight leading-snug truncate ${isVacant ? 'text-amber-900 font-extrabold italic' : 'text-slate-900'}`}>
              {employee.name}
            </h4>
            <p className="text-[11.5px] font-medium text-slate-600 truncate mt-0.5">
              {employee.designation}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md border ${
                isVacant
                  ? 'bg-amber-100/80 text-amber-800 border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {employee.employeeCode}
              </span>
            </div>
          </div>
        </div>

        {/* Details: Dept & Business Unit & Location */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-[11px] text-slate-600">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 truncate">
              <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{employee.department}</span>
            </span>
            {employee.businessUnit && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[100px]">
                {employee.businessUnit}
              </span>
            )}
          </div>

          {employee.location && (
            <div className="flex items-center">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-[10px] font-bold shadow-2xs max-w-full truncate ${locationTheme.bgClass} ${locationTheme.borderClass} ${locationTheme.textClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${locationTheme.dotClass} flex-shrink-0 shadow-2xs`} />
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{employee.location}</span>
              </span>
            </div>
          )}
        </div>

        {/* Blue Collar Counter Display Pill (Only shown for Direct Reporting Manager) */}
        {(employee.blueCollarCount ?? 0) > 0 && (
          <div
            className="p-2.5 rounded-xl bg-amber-50/90 border-2 border-amber-300 flex items-center justify-between shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
            title="Click card to view list of Blue Collar employees in details modal"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 truncate">
                  Blue Collar Staff
                </span>
                <span className="text-[10px] font-extrabold text-amber-900 truncate">
                  Direct Workforce List
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs flex items-center gap-1 transition-all group-hover:translate-x-0.5 flex-shrink-0">
              <span>{employee.blueCollarCount}</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-100" />
            </span>
          </div>
        )}

        {/* Direct Reports Expand / Collapse Toggle Pill */}
        {hasChildren && (
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              onClick={handleToggle}
              className="w-full py-1.5 px-3 rounded-xl flex items-center justify-between text-[11px] font-bold transition-all border bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
            >
              <span className="flex items-center gap-1 text-blue-600">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span className="text-slate-800">{isCollapsed ? 'Show Reports' : 'Hide Reports'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-blue-600 text-white shadow-2xs">
                {directReportsCount} {totalSubtreeCount > directReportsCount ? `(${totalSubtreeCount} total)` : ''}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Handle for Direct Report Edges */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-600 !w-3.5 !h-3.5 !-bottom-1.5 border-2 border-white"
      />
    </div>
  );
});
