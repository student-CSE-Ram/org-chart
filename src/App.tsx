import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { SearchFilterBar } from './components/SearchFilterBar';
import { OrgChartCanvas } from './components/OrgChartCanvas';
import { EmployeeDetailsDrawer } from './components/EmployeeDetailsDrawer';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { BrandingModal } from './components/BrandingModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ExportModal } from './components/ExportModal';

import { INITIAL_COMPANY_DATA } from './data/initialTemplateData';
import { downloadExcelTemplate } from './utils/excelTemplateGenerator';
import { buildEmployeeTree } from './utils/layoutCalculator';
import type {
  Employee,
  TreeNode,
  FilterState,
  BrandingConfig,
  VersionSnapshot,
  LayoutOrientation
} from './types/orgChart';

const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'Gallantt Ispat Limited',
  companyLogoUrl: '/Gallantt-logo.png',
  primaryColor: '#4B2320',
  secondaryColor: '#F26522',
  accentColor: '#10b981',
  fontFamily: 'Inter',
  footerText: 'Confidential - Gallantt Ispat Limited HR Hierarchy',
  themeMode: 'gallantt'
};

export const App: React.FC = () => {
  // 1. Data & State Management
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('org_chart_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return INITIAL_COMPANY_DATA;
  });

  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const saved = localStorage.getItem('org_chart_branding');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.companyName && !parsed.companyName.includes('JSW')) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_BRANDING;
  });

  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(() => {
    return [
      {
        id: 'initial-v1',
        timestamp: new Date().toISOString(),
        versionName: 'Gallantt Ispat Baseline (2 Depts Demo)',
        employeeCount: INITIAL_COMPANY_DATA.length,
        data: INITIAL_COMPANY_DATA,
        branding: DEFAULT_BRANDING
      }
    ];
  });

  const [currentVersionId, setCurrentVersionId] = useState<string>('initial-v1');

  // Light / Dark Theme State (Default to Light mode per request)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('org_chart_darkmode');
    return saved ? JSON.parse(saved) : false; // Default to Light Mode
  });

  // Left Sidebar Toggle State (Open by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Persistence to LocalStorage
  useEffect(() => {
    localStorage.setItem('org_chart_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('org_chart_branding', JSON.stringify(branding));
  }, [branding]);

  useEffect(() => {
    localStorage.setItem('org_chart_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('org_chart_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Build hierarchical tree structure for Left Sidebar
  const treeRoots = useMemo(() => {
    return buildEmployeeTree(employees, new Set());
  }, [employees]);

  // 2. Interactive States & Default Collapses (CEO -> Direct HODs visible by default)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(() => {
    const initialCollapsed = new Set<string>();
    // Collapse all HOD nodes by default so chart shows CEO -> HODs (CTO, CHRO, COO) cleanly
    employees.forEach((emp) => {
      if (emp.managerCode) {
        initialCollapsed.add(emp.employeeCode);
      }
    });
    return initialCollapsed;
  });

  // Default selection: CEO
  const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string | undefined>(() => {
    const ceo = employees.find((e) => !e.managerCode);
    return ceo ? ceo.employeeCode : 'EMP-001';
  });

  const [orientation, setOrientation] = useState<LayoutOrientation>('TB');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 3. Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    department: '',
    businessUnit: '',
    location: '',
    designation: '',
    employmentType: '',
    status: '',
    filterMode: 'highlight'
  });

  // Extract unique values for filter dropdowns
  const { departments, businessUnits, locations, designations } = useMemo(() => {
    const deptSet = new Set<string>();
    const buSet = new Set<string>();
    const locSet = new Set<string>();
    const desigSet = new Set<string>();

    employees.forEach((emp) => {
      if (emp.department) deptSet.add(emp.department);
      if (emp.businessUnit) buSet.add(emp.businessUnit);
      if (emp.location) locSet.add(emp.location);
      if (emp.designation) desigSet.add(emp.designation);
    });

    return {
      departments: Array.from(deptSet).sort(),
      businessUnits: Array.from(buSet).sort(),
      locations: Array.from(locSet).sort(),
      designations: Array.from(desigSet).sort()
    };
  }, [employees]);

  // Evaluate matching counts
  const matchCount = useMemo(() => {
    const searchLower = filters.searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      if (searchLower) {
        const matchesSearch =
          emp.name.toLowerCase().includes(searchLower) ||
          emp.employeeCode.toLowerCase().includes(searchLower) ||
          emp.department.toLowerCase().includes(searchLower) ||
          emp.designation.toLowerCase().includes(searchLower) ||
          (emp.location && emp.location.toLowerCase().includes(searchLower)) ||
          (emp.businessUnit && emp.businessUnit.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (filters.department && emp.department !== filters.department) return false;
      if (filters.businessUnit && emp.businessUnit !== filters.businessUnit) return false;
      if (filters.location && emp.location !== filters.location) return false;
      if (filters.designation && emp.designation !== filters.designation) return false;
      if (filters.employmentType && emp.employmentType !== filters.employmentType) return false;
      if (filters.employeeCategory && emp.employeeCategory !== filters.employeeCategory) return false;
      if (filters.status && emp.status !== filters.status) return false;

      return true;
    }).length;
  }, [employees, filters]);

  // Handlers
  const handleToggleExpandNode = useCallback((id: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedNodeIds(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    const initialCollapsed = new Set<string>();
    employees.forEach((emp) => {
      if (emp.managerCode) initialCollapsed.add(emp.employeeCode);
    });
    setCollapsedNodeIds(initialCollapsed);
    const ceo = employees.find((e) => !e.managerCode);
    if (ceo) {
      setSelectedEmployeeCode(ceo.employeeCode);
    }
  }, [employees]);

  const handleSelectEmployeeNode = useCallback((emp: TreeNode) => {
    setSelectedEmployeeCode(emp.employeeCode);
  }, []);

  const selectedEmployeeNode = useMemo(() => {
    if (!selectedEmployeeCode) return null;
    const emp = employees.find((e) => e.employeeCode === selectedEmployeeCode);
    if (!emp) return null;

    const directReports = employees.filter((e) => e.managerCode === emp.employeeCode);
    return {
      ...emp,
      children: [],
      directReportsCount: directReports.length,
      totalSubtreeCount: directReports.length,
      depth: 0
    };
  }, [selectedEmployeeCode, employees]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));

    // If department selected, uncollapse HOD for that department cleanly
    if (updated.department) {
      const hod = employees.find((e) => e.department === updated.department && e.managerCode && employees.find(m => m.employeeCode === e.managerCode && !m.managerCode));
      if (hod) {
        setCollapsedNodeIds((prev) => {
          const next = new Set(prev);
          next.delete(hod.employeeCode);
          return next;
        });
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      department: '',
      businessUnit: '',
      location: '',
      designation: '',
      employmentType: '',
      employeeCategory: '',
      status: '',
      filterMode: 'highlight'
    });
  };

  const handlePublishExcel = (newEmployees: Employee[]) => {
    setEmployees(newEmployees);
    const initialCollapsed = new Set<string>();
    newEmployees.forEach((emp) => {
      if (emp.managerCode) initialCollapsed.add(emp.employeeCode);
    });
    setCollapsedNodeIds(initialCollapsed);

    const newSnap: VersionSnapshot = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      versionName: `Excel Upload (${newEmployees.length} records)`,
      employeeCount: newEmployees.length,
      data: newEmployees,
      branding
    };

    setSnapshots((prev) => [newSnap, ...prev]);
    setCurrentVersionId(newSnap.id);
  };

  const handleRestoreSnapshot = (snapshot: VersionSnapshot) => {
    setEmployees(snapshot.data);
    setBranding(snapshot.branding);
    setCurrentVersionId(snapshot.id);
    const initialCollapsed = new Set<string>();
    snapshot.data.forEach((emp) => {
      if (emp.managerCode) initialCollapsed.add(emp.employeeCode);
    });
    setCollapsedNodeIds(initialCollapsed);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div
      className={`flex flex-col h-screen h-[100dvh] w-screen overflow-hidden font-sans transition-colors ${
        isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Header Bar */}
      <Header
        branding={branding}
        totalEmployeesCount={employees.length}
        onOpenUploadModal={() => setIsUploadOpen(true)}
        onOpenBrandingModal={() => setIsBrandingOpen(true)}
        onOpenVersionModal={() => setIsVersionOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onDownloadTemplate={() => downloadExcelTemplate()}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Container with Left Sidebar & Canvas */}
      <div className="flex flex-1 w-full h-[calc(100dvh-4rem-1.75rem)] overflow-hidden relative">
        {/* Left Hierarchy Sidebar */}
        <LeftSidebar
          employees={employees}
          treeRoots={treeRoots}
          selectedEmployeeCode={selectedEmployeeCode}
          onSelectEmployee={(code) => {
            setSelectedEmployeeCode(code);
            setCollapsedNodeIds((prev) => {
              const next = new Set(prev);
              next.delete(code);
              return next;
            });
          }}
          selectedDepartment={filters.department}
          onSelectDepartment={(dept) => handleFilterChange({ department: dept })}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isDarkMode={isDarkMode}
        />

        {/* Canvas Area */}
        <main className="relative flex-1 w-full h-full overflow-hidden">
          {/* Floating Search & Multi-Filter Toolbar */}
          <SearchFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            departments={departments}
            businessUnits={businessUnits}
            locations={locations}
            designations={designations}
            orientation={orientation}
            onToggleOrientation={() =>
              setOrientation((prev) => (prev === 'TB' ? 'LR' : 'TB'))
            }
            matchCount={matchCount}
            totalCount={employees.length}
            isDarkMode={isDarkMode}
          />

          {/* Interactive Org Chart Canvas */}
          <OrgChartCanvas
            employees={employees}
            collapsedNodeIds={collapsedNodeIds}
            onToggleExpandNode={handleToggleExpandNode}
            onSelectEmployee={handleSelectEmployeeNode}
            selectedEmployeeCode={selectedEmployeeCode}
            filters={filters}
            onSelectLocation={(loc) => handleFilterChange({ location: loc })}
            orientation={orientation}
            primaryColor={branding.primaryColor}
            isDarkMode={isDarkMode}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
          />

          {/* Employee Details Floating Popup Card Modal */}
          <EmployeeDetailsDrawer
            employee={selectedEmployeeNode}
            allEmployees={employees}
            onClose={() => setSelectedEmployeeCode(undefined)}
            onSelectEmployeeByCode={(code) => {
              setSelectedEmployeeCode(code);
              setCollapsedNodeIds((prev) => {
                const next = new Set(prev);
                next.delete(code);
                return next;
              });
            }}
            onFocusNode={(code) => setSelectedEmployeeCode(code)}
            isDarkMode={isDarkMode}
          />
        </main>
      </div>

      {/* Footer Bar */}
      <footer
        className={`h-7 px-3 sm:px-6 border-t flex items-center justify-between text-[10px] sm:text-[11px] font-medium z-10 transition-colors ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}
      >
        <span className="truncate max-w-[220px] sm:max-w-none">{branding.footerText || 'Gallantt Ispat Limited - Internal HR Org Chart'}</span>
        <div className="hidden sm:flex items-center gap-3">
          <span>Active View: Hierarchy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Status: Ready</span>
        </div>
      </footer>

      {/* Modals */}
      <ExcelUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onConfirmPublish={handlePublishExcel}
      />

      <BrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        config={branding}
        onSaveConfig={(newConfig) => setBranding(newConfig)}
      />

      <VersionHistoryModal
        isOpen={isVersionOpen}
        onClose={() => setIsVersionOpen(false)}
        snapshots={snapshots}
        currentVersionId={currentVersionId}
        onRestoreSnapshot={handleRestoreSnapshot}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        employees={employees}
        branding={branding}
      />
    </div>
  );
};

export default App;
