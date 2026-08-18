import React, { useState, useMemo } from 'react';
import { X, Save, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import type { Employee } from '../types/orgChart';

interface EditEmployeeModalProps {
  employee: Employee;
  allEmployees: Employee[];
  onClose: () => void;
  onSave: (updatedEmployee: Employee) => Promise<void>;
  userRole: string;
  isDarkMode?: boolean;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  allEmployees,
  onClose,
  onSave,
  userRole,
  isDarkMode = false
}) => {
  const [formData, setFormData] = useState<Employee>({ ...employee });
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

  // Available managers (exclude self to avoid self-reporting loop)
  const availableManagers = useMemo(() => {
    return allEmployees.filter((emp) => emp.employeeCode !== employee.employeeCode);
  }, [allEmployees, employee.employeeCode]);

  const managerOptions = useMemo(() => {
    return [
      {
        value: '',
        label: '-- Top Level Executive (No Manager / CMD) --',
        sublabel: 'Reports directly to Board / Top Executive'
      },
      ...availableManagers.map((mgr) => ({
        value: mgr.employeeCode,
        label: `${mgr.name} (${mgr.employeeCode})`,
        sublabel: `${mgr.designation} [${mgr.department}]`
      }))
    ];
  }, [availableManagers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Employee Name is required.');
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
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee details.');
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
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-500/20 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Edit Employee Details & Hierarchy
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Updating Employee Code: <span className="font-mono font-bold text-blue-600">{employee.employeeCode}</span>
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
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Authorized Access Role: <strong>{userRole}</strong>
            </span>
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
              Admin Verified
            </span>
          </div>

          {/* Section 1: Basic Profile Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              1. Basic Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                  placeholder="e.g. Rahul Sharma"
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
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                  placeholder="e.g. Senior Manager - HR"
                />
              </div>

              {/* Department with Searchable Dropdown */}
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

              <div>
                <label className="block text-xs font-semibold mb-1">Business Unit</label>
                <input
                  type="text"
                  value={formData.businessUnit || ''}
                  onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                  placeholder="e.g. Corporate HQ"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hierarchy & Reporting Manager with Searchable Select */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              2. Reporting Hierarchy Setup
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Reporting Manager (Hierarchy Parent)
              </label>
              <SearchableSelect
                options={managerOptions}
                value={formData.managerCode || ''}
                onChange={(val) => setFormData({ ...formData, managerCode: val })}
                placeholder="Select reporting manager..."
                searchPlaceholder="Type to find manager by name, code, designation..."
                isDarkMode={isDarkMode}
              />
              <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Click dropdown to search and pick reporting manager.
              </p>
            </div>
          </div>

          {/* Section 3: Contact, Status & Employment */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              3. Contact, Status & Employment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                  placeholder="e.g. Mumbai, HQ"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Worker Category</label>
                <select
                  value={formData.employeeCategory || 'White Collar'}
                  onChange={(e) => setFormData({ ...formData, employeeCategory: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                >
                  <option value="White Collar">White Collar</option>
                  <option value="Blue Collar">Blue Collar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Employment Type</label>
                <select
                  value={formData.employmentType || 'Permanent'}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
                  }`}
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                  <option value="Consultant">Consultant</option>
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
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
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
                      ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900'
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Employee & Hierarchy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
