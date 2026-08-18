import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  User,
  Crown,
  Search,
  ChevronLeft,
  Zap,
  UserPlus,
  AlertCircle,
  PieChart
} from 'lucide-react';
import type { Employee, TreeNode } from '../types/orgChart';
import { getLocationColorTheme } from '../utils/locationColors';
import { isShiftInchargeRole } from '../utils/excelParser';
import { isVacantEmployee, getDepartmentVacantStats, getTotalVacantCount } from '../utils/vacantUtils';

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
  const [showVacancyBreakdown, setShowVacancyBreakdown] = useState(true);
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

  // Department Vacancy Stats & overall vacant count
  const deptVacantStats = useMemo(() => getDepartmentVacantStats(employees), [employees]);
  const totalVacant = useMemo(() => getTotalVacantCount(employees), [employees]);

  // Unique departments list
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map((emp) => emp.department).filter(Boolean))).sort();
  }, [employees]);

  // Quick lookup for department vacant count
  const deptVacantMap = useMemo(() => {
    const map = new Map<string, number>();
    deptVacantStats.forEach((s) => map.set(s.department, s.vacant));
    return map;
  }, [deptVacantStats]);

  // Recursive tree renderer for sidebar (White Collar hierarchy only)
  const renderSidebarTreeNode = (node: TreeNode, isTopLevel = false) => {
    if (node.employeeCategory === 'Blue Collar') return null;

    const isSelected = selectedEmployeeCode === node.employeeCode;
    const isExpanded = expandedNodes.has(node.employeeCode);
    const isCEO = !node.managerCode;
    const isShiftIncharge = node.isShiftIncharge || isShiftInchargeRole(node.designation);
    const isVacant = isVacantEmployee(node);

    const whiteCollarChildren = (node.children || []).filter(
      (child) => child.employeeCategory !== 'Blue Collar'
    );
    const hasChildren = whiteCollarChildren.length > 0;

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
              : isVacant
              ? isDarkMode
                ? 'bg-amber-950/60 text-amber-100 border-2 border-dashed border-amber-500/80 hover:bg-amber-900/80 shadow-2xs'
                : 'bg-amber-50 border-2 border-dashed border-amber-500 text-amber-950 hover:bg-amber-100/90 shadow-2xs'
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

            {/* Avatar / Crown for CEO / Zap for Shift Incharge / UserPlus for Vacant */}
            <div className="relative flex-shrink-0">
              {isCEO ? (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              ) : isVacant ? (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 border border-amber-600 flex items-center justify-center font-black shadow-2xs">
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                </div>
              ) : isShiftIncharge ? (
                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
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
                <span
                  className={`truncate ${
                    isVacant
                      ? isDarkMode
                        ? 'text-amber-200 font-normal italic'
                        : 'text-amber-950 font-normal italic'
                      : isTopLevel || isCEO
                      ? 'font-bold'
                      : 'font-semibold'
                  }`}
                >
                  {node.name}
                </span>
                {isCEO ? (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    CMD
                  </span>
                ) : isVacant ? (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500 text-slate-950 shadow-2xs flex items-center gap-0.5 uppercase tracking-wider">
                    VACANT
                  </span>
                ) : isShiftIncharge ? (
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 flex items-center gap-0.5">
                    SI
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 truncate mt-0.5">
                {node.location && (
                  <span
                    className={`w-2 h-2 rounded-full ${getLocationColorTheme(node.location).dotClass} flex-shrink-0`}
                    title={`Site: ${node.location}`}
                  />
                )}
                <p
                  className={`text-[10px] truncate ${
                    isVacant
                      ? isDarkMode
                        ? 'text-amber-300/90 font-normal'
                        : 'text-amber-900 font-normal'
                      : isDarkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {node.designation}
                </p>
              </div>
            </div>
          </div>

          {/* Count Badge: Blue Collar Count for Shift Incharge, Direct Reports for others */}
          {isShiftIncharge && (node.blueCollarCount ?? 0) > 0 ? (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex-shrink-0"
              title={`${node.blueCollarCount} Blue Collar Workers`}
            >
              {node.blueCollarCount} BC
            </span>
          ) : hasChildren ? (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                isDarkMode ? 'bg-slate-800 text-blue-400 border border-slate-700' : 'bg-slate-100 text-blue-600 border border-slate-200'
              }`}
            >
              {whiteCollarChildren.length}
            </span>
          ) : null}
        </div>

        {/* Children Subtree */}
        {hasChildren && isExpanded && (
          <div className={`ml-4 pl-2 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col gap-1 mt-1`}>
            {whiteCollarChildren.map((child) => renderSidebarTreeNode(child))}
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
        className="fixed inset-0 top-14 md:top-16 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden animate-fadeIn"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed top-14 md:top-16 left-0 bottom-0 z-40 w-72 max-w-[85vw] border-r flex flex-col md:relative md:top-0 md:h-full md:z-20 transition-all select-none shadow-2xl md:shadow-xl ${
          isDarkMode ? 'bg-slate-900/98 border-slate-800 text-slate-100' : 'bg-white/98 border-slate-200 text-slate-900'
        }`}
      >
        {/* Sidebar Fixed Top Header */}
        <div className={`p-3 border-b flex flex-col gap-2 flex-shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
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

          {/* Worker Stats Pill Row */}
          <div className="flex items-center justify-between text-[10px] font-semibold gap-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Total: {employees.length}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              WC: {employees.filter((e) => e.employeeCategory !== 'Blue Collar' && !isVacantEmployee(e)).length}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              BC: {employees.filter((e) => e.employeeCategory === 'Blue Collar').length}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 ${
                totalVacant > 0
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
              title={`${totalVacant} Vacant Position(s)`}
            >
              <AlertCircle className="w-3 h-3 text-slate-950" />
              <span>Vacant: {totalVacant}</span>
            </span>
          </div>
        </div>

        {/* Scrollable Body Container (Contains Search, Dept Pills, Vacancy Breakdown, Tree List) */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 custom-scrollbar">
          {/* Quick Search */}
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

          {/* Department Filter Pills */}
          <div className={`pb-3 border-b flex flex-wrap gap-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
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
            {departments.map((dept) => {
              const vacantCount = deptVacantMap.get(dept) || 0;
              return (
                <button
                  key={dept}
                  onClick={() => handleSelectDept(dept === selectedDepartment ? '' : dept)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1 ${
                    selectedDepartment === dept
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:text-slate-100'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>{dept}</span>
                  {vacantCount > 0 && (
                    <span
                      className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                        selectedDepartment === dept
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-amber-500 text-slate-950 shadow-2xs'
                      }`}
                      title={`${vacantCount} vacant position(s) in ${dept}`}
                    >
                      {vacantCount}V
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Department Vacancy Summary Breakdown Box */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-2xs'
            }`}
          >
            <div
              onClick={() => setShowVacancyBreakdown((prev) => !prev)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dept Vacancy Summary
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-500 text-slate-950 shadow-2xs">
                  {totalVacant} Vacant
                </span>
                {showVacancyBreakdown ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>

            {showVacancyBreakdown && (
              <div className="mt-2.5 flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                {deptVacantStats.map((stat) => (
                  <div
                    key={stat.department}
                    onClick={() => handleSelectDept(stat.department === selectedDepartment ? '' : stat.department)}
                    className={`p-2 rounded-lg border text-[10px] cursor-pointer transition-all ${
                      selectedDepartment === stat.department
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-300 font-bold'
                        : stat.vacant > 0
                        ? isDarkMode
                          ? 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/40 text-slate-100'
                          : 'bg-amber-50 hover:bg-amber-100/90 border-amber-300 text-slate-900'
                        : isDarkMode
                        ? 'bg-slate-900/40 hover:bg-slate-800/40 border-slate-800/80 text-slate-300'
                        : 'bg-white hover:bg-slate-100 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold truncate max-w-[130px]">{stat.department}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                          {stat.active} Filled
                        </span>
                        {stat.vacant > 0 ? (
                          <span className="px-1.5 py-0.2 rounded font-black text-[9px] bg-amber-500 text-slate-950 shadow-2xs">
                            {stat.vacant} Vacant
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                            Full
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Progress Bar for filled vs vacant */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${stat.total > 0 ? (stat.active / stat.total) * 100 : 100}%` }}
                        title={`${stat.active} Filled`}
                      />
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${stat.total > 0 ? (stat.vacant / stat.total) * 100 : 0}%` }}
                        title={`${stat.vacant} Vacant`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tree Hierarchy List */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                CMD & HOD Structure
              </span>
              <span className="text-[10px] text-blue-500 font-semibold">
                {employees.length} Members
              </span>
            </div>

            {treeRoots.map((root) => renderSidebarTreeNode(root, true))}
          </div>
        </div>
      </aside>
    </>
  );
};
