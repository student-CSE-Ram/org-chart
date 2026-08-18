import express from 'express';
import { EmployeeModel } from '../models/Employee.js';
import { requireAuthorizedRole } from '../middleware/auth.js';

const router = express.Router();

// Baseline 4 dummy records requested by user for initial DB setup
export const INITIAL_4_DUMMY_EMPLOYEES = [
  {
    employeeCode: 'EMP-001',
    name: 'Vikramaditya Singhania',
    managerCode: '',
    designation: 'Chairman & Managing Director (CMD)',
    department: 'Executive Board',
    businessUnit: 'Corporate HQ',
    location: 'Mumbai, HQ',
    email: 'v.singhania@orgchart.com',
    phone: '+91 98200 11001',
    dateOfJoining: '2015-04-01',
    employmentType: 'Permanent',
    employeeCategory: 'White Collar',
    status: 'Active',
    role: 'CMD'
  },
  {
    employeeCode: 'EMP-002',
    name: 'Ananya Roy',
    managerCode: 'EMP-001',
    designation: 'Chief Executive Officer (CEO)',
    department: 'Executive Management',
    businessUnit: 'Digital Solutions',
    location: 'Bengaluru Innovation Center',
    email: 'ananya.roy@orgchart.com',
    phone: '+91 98860 22002',
    dateOfJoining: '2018-02-15',
    employmentType: 'Permanent',
    employeeCategory: 'White Collar',
    status: 'Active',
    role: 'CEO'
  },
  {
    employeeCode: 'EMP-003',
    name: 'Rajesh Sharma',
    managerCode: 'EMP-001',
    designation: 'Chief Human Resources Officer (CHRO)',
    department: 'Human Resources',
    businessUnit: 'Corporate HQ',
    location: 'Mumbai, HQ',
    email: 'rajesh.sharma@orgchart.com',
    phone: '+91 98211 33003',
    dateOfJoining: '2017-09-10',
    employmentType: 'Permanent',
    employeeCategory: 'White Collar',
    status: 'Active',
    role: 'HOD'
  },
  {
    employeeCode: 'EMP-004',
    name: 'Priya Nair',
    managerCode: 'EMP-001',
    designation: 'Chief Operating Officer (COO)',
    department: 'Operations',
    businessUnit: 'Steel & Manufacturing',
    location: 'Kolkata Steel Plant',
    email: 'priya.nair@orgchart.com',
    phone: '+91 98300 44004',
    dateOfJoining: '2019-01-20',
    employmentType: 'Permanent',
    employeeCategory: 'White Collar',
    status: 'Active',
    role: 'Director'
  }
];

// Helper to seed initial 4 dummy records if DB is empty
export const seedInitial4DummyDataIfEmpty = async () => {
  try {
    const count = await EmployeeModel.countDocuments();
    if (count === 0) {
      await EmployeeModel.insertMany(INITIAL_4_DUMMY_EMPLOYEES);
      console.log('[MongoDB] Seeded initial 4 dummy employee records successfully.');
    }
  } catch (err) {
    console.error('[MongoDB] Error seeding initial 4 records:', err.message);
  }
};

/**
 * GET /api/employees
 * Fetch all employees from DB. Returns [] if empty.
 */
