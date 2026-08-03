import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  User,
  Crown,
  Search,
  ChevronLeft
} from 'lucide-react';
import type { Employee, TreeNode } from '../types/orgChart';
import { getLocationColorTheme } from '../utils/locationColors';

interface LeftSidebarProps {
  employees: Employee[];
  treeRoots: TreeNode[];
  selectedEmployeeCode?: string;
  onSelectEmployee: (code: string) => void;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  isDarkMode: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  employees,
  treeRoots,
  selectedEmployeeCode,
  onSelectEmployee,
  selectedDepartment,
  onSelectDepartment,
  isOpen,
  onToggleSidebar,
  isDarkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Expand CEO & top level roots by default so all HODs are open right away
    const initial = new Set<string>();
    treeRoots.forEach((root) => {
      initial.add(root.employeeCode);
      root.children.forEach((hod) => initial.add(hod.employeeCode));
    });
    return initial;
  });

  const toggleNodeExpand = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  // Get unique departments list for quick filters
  const departments = Array.from(
    new Set(employees.map((emp) => emp.department).filter(Boolean))
  ).sort();

  // Recursive tree renderer for sidebar
  const renderSidebarTreeNode = (node: TreeNode, isTopLevel = false) => {
    const isSelected = selectedEmployeeCode === node.employeeCode;
    const isExpanded = expandedNodes.has(node.employeeCode);
    const hasChildren = node.children && node.children.length > 0;
    const isCEO = !node.managerCode;

    // Filter matching check
    const matchesSearch =
      !searchQuery ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (searchQuery && !matchesSearch && !hasChildren) {
      return null;
    }

    return (
      <div key={node.employeeCode} className="flex flex-col text-xs">
        {/* Employee Item Row */}
        <div
          onClick={() => handleSelectEmployeeNode(node.employeeCode)}
          className={`group flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer transition-all ${
            isSelected
              ? isDarkMode
                ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50 shadow-sm'
                : 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm'
              : isDarkMode
              ? 'hover:bg-slate-800/80 text-slate-200 border border-transparent'
              : 'hover:bg-slate-100 text-slate-700 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Expand / Collapse Icon */}
            {hasChildren ? (
              <button
                onClick={(e) => toggleNodeExpand(node.employeeCode, e)}
                className={`p-0.5 rounded hover:bg-slate-700/40 ${
                  isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            {/* Avatar / Crown for CEO */}
            <div className="relative flex-shrink-0">
              {isCEO ? (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-700/40 text-slate-300 flex items-center justify-center font-semibold text-[10px]">
                  {node.name.split(' ').map((n) => n[0]).slice(0, 2).join('') || <User className="w-3 h-3" />}
                </div>
              )}
            </div>

            {/* Name & Designation */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`truncate ${isTopLevel || isCEO ? 'font-bold' : 'font-medium'}`}>
                  {node.name}
                </span>
                {isCEO && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    CEO / MD
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 truncate mt-0.5">
                {node.location && (
                  <span
                    className={`w-2 h-2 rounded-full ${getLocationColorTheme(node.location).dotClass} flex-shrink-0`}
                    title={`Site: ${node.location}`}
                  />
                )}
                <p className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {node.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Reports Count Badge */}
          {hasChildren && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                isDarkMode ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-slate-100 text-blue-600 border border-slate-200'
              }`}
            >
              {node.directReportsCount}
            </span>
          )}
        </div>

        {/* Children Subtree */}
        {hasChildren && isExpanded && (
          <div className={`ml-4 pl-2 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-1 mt-1`}>
            {node.children.map((child) => renderSidebarTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const handleSelectEmployeeNode = (code: string) => {
    onSelectEmployee(code);
    if (window.innerWidth < 768) {
      onToggleSidebar();
    }
  };

  const handleSelectDept = (dept: string) => {
    onSelectDepartment(dept);
    if (window.innerWidth < 768) {
      onToggleSidebar();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggleSidebar}
        className={`fixed left-3 top-20 z-30 p-2 rounded-xl border shadow-lg transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
        title="Open Left Hierarchy Sidebar"
      >
        <ChevronRight className="w-5 h-5 text-blue-500" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        onClick={onToggleSidebar}
        className="fixed inset-0 top-16 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden animate-fadeIn"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-72 border-r flex flex-col md:relative md:top-0 md:h-full md:z-20 transition-all select-none shadow-2xl md:shadow-xl ${
          isDarkMode ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white/98 border-slate-200 text-slate-900'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`p-3.5 border-b flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Hierarchy Explorer</h3>
          </div>
          <button
            onClick={onToggleSidebar}
            className={`p-1 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee / HOD..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-800/90 border border-slate-700 text-slate-100 placeholder-slate-400 focus:border-blue-500'
                  : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className={`px-3 pb-3 border-b flex flex-wrap gap-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => handleSelectDept('')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              selectedDepartment === ''
                ? 'bg-blue-600 text-white shadow-sm'
                : isDarkMode
                ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Depts
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => handleSelectDept(dept === selectedDepartment ? '' : dept)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                selectedDepartment === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Tree Hierarchy List */}
        <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              CEO & HOD Structure
            </span>
            <span className="text-[10px] text-blue-500 font-medium">
              {employees.length} Members
            </span>
          </div>

          {treeRoots.map((root) => renderSidebarTreeNode(root, true))}
        </div>
      </aside>
    </>
  );
};
