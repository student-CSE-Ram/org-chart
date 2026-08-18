import * as XLSX from 'xlsx';
import type { Employee, ValidationError, ValidationResult } from '../types/orgChart';

// Flexible column name matching
const normalizeKey = (key: string): string => {
  return key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const isShiftInchargeRole = (designation?: string): boolean => {
  if (!designation) return false;
  const d = designation.toLowerCase();
  return (
    d.includes('shift incharge') ||
    d.includes('shift in-charge') ||
    d.includes('shift in charge') ||
    d.includes('shift supervisor') ||
    d.includes('shift lead')
  );
};

export const parseExcelFile = async (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const employees: Employee[] = rawRows.map((row) => {
          const getVal = (possibleKeys: string[]): string => {
            for (const key of Object.keys(row)) {
              const norm = normalizeKey(key);
              if (possibleKeys.some((p) => normalizeKey(p) === norm)) {
                return String(row[key] ?? '').trim();
              }
            }
            return '';
          };

          const rawCategory = getVal([
            'Employee Category',
            'EmployeeCategory',
            'Collar Type',
            'Worker Type',
            'Category',
            'Collar'
          ]);

          return {
            employeeCode: getVal(['Employee Code', 'EmployeeCode', 'EmpCode', 'ID', 'Employee ID']),
            name: getVal(['Employee Name', 'EmployeeName', 'Name', 'Full Name']),
            managerCode: getVal(['Manager Code', 'ManagerCode', 'Reporting Manager Code', 'Manager ID']),
            designation: getVal(['Designation', 'Title', 'Job Title', 'Role']),
            department: getVal(['Department', 'Dept']) || 'General',
            businessUnit: getVal(['Business Unit', 'BusinessUnit', 'BU', 'Division']) || 'Default BU',
            location: getVal(['Location', 'Site', 'Site Name', 'Office', 'City', 'Work Location', 'Branch', 'Plant']) || 'Head Office',
            employeeCategory: rawCategory ? rawCategory : undefined,
            email: getVal(['Email', 'Email Address', 'Mail']),
            phone: getVal(['Phone', 'Phone Number', 'Mobile', 'Contact']),
            dateOfJoining: getVal(['Date of Joining', 'DateOfJoining', 'DOJ', 'Joining Date']),
            employmentType: getVal(['Employment Type', 'EmploymentType', 'Type']) || 'Permanent',
            status: getVal(['Status', 'State']) || 'Active',
            profileImageUrl: getVal(['Profile Image URL', 'ProfileImageURL', 'Image URL', 'Photo', 'Avatar'])
          };
        });

        // Filter out completely blank rows
        const validEmployees = employees.filter(
          (emp) => emp.employeeCode !== '' || emp.name !== ''
        );

        // Build emp map to propagate Shift Incharge -> Blue Collar logic
        const empMap = new Map<string, Employee>();
        validEmployees.forEach((emp) => empMap.set(emp.employeeCode, emp));

        const isUnderShiftIncharge = (emp: Employee): boolean => {
          let currentMgrCode = emp.managerCode;
          const visited = new Set<string>();

          while (currentMgrCode && empMap.has(currentMgrCode) && !visited.has(currentMgrCode)) {
            visited.add(currentMgrCode);
            const mgr = empMap.get(currentMgrCode)!;
            if (isShiftInchargeRole(mgr.designation)) {
              return true;
            }
            currentMgrCode = mgr.managerCode;
          }
          return false;
        };

        validEmployees.forEach((emp) => {
          if (!emp.employeeCategory) {
            if (isUnderShiftIncharge(emp)) {
              emp.employeeCategory = 'Blue Collar';
            } else {
              emp.employeeCategory = 'White Collar';
            }
          }
        });

        resolve(validEmployees);
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${(err as Error).message}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};

export const validateOrgData = (employees: Employee[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const codeMap = new Map<string, Employee>();
  const duplicateCodes = new Set<string>();

  // 1. Check required fields and duplicates
  employees.forEach((emp, index) => {
    const rowNum = index + 2; // Accounting for 1-based index + header row

    if (!emp.employeeCode) {
      errors.push({
        row: rowNum,
        employeeCode: emp.employeeCode || 'N/A',
        employeeName: emp.name || 'N/A',
        field: 'Employee Code',
        severity: 'error',
        message: 'Employee Code is required.'
      });
    } else {
      if (codeMap.has(emp.employeeCode)) {
        duplicateCodes.add(emp.employeeCode);
        errors.push({
          row: rowNum,
          employeeCode: emp.employeeCode,
          employeeName: emp.name,
          field: 'Employee Code',
          severity: 'error',
          message: `Duplicate Employee Code '${emp.employeeCode}' detected.`
        });
      } else {
        codeMap.set(emp.employeeCode, emp);
      }
    }

    if (!emp.name) {
      errors.push({
        row: rowNum,
        employeeCode: emp.employeeCode || 'N/A',
        employeeName: 'N/A',
        field: 'Employee Name',
        severity: 'error',
        message: 'Employee Name is required.'
      });
    }

    if (!emp.designation) {
      errors.push({
        row: rowNum,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        field: 'Designation',
        severity: 'warning',
        message: 'Designation is missing.'
      });
    }
  });

  // 2. Identify CEO / Root nodes and missing manager checks
  const rootEmployees: Employee[] = [];
  employees.forEach((emp, index) => {
    const rowNum = index + 2;

    if (!emp.managerCode) {
      rootEmployees.push(emp);
    } else {
      if (!codeMap.has(emp.managerCode) && !duplicateCodes.has(emp.managerCode)) {
        errors.push({
          row: rowNum,
          employeeCode: emp.employeeCode,
          employeeName: emp.name,
          field: 'Manager Code',
          severity: 'error',
          message: `Manager Code '${emp.managerCode}' does not match any existing employee.`
        });
      }
    }
  });

  if (rootEmployees.length === 0 && employees.length > 0) {
    errors.push({
      row: 0,
      employeeCode: 'SYSTEM',
      employeeName: 'SYSTEM',
      field: 'Manager Code',
      severity: 'error',
      message: 'No top-level executive/CEO found (employee without a Manager Code).'
    });
  }

  // 3. Cycle Detection (detect circular reporting structure e.g. A reports to B, B reports to A)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const checkCycle = (code: string, path: string[]): boolean => {
    visited.add(code);
    recursionStack.add(code);

    const emp = codeMap.get(code);
    if (emp && emp.managerCode && codeMap.has(emp.managerCode)) {
      const parentCode = emp.managerCode;
      if (!visited.has(parentCode)) {
        if (checkCycle(parentCode, [...path, code])) return true;
      } else if (recursionStack.has(parentCode)) {
        // Cycle detected
        const cyclePath = [...path, code, parentCode].join(' -> ');
        errors.push({
          row: 0,
          employeeCode: code,
          employeeName: emp.name,
          field: 'Circular Reference',
          severity: 'error',
          message: `Circular reporting structure detected: ${cyclePath}`
        });
        return true;
      }
    }

    recursionStack.delete(code);
    return false;
  };

  codeMap.forEach((_, code) => {
    if (!visited.has(code)) {
      checkCycle(code, []);
    }
  });

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    totalRecords: employees.length,
    validCount: employees.length - errorCount,
    errorCount,
    warningCount,
    errors,
    rootEmployees,
    parsedEmployees: employees
  };
};

export const downloadErrorReportCSV = (errors: ValidationError[], filename = 'OrgChart_Validation_Errors.csv') => {
  const headers = ['Row', 'Employee Code', 'Employee Name', 'Field', 'Severity', 'Error Message'];
  const csvRows = [headers.join(',')];

  errors.forEach((err) => {
    const rowStr = [
      err.row,
      `"${err.employeeCode}"`,
      `"${err.employeeName}"`,
      `"${err.field}"`,
      `"${err.severity.toUpperCase()}"`,
      `"${err.message.replace(/"/g, '""')}"`
    ].join(',');
    csvRows.push(rowStr);
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
