import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, ChevronDown, ChevronRight, Building2, MapPin, Crown } from 'lucide-react';
import type { TreeNode } from '../types/orgChart';

interface EmployeeNodeData {
  employee: TreeNode;
  hasChildren: boolean;
  isCollapsed: boolean;
  directReportsCount: number;
  totalSubtreeCount: number;
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
      className={`relative w-64 rounded-2xl border transition-all duration-200 cursor-pointer select-none overflow-hidden bg-white text-slate-900 ${
        isFilteredOut
          ? 'opacity-30 scale-95 border-slate-200 bg-white'
          : isSelected
          ? 'ring-4 ring-blue-500/40 border-blue-600 bg-white shadow-2xl'
          : isSearchMatch
          ? 'ring-4 ring-amber-400/80 border-amber-500 bg-white shadow-2xl'
          : isFilterMatch
          ? 'border-cyan-500 bg-white shadow-xl'
          : 'border-slate-200 bg-white text-slate-900 hover:border-blue-400 shadow-md hover:shadow-xl'
      }`}
    >
      {/* Top Handle for Manager Edge */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-600 !w-3.5 !h-3.5 !-top-1.5 border-2 border-white"
      />

      {/* Lighter Card Header Bar */}
      <div className="py-2 px-3.5 w-full flex items-center justify-between bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">
          {employee.department || 'Executive'}
        </span>
        {isCEO ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs uppercase tracking-wider flex-shrink-0">
            <Crown className="w-3 h-3 text-amber-600" /> CEO / MD
          </span>
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Active Employee" />
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-2.5 bg-white">
        {/* Header: Icon Avatar + Name & Designation */}
        <div className="flex items-center gap-3">
          {/* User Icon Badge (No Photos) */}
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
            {initials || <User className="w-4 h-4 text-blue-600" />}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold text-slate-900 truncate tracking-tight">
              {employee.name}
            </h4>
            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
              {employee.designation}
            </p>
            <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {employee.employeeCode}
            </span>
          </div>
        </div>

        {/* Details: Dept & Business Unit */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
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
            <div className="flex items-center gap-1.5 truncate text-[10px] text-slate-500 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="truncate">{employee.location}</span>
            </div>
          )}
        </div>

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
