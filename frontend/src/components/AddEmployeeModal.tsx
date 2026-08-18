import React, { useState, useMemo } from 'react';
import { X, UserPlus, Save, ShieldCheck, AlertCircle } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import type { Employee } from '../types/orgChart';

interface AddEmployeeModalProps {
  allEmployees: Employee[];
  onClose: () => void;
  onAdd: (newEmployee: Employee) => Promise<void>;
  userRole: string;
  isDarkMode?: boolean;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  allEmployees,
  onClose,
  onAdd,
  userRole,
  isDarkMode = false
}) => {
  // Generate next default employee code
  const generateCode = () => {
    const numbers = allEmployees
      .map((e) => {
        const match = e.employeeCode.match(/EMP-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `EMP-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<Employee>({
    employeeCode: generateCode(),
    name: '',
    designation: '',
    department: '', // Default empty per UX request
    businessUnit: '',
    location: '',
    managerCode: '',
    status: 'Active',
    employeeCategory: 'White Collar',
    employmentType: 'Permanent',
    email: '',
    phone: '',
    dateOfJoining: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract unique departments for dropdown
  const existingDepartments = useMemo(() => {
    const set = new Set<string>();
    allEmployees.forEach((emp) => {
      if (emp.department && emp.department.trim()) {
        set.add(emp.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [allEmployees]);

  const departmentOptions = useMemo(() => {
    return existingDepartments.map((dept) => ({
      value: dept,
      label: dept
    }));
  }, [existingDepartments]);

  const managerOptions = useMemo(() => {
    return [
      {
        value: '',
        label: '-- Top Level Executive (No Manager / CMD) --',
        sublabel: 'Reports directly to Board / Top Executive'
      },
      ...allEmployees.map((mgr) => ({
        value: mgr.employeeCode,
        label: `${mgr.name} (${mgr.employeeCode})`,
        sublabel: `${mgr.designation} [${mgr.department}]`
      }))
    ];
  }, [allEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.employeeCode.trim()) {
      setErrorMsg('Employee Code is required.');
      return;
    }
    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMsg('Designation is required.');
      return;
    }
    if (!formData.department.trim()) {
      setErrorMsg('Department is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add new employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-scaleUp ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Add New Employee</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Add employee directly to backend database & org hierarchy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Access Badge Notice */}
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Authorized Access Role: <strong>{userRole}</strong>
            </span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
              Admin Verified
            </span>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Employee Code *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all font-mono font-bold ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="EMP-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. Vikram Verma"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. Vice President - Finance"
                />
              </div>

              {/* Department with Searchable Select */}
              <div>
                <label className="block text-xs font-semibold mb-1">Department *</label>
                <SearchableSelect
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(val) => setFormData({ ...formData, department: val })}
                  placeholder="Select or type department..."
                  searchPlaceholder="Type to find or add department..."
                  allowCustomInput={true}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hierarchy Setup with Searchable Select */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. Assign Reporting Manager (Hierarchy Parent)
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Reports To (Manager)
              </label>
              <SearchableSelect
                options={managerOptions}
                value={formData.managerCode || ''}
                onChange={(val) => setFormData({ ...formData, managerCode: val })}
                placeholder="Select reporting manager..."
                searchPlaceholder="Type to find manager by name, code, designation..."
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Section 3: Contact & Status */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Employment & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Business Unit</label>
                <input
                  type="text"
                  value={formData.businessUnit || ''}
                  onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. Corporate HQ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. Mumbai, HQ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Worker Category</label>
                <select
                  value={formData.employeeCategory || 'White Collar'}
                  onChange={(e) => setFormData({ ...formData, employeeCategory: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                >
                  <option value="White Collar">White Collar</option>
                  <option value="Blue Collar">Blue Collar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. employee@orgchart.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-emerald-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Employee Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
