import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    managerCode: {
      type: String,
      default: '',
      trim: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    businessUnit: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    dateOfJoining: {
      type: String,
      default: '',
      trim: true
    },
    employmentType: {
      type: String,
      default: 'Permanent',
      trim: true
    },
    status: {
      type: String,
      default: 'Active',
      trim: true
    },
    profileImageUrl: {
      type: String,
      default: '',
      trim: true
    },
    employeeCategory: {
      type: String,
      default: 'White Collar',
      trim: true
    },
    role: {
      type: String,
      default: 'Employee',
      enum: ['Admin', 'CMD', 'CEO', 'Director', 'HOD', 'Employee'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const EmployeeModel = mongoose.model('Employee', employeeSchema);
