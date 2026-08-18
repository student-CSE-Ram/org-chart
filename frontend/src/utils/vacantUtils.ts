import type { Employee } from '../types/orgChart';

/**
 * Checks whether an employee/position node is marked as Vacant or Open.
 */
export const isVacantEmployee = (emp: Employee): boolean => {
  if (!emp) return false;
  const statusLower = (emp.status || '').trim().toLowerCase();
  if (statusLower === 'vacant' || statusLower === 'open' || statusLower === 'position vacant') {
    return true;
  }
  const nameLower = (emp.name || '').trim().toLowerCase();
  if (nameLower.includes('vacant') || nameLower.startsWith('open position')) {
    return true;
  }
  return false;
};

export interface DepartmentVacantStat {
  department: string;
  total: number;
  active: number;
  vacant: number;
  vacantPercentage: number;
}

/**
 * Computes department-wise vacant position statistics.
 */
export const getDepartmentVacantStats = (employees: Employee[]): DepartmentVacantStat[] => {
  const map = new Map<string, { total: number; active: number; vacant: number }>();

  employees.forEach((emp) => {
    const dept = emp.department || 'General';
    if (!map.has(dept)) {
      map.set(dept, { total: 0, active: 0, vacant: 0 });
    }
    const current = map.get(dept)!;
    current.total += 1;
    if (isVacantEmployee(emp)) {
      current.vacant += 1;
    } else {
      current.active += 1;
    }
  });

  const result: DepartmentVacantStat[] = [];
  map.forEach((value, department) => {
    result.push({
      department,
      total: value.total,
      active: value.active,
      vacant: value.vacant,
      vacantPercentage: value.total > 0 ? Math.round((value.vacant / value.total) * 100) : 0
    });
  });

  // Sort by highest vacant count first, then by department name
  return result.sort((a, b) => b.vacant - a.vacant || a.department.localeCompare(b.department));
};

/**
 * Gets overall company vacant positions count.
 */
export const getTotalVacantCount = (employees: Employee[]): number => {
  return employees.filter(isVacantEmployee).length;
};
