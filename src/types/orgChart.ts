export interface Employee {
  employeeCode: string;
  name: string;
  managerCode: string; // empty string or null for CEO/MD
  designation: string;
  department: string;
  businessUnit?: string;
  location?: string;
  email?: string;
  phone?: string;
  dateOfJoining?: string;
  employmentType?: 'Permanent' | 'Contract' | 'Intern' | 'Consultant' | string;
  status: 'Active' | 'Inactive' | string;
  profileImageUrl?: string;
}

export interface TreeNode extends Employee {
  children: TreeNode[];
  directReportsCount: number;
  totalSubtreeCount: number;
  depth: number;
  isCollapsed?: boolean;
}

export type ErrorSeverity = 'error' | 'warning';

export interface ValidationError {
  row: number;
  employeeCode: string;
  employeeName: string;
  field: string;
  severity: ErrorSeverity;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRecords: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  errors: ValidationError[];
  rootEmployees: Employee[];
  parsedEmployees: Employee[];
}

export type ThemeMode = 'corporate' | 'light' | 'dark' | 'gallantt';

export interface BrandingConfig {
  companyName: string;
  companyLogoUrl?: string;
  primaryColor: string; // e.g. #4b2320 or #2563eb
  secondaryColor: string; // e.g. #f26522
  accentColor: string; // e.g. #10b981
  fontFamily: string;
  footerText: string;
  themeMode: ThemeMode;
}

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  versionName: string;
  employeeCount: number;
  data: Employee[];
  branding: BrandingConfig;
}

export interface FilterState {
  searchQuery: string;
  department: string;
  businessUnit: string;
  location: string;
  designation: string;
  employmentType: string;
  status: string;
  filterMode: 'highlight' | 'dim' | 'isolate';
}

export type LayoutOrientation = 'TB' | 'LR'; // Top-to-Bottom or Left-to-Right
