import type { Node, Edge } from '@xyflow/react';
import type { Employee, TreeNode, LayoutOrientation } from '../types/orgChart';

// Node card dimensions for layout calculation
const NODE_WIDTH = 260;
const NODE_HEIGHT = 160;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 110;

/**
 * Builds tree nodes from flat employee list
 */
export const buildEmployeeTree = (
  employees: Employee[],
  collapsedNodeIds: Set<string>
): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // 1. Initialize all tree nodes
  employees.forEach((emp) => {
    map.set(emp.employeeCode, {
      ...emp,
      children: [],
      directReportsCount: 0,
      totalSubtreeCount: 0,
      depth: 0,
      isCollapsed: collapsedNodeIds.has(emp.employeeCode)
    });
  });

  // 2. Establish parent-child relationships
  employees.forEach((emp) => {
    const node = map.get(emp.employeeCode)!;
    if (emp.managerCode && map.has(emp.managerCode)) {
      const parent = map.get(emp.managerCode)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 3. Compute direct reports count and total subtree counts recursively
  const computeCountsAndDepth = (node: TreeNode, currentDepth: number): number => {
    node.depth = currentDepth;
    node.directReportsCount = node.children.length;
    let subtreeCount = 0;

    node.children.forEach((child) => {
      subtreeCount += 1 + computeCountsAndDepth(child, currentDepth + 1);
    });

    node.totalSubtreeCount = subtreeCount;
    return subtreeCount;
  };

  roots.forEach((root) => computeCountsAndDepth(root, 0));

  return roots;
};

/**
 * Computes node coordinates (x,y) and edge connections for React Flow
 */
export const calculateFlowElements = (
  employees: Employee[],
  collapsedNodeIds: Set<string>,
  orientation: LayoutOrientation = 'TB'
): { nodes: Node[]; edges: Edge[] } => {
  const treeRoots = buildEmployeeTree(employees, collapsedNodeIds);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let currentRootX = 0;

  const layoutSubtree = (node: TreeNode, depth: number): { minX: number; maxX: number; width: number } => {
    // If node is collapsed, we do not layout its children
    if (node.isCollapsed || node.children.length === 0) {
      const x = currentRootX;
      currentRootX += NODE_WIDTH + HORIZONTAL_GAP;

      const y = depth * (NODE_HEIGHT + VERTICAL_GAP);

      const posX = orientation === 'TB' ? x : y;
      const posY = orientation === 'TB' ? y : x;

      nodes.push({
        id: node.employeeCode,
        type: 'employeeCard',
        position: { x: posX, y: posY },
        data: {
          employee: node,
          hasChildren: node.children.length > 0,
          isCollapsed: node.isCollapsed,
          directReportsCount: node.directReportsCount,
          totalSubtreeCount: node.totalSubtreeCount
        }
      });

      return { minX: x, maxX: x, width: NODE_WIDTH };
    }

    // Recursively layout children first
    const childXPositions: number[] = [];
    node.children.forEach((child) => {
      // Connect edge from parent to child
      edges.push({
        id: `e-${node.employeeCode}-${child.employeeCode}`,
        source: node.employeeCode,
        target: child.employeeCode,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#475569', strokeWidth: 2 }
      });

      const res = layoutSubtree(child, depth + 1);
      childXPositions.push((res.minX + res.maxX) / 2);
    });

    // Center parent above children
    const firstChildX = childXPositions[0];
    const lastChildX = childXPositions[childXPositions.length - 1];
    const parentX = (firstChildX + lastChildX) / 2;

    const y = depth * (NODE_HEIGHT + VERTICAL_GAP);
    const posX = orientation === 'TB' ? parentX : y;
    const posY = orientation === 'TB' ? y : parentX;

    nodes.push({
      id: node.employeeCode,
      type: 'employeeCard',
      position: { x: posX, y: posY },
      data: {
        employee: node,
        hasChildren: true,
        isCollapsed: node.isCollapsed,
        directReportsCount: node.directReportsCount,
        totalSubtreeCount: node.totalSubtreeCount
      }
    });

    return { minX: firstChildX, maxX: lastChildX, width: lastChildX - firstChildX + NODE_WIDTH };
  };

  treeRoots.forEach((root) => {
    layoutSubtree(root, 0);
  });

  return { nodes, edges };
};
