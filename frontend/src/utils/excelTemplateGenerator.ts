import * as XLSX from 'xlsx';
import { INITIAL_COMPANY_DATA } from '../data/initialTemplateData';

export const downloadExcelTemplate = (filename = 'Organization_Chart_Template.xlsx') => {
  // Create sheet from sample data
  const data = INITIAL_COMPANY_DATA.map((emp) => ({
    'Employee Code': emp.employeeCode,
    'Employee Name': emp.name,
    'Manager Code': emp.managerCode,
    'Designation': emp.designation,
    'Department': emp.department,
    'Business Unit': emp.businessUnit,
    'Location': emp.location,
    'Employee Category': emp.employeeCategory || 'White Collar',
    'Email': emp.email || '',
    'Phone': emp.phone || '',
    'Date of Joining': emp.dateOfJoining || '',
    'Employment Type': emp.employmentType || 'Permanent',
    'Status': emp.status || 'Active',
    'Profile Image URL': emp.profileImageUrl || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for professional look
  const colWidths = [
    { wch: 15 }, // Employee Code
    { wch: 25 }, // Employee Name
    { wch: 15 }, // Manager Code
    { wch: 32 }, // Designation
    { wch: 22 }, // Department
    { wch: 22 }, // Business Unit
    { wch: 25 }, // Location
    { wch: 18 }, // Employee Category
    { wch: 28 }, // Email
    { wch: 18 }, // Phone
    { wch: 16 }, // Date of Joining
    { wch: 16 }, // Employment Type
    { wch: 12 }, // Status
    { wch: 45 }  // Profile Image URL
  ];

  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Organization Chart Template');

  // Create an instructions sheet
  const instructionsData = [
    { Rule: 'Employee Code', Details: 'REQUIRED. Unique identifier for every employee (e.g. EMP-001, BC-101).' },
    { Rule: 'Employee Name', Details: 'REQUIRED. Full name of the employee.' },
    { Rule: 'Manager Code', Details: 'REQUIRED (except CEO). Employee Code of their direct manager. Leave EMPTY for the CEO/MD.' },
    { Rule: 'Designation', Details: 'Job title / role (e.g., Shift Incharge - Blast Furnace, Operator, Manager).' },
    { Rule: 'Department', Details: 'Department name (e.g. Plant Operations, Engineering & Tech, Human Resources).' },
    { Rule: 'Business Unit', Details: 'Division or Business Unit (e.g. Steel & Manufacturing, Corporate HQ).' },
    { Rule: 'Location', Details: 'Office location, plant, or site name (e.g. Kolkata Steel Plant, Mumbai HQ).' },
    { Rule: 'Employee Category', Details: 'OPTIONAL. Specify "White Collar" or "Blue Collar". NOTE: All employees reporting under a "Shift Incharge" are automatically categorized as Blue Collar if not specified.' },
    { Rule: 'Email', Details: 'Work email address (Optional for Blue Collar staff).' },
    { Rule: 'Phone', Details: 'Work phone number.' },
    { Rule: 'Date of Joining', Details: 'Date format: YYYY-MM-DD.' },
    { Rule: 'Employment Type', Details: 'Permanent, Contract, Intern, or Consultant.' },
    { Rule: 'Status', Details: 'Active, Vacant, or Inactive.' },
    { Rule: 'Profile Image URL', Details: 'Direct HTTP/HTTPS link to employee photo avatar (Optional).' }
  ];

  const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [{ wch: 22 }, { wch: 85 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions & Rules');

  XLSX.writeFile(workbook, filename);
};
