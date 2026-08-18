import type { Employee } from '../types/orgChart';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

/**
 * Fetch all employees from MongoDB backend.
 * Falls back to null if server is unreachable.
 */
export async function fetchEmployeesFromDB(): Promise<Employee[] | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('[API Service] Backend server offline or unreachable:', err);
    return null;
  }
}

/**
 * Create a new employee record in MongoDB backend.
 */
export async function createEmployeeInDB(
  employee: Employee,
  role: string = 'Admin'
): Promise<{ success: boolean; data?: Employee; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      },
      body: JSON.stringify(employee)
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to backend.' };
  }
}

/**
 * Update employee details and hierarchy (managerCode) in MongoDB backend.
 */
export async function updateEmployeeInDB(
  employeeCode: string,
  updates: Partial<Employee>,
  role: string = 'Admin'
): Promise<{ success: boolean; data?: Employee; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${encodeURIComponent(employeeCode)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      },
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to backend.' };
  }
}

/**
 * Delete employee or convert position to Vacant if direct reports exist.
 */
export async function deleteEmployeeInDB(
  employeeCode: string,
  role: string = 'Admin'
): Promise<{ success: boolean; convertedToVacant?: boolean; deleted?: boolean; message?: string; data?: Employee }> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/${encodeURIComponent(employeeCode)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      }
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to backend.' };
  }
}

/**
 * Bulk sync full employee dataset to MongoDB.
 */
export async function bulkSyncEmployeesToDB(
  employees: Employee[],
  role: string = 'Admin'
): Promise<{ success: boolean; count?: number; message?: string; data?: Employee[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/employees/bulk-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role
      },
      body: JSON.stringify({ employees })
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error connecting to backend.' };
  }
}