router.get('/', async (req, res) => {
  try {
    const employees = await EmployeeModel.find().lean();
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/employees/:code
 * Fetch single employee by code.
 */
router.get('/:code', async (req, res) => {
  try {
    const employee = await EmployeeModel.findOne({ employeeCode: req.params.code }).lean();
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/employees
 * Add a new employee record. Requires Authorized Role (Admin, CMD, CEO, Director, HOD).
 */
router.post('/', requireAuthorizedRole, async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.employeeCode || !payload.name || !payload.designation || !payload.department) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: employeeCode, name, designation, and department are mandatory.'
      });
    }

    // Check for existing employee code
    const existing = await EmployeeModel.findOne({ employeeCode: payload.employeeCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Employee with code '${payload.employeeCode}' already exists.`
      });
    }

    // Prevent self reporting
    if (payload.managerCode && payload.managerCode === payload.employeeCode) {
      return res.status(400).json({
        success: false,
        message: 'An employee cannot report to themselves.'
      });
    }

    const newEmp = new EmployeeModel(payload);
    await newEmp.save();

    res.status(201).json({
      success: true,
      message: 'Employee added successfully.',
      data: newEmp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/employees/:code
 * Update existing employee details & reporting manager (hierarchy).
 * Requires Authorized Role (Admin, CMD, CEO, Director, HOD).
 */
router.put('/:code', requireAuthorizedRole, async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;

    const existingEmp = await EmployeeModel.findOne({ employeeCode: code });
    if (!existingEmp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Prevent self-reporting
    if (updates.managerCode && updates.managerCode === code) {
      return res.status(400).json({
        success: false,
        message: 'An employee cannot report to themselves.'
      });
    }

    // Prevent circular reporting loops
    if (updates.managerCode && updates.managerCode !== existingEmp.managerCode) {
      const allEmps = await EmployeeModel.find().lean();
      let currentManagerCode = updates.managerCode;
      const visited = new Set([code]);

      while (currentManagerCode) {
        if (visited.has(currentManagerCode)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid hierarchy update: Creating this reporting link creates a circular loop in the org chart.'
          });
        }
        visited.add(currentManagerCode);
        const mgr = allEmps.find((e) => e.employeeCode === currentManagerCode);
        currentManagerCode = mgr ? mgr.managerCode : '';
      }
    }

    // Apply updates
    Object.assign(existingEmp, updates);
    await existingEmp.save();

    res.json({
      success: true,
      message: 'Employee details and reporting structure updated successfully.',
      data: existingEmp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/employees/:code
 * Delete an employee or convert position to Vacant if direct reportees exist.
 * Rule: If employee has direct reportees, convert position to Vacant so reportees don't jump levels.
 * Requires Authorized Role (Admin, CMD, CEO, Director, HOD).
 */
router.delete('/:code', requireAuthorizedRole, async (req, res) => {
  try {
    const { code } = req.params;
    const employee = await EmployeeModel.findOne({ employeeCode: code });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check if this employee has direct reportees
    const directReports = await EmployeeModel.find({ managerCode: code });

    if (directReports.length > 0) {
      // Direct reportees exist: Convert this position to Vacant so direct reports remain under this manager position!
      employee.name = `Vacant - ${employee.designation}`;
      employee.status = 'Vacant';
      employee.email = '';
      employee.phone = '';
      employee.profileImageUrl = '';
      await employee.save();

      return res.json({
        success: true,
        message: `Employee position ${code} has been converted to Vacant. Their ${directReports.length} direct reportee(s) remain attached to this vacant position.`,
        convertedToVacant: true,
        data: employee
      });
    } else {
      // No direct reportees: Hard delete document from database
      await EmployeeModel.deleteOne({ employeeCode: code });

      return res.json({
        success: true,
        message: `Employee ${code} deleted successfully.`,
        deleted: true
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/employees/bulk-sync
 * Bulk sync array of employees from uploaded Excel into MongoDB.
 * Clears old records and inserts full uploaded dataset.
 * Requires Authorized Role.
 */
router.post('/bulk-sync', requireAuthorizedRole, async (req, res) => {
  try {
    const { employees, replace = true } = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: Array of employees required.' });
    }

    if (replace) {
      // Clear existing records before saving newly uploaded dataset
      await EmployeeModel.deleteMany({});
    }

    if (employees.length > 0) {
      await EmployeeModel.insertMany(employees);
    }

    const updatedList = await EmployeeModel.find().lean();
    console.log(`[MongoDB] Bulk synced ${updatedList.length} employee records from Excel upload.`);

    res.json({
      success: true,
      message: `Successfully synchronized ${updatedList.length} employee records with MongoDB.`,
      count: updatedList.length,
      data: updatedList
    });
  } catch (error) {
    console.error('[MongoDB] Bulk sync error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
