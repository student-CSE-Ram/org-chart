import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize, Target, Eye, EyeOff, ChevronDown } from 'lucide-react';

import { EmployeeCardNode } from './EmployeeCardNode';
import { LocationLegend } from './LocationLegend';
import type { Employee, TreeNode, FilterState, LayoutOrientation } from '../types/orgChart';
import { calculateFlowElements } from '../utils/layoutCalculator';

interface OrgChartCanvasInnerProps {
  employees: Employee[];
  collapsedNodeIds: Set<string>;
  onToggleExpandNode: (id: string) => void;
  onSelectEmployee: (emp: TreeNode) => void;
  selectedEmployeeCode?: string;
  focusRequest?: { code: string; timestamp: number } | null;
  filters: FilterState;
  onSelectLocation?: (location: string) => void;
  orientation: LayoutOrientation;
  primaryColor: string;
  isDarkMode: boolean;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  currentLevel?: number | 'all';
  onSelectLevel?: (level: number | 'all') => void;
}

const nodeTypes = {
  employeeCard: EmployeeCardNode
};

const OrgChartCanvasInner: React.FC<OrgChartCanvasInnerProps> = ({
  employees,
  collapsedNodeIds,
  onToggleExpandNode,
  onSelectEmployee,
  selectedEmployeeCode,
  focusRequest,
  filters,
  onSelectLocation,
  orientation,
  primaryColor,
  isDarkMode,
  currentLevel = 'all',
  onSelectLevel
}) => {
  const { fitView, setCenter, zoomTo } = useReactFlow();
  const [isToolbarHidden, setIsToolbarHidden] = useState(true);
  const lastFocusedKeyRef = useRef<string | null>(null);

  // Initial viewport fit on mount or orientation change
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, minZoom: 0.7, maxZoom: 1.2 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fitView, orientation]);

  // Extract list of locations across active employees
  const locationsList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((emp) => {
      if (emp.location && emp.location.trim()) {
        set.add(emp.location.trim());
      }
    });
    return Array.from(set).sort();
  }, [employees]);

  // Compute layout nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = calculateFlowElements(employees, collapsedNodeIds, orientation);
    return { initialNodes: nodes, initialEdges: edges };
  }, [employees, collapsedNodeIds, orientation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter matching evaluation
  const searchLower = filters.searchQuery.trim().toLowerCase();

  const isMatchingSearch = useCallback(
    (emp: Employee) => {
      if (!searchLower) return false;
      return (
        emp.name.toLowerCase().includes(searchLower) ||
        emp.employeeCode.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower) ||
        emp.designation.toLowerCase().includes(searchLower) ||
        (emp.location && emp.location.toLowerCase().includes(searchLower)) ||
        (emp.businessUnit && emp.businessUnit.toLowerCase().includes(searchLower))
      );
    },
    [searchLower]
  );

  const isMatchingFilter = useCallback(
    (emp: Employee) => {
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.businessUnit && emp.businessUnit !== filters.businessUnit) return false;
      if (filters.location && emp.location !== filters.location) return false;
      if (filters.designation && emp.designation !== filters.designation) return false;
      if (filters.employmentType && emp.employmentType !== filters.employmentType) return false;
      if (filters.status && emp.status !== filters.status) return false;
      return true;
    },
    [filters]
  );

  // Smoothly center and zoom to focus target (e.g. from Search Go or Sidebar selection)
  useEffect(() => {
    if (!focusRequest || !focusRequest.code) return;

    const requestKey = `${focusRequest.code}-${focusRequest.timestamp}`;
    if (lastFocusedKeyRef.current === requestKey) return;

    const targetNode = nodes.find((n) => n.id === focusRequest.code);
    if (targetNode) {
      setCenter(targetNode.position.x + 140, targetNode.position.y + 82.5, {
        zoom: 1.0,
        duration: 600
      });
      lastFocusedKeyRef.current = requestKey;
    }
  }, [focusRequest, nodes, setCenter]);

  // Focus selected node smoothly
  const handleFocusSelected = useCallback(() => {
    if (!selectedEmployeeCode) return;
    const targetNode = nodes.find((n) => n.id === selectedEmployeeCode);
    if (targetNode) {
      // Center node at crisp 100% scale
      setCenter(targetNode.position.x + 140, targetNode.position.y + 82.5, {
        zoom: 1.0,
        duration: 500
      });
    }
  }, [selectedEmployeeCode, nodes, setCenter]);

  // Level selection handler with automatic viewport redirection & smooth focusing
  const handleLevelClickAndCenter = useCallback(
    (lvl: number | 'all') => {
      if (onSelectLevel) {
        onSelectLevel(lvl);
      }
      setTimeout(() => {
        if (lvl === 1) {
          const rootNode = nodes.find((n) => !(n.data.employee as TreeNode).managerCode) || nodes[0];
          if (rootNode) {
            setCenter(rootNode.position.x + 140, rootNode.position.y + 82.5, {
              zoom: 1.0,
              duration: 400
            });
          } else {
            fitView({ duration: 400, padding: 0.25 });
          }
        } else {
          fitView({ duration: 400, padding: 0.25, minZoom: 0.65, maxZoom: 1.1 });
        }
      }, 80);
    },
    [onSelectLevel, nodes, setCenter, fitView]
  );

  // Update nodes with interactivity data & filter states without jarring view jumps
  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = calculateFlowElements(
      employees,
      collapsedNodeIds,
      orientation
    );

    const enrichedNodes = updatedNodes.map((node) => {
      const empData = node.data.employee as TreeNode;
      const isSearchMatch = isMatchingSearch(empData);
      const isFilterMatch = isMatchingFilter(empData);

      const hasFilterActive =
        filters.department ||
        filters.businessUnit ||
        filters.location ||
        filters.designation ||
        filters.employmentType ||
        filters.status;

      const isFilteredOut = hasFilterActive && !isFilterMatch;

      return {
        ...node,
        data: {
          ...node.data,
          isSearchMatch,
          isFilterMatch,
          isFilteredOut,
          isSelected: empData.employeeCode === selectedEmployeeCode,
          onToggleExpand: onToggleExpandNode,
          onSelectEmployee,
          primaryColor,
          isDarkMode
        }
      };
    });

    const styledEdges = updatedEdges.map((edge) => ({
      ...edge,
      style: {
        stroke: isDarkMode ? '#475569' : '#94a3b8',
        strokeWidth: 2
      }
    }));

    setNodes(enrichedNodes);
    setEdges(styledEdges);
  }, [
    employees,
    collapsedNodeIds,
    orientation,
    filters,
    selectedEmployeeCode,
    isMatchingSearch,
    isMatchingFilter,
    onToggleExpandNode,
    onSelectEmployee,
    primaryColor,
    isDarkMode,
    setNodes,
    setEdges
  ]);

  return (
    <div
      id="orgChartCanvasContainer"
      className={`w-full h-full relative transition-colors ${
        isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
      }`}
    >
      {/* Quick Tree Viewport Controls Toolbar */}
      {isToolbarHidden ? (
        <button
          onClick={() => setIsToolbarHidden(false)}
          className="absolute top-20 right-3 sm:top-20 sm:right-6 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all hover:scale-105"
          title="Show Level & Viewport Controls"
        >
          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Show Controls</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      ) : (
        <div className="absolute top-20 right-3 sm:top-20 sm:right-6 z-20 flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md animate-fadeIn">
          {/* Level-Wise Collapse Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider px-1.5 hidden md:inline">
              Levels:
            </span>
            <button
              onClick={() => handleLevelClickAndCenter(1)}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold transition-all ${
                currentLevel === 1
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Focus Level 1: CMD / Executive Chairman"
            >
              L1 (CMD)
            </button>
            <button
              onClick={() => handleLevelClickAndCenter(2)}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold transition-all ${
                currentLevel === 2
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Focus Level 2: CMD + 4 Directors (CEO, CTO, CHRO, COO, CFO)"
            >
              L2 (4 Directors / CEO)
            </button>
            <button
              onClick={() => handleLevelClickAndCenter(3)}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold transition-all ${
                currentLevel === 3
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Focus Level 3: CMD + Directors + Department Managers"
            >
              L3 (Managers)
            </button>
            <button
              onClick={() => handleLevelClickAndCenter('all')}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold transition-all ${
                currentLevel === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Expand All Hierarchy Levels"
            >
              Expand All
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 my-auto" />

          <button
            onClick={handleFocusSelected}
            disabled={!selectedEmployeeCode}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Center view on selected employee card"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Focus Selected</span>
          </button>

          <button
            onClick={() => zoomTo(1.0, { duration: 300 })}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Reset Zoom to 100%"
          >
            100%
          </button>

          <button
            onClick={() => fitView({ duration: 400, padding: 0.2, minZoom: 0.7 })}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
            title="Fit View to Screen (Keeps cards large)"
          >
            <Maximize className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Fit View</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 my-auto" />

          <button
            onClick={() => setIsToolbarHidden(true)}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-extrabold flex items-center gap-1 transition-colors"
            title="Hide Controls (Uncovers Cards)"
          >
            <EyeOff className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Hide</span>
          </button>
        </div>
      )}

      {/* Floating Interactive Location Sites Color Legend */}
      {onSelectLocation && (
        <LocationLegend
          locations={locationsList}
          selectedLocation={filters.location}
          onSelectLocation={onSelectLocation}
          isDarkMode={isDarkMode}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitViewOptions={{ padding: 0.2, minZoom: 0.7, maxZoom: 1.2 }}
        minZoom={0.05}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-right" className="!mb-6 !mr-6 shadow-md" />
      </ReactFlow>
    </div>
  );
};

export const OrgChartCanvas: React.FC<OrgChartCanvasInnerProps> = (props) => {
  return (
    <ReactFlowProvider>
      <OrgChartCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
