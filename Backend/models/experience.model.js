// models/experience.model.js
import { Schema, model } from 'mongoose';

const experienceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal']
  },
  startMonth: {
    type: String,
    required: [true, 'Start month is required'],
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },
  startYear: {
    type: String,
    required: [true, 'Start year is required'],
    validate: {
      validator: function(v) {
        const year = parseInt(v);
        const currentYear = new Date().getFullYear();
        return year >= 1950 && year <= currentYear;
      },
      message: 'Start year must be between 1950 and current year'
    }
  },
  endMonth: {
    type: String,
    enum: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
  },
  endYear: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const year = parseInt(v);
        const currentYear = new Date().getFullYear();
        return year >= 1950 && year <= currentYear;
      },
      message: 'End year must be between 1950 and current year'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  locationType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  isCurrentRole: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validate that end date is after start date (if provided)
experienceSchema.pre('save', function(next) {
  if (!this.isCurrentRole && this.endMonth && this.endYear) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const startYear = parseInt(this.startYear);
    const endYear = parseInt(this.endYear);
    const startMonthIndex = months.indexOf(this.startMonth);
    const endMonthIndex = months.indexOf(this.endMonth);
    
    if (endYear < startYear) {
      return next(new Error('End year must be after start year'));
    }
    
    if (endYear === startYear && endMonthIndex < startMonthIndex) {
      return next(new Error('End date must be after start date'));
    }
  }
  
  next();
});

// Index for faster queries
experienceSchema.index({ userId: 1, createdAt: -1 });

const Experience = model('Experience', experienceSchema);
export default Experience;