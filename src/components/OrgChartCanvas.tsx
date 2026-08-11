import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize, PlusSquare, MinusSquare, Target } from 'lucide-react';

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
  filters: FilterState;
  onSelectLocation?: (location: string) => void;
  orientation: LayoutOrientation;
  primaryColor: string;
  isDarkMode: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
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
  filters,
  onSelectLocation,
  orientation,
  primaryColor,
  isDarkMode,
  onExpandAll,
  onCollapseAll
}) => {
  const { fitView, setCenter, zoomTo } = useReactFlow();

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

  // Collapse All & redirect focus directly to CMD parent node
  const handleCollapseAllWithFocus = useCallback(() => {
    onCollapseAll();

    const collapsedSet = new Set<string>();
    employees.forEach((emp) => {
      if (emp.managerCode) collapsedSet.add(emp.employeeCode);
    });

    const { nodes: collapsedNodes } = calculateFlowElements(
      employees,
      collapsedSet,
      orientation
    );

    const rootNode =
      collapsedNodes.find((n) => !(n.data.employee as TreeNode).managerCode) ||
      collapsedNodes[0];

    if (rootNode) {
      setTimeout(() => {
        setCenter(rootNode.position.x + 140, rootNode.position.y + 82.5, {
          zoom: 1.0,
          duration: 400
        });
      }, 100);
    }
  }, [onCollapseAll, employees, orientation, setCenter]);

  // Expand All while maintaining large, legible card scale focused at CMD top level
  const handleExpandAllWithReadableZoom = useCallback(() => {
    onExpandAll();

    const { nodes: expandedNodes } = calculateFlowElements(
      employees,
      new Set(),
      orientation
    );

    const rootNode =
      expandedNodes.find((n) => !(n.data.employee as TreeNode).managerCode) ||
      expandedNodes[0];

    if (rootNode) {
      setTimeout(() => {
        setCenter(rootNode.position.x + 140, rootNode.position.y + 82.5, {
          zoom: 0.85,
          duration: 400
        });
      }, 100);
    }
  }, [onExpandAll, employees, orientation, setCenter]);

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
      <div className="absolute top-20 right-3 sm:top-20 sm:right-6 z-20 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <button
          onClick={handleExpandAllWithReadableZoom}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
          title="Expand All Nodes (Keeps cards large & clear)"
        >
          <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Expand All</span>
        </button>

        <button
          onClick={handleCollapseAllWithFocus}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
          title="Collapse All & Focus on CMD Parent Node"
        >
          <MinusSquare className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Collapse All</span>
        </button>

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
      </div>

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
        fitView
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
