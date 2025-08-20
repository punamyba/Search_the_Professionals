// models/education.model.js
import { Schema, model } from 'mongoose';

const educationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  school: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    minlength: [2, 'School name must be at least 2 characters'],
    maxlength: [100, 'School name cannot exceed 100 characters']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    minlength: [2, 'Degree must be at least 2 characters'],
    maxlength: [50, 'Degree cannot exceed 50 characters']
  },
  fieldOfStudy: {
    type: String,
    required: [true, 'Field of study is required'],
    trim: true,
    minlength: [2, 'Field of study must be at least 2 characters'],
    maxlength: [50, 'Field of study cannot exceed 50 characters']
  },
  startDate: {
    month: {
      type: String,
      required: [true, 'Start month is required'],
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },
    year: {
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
    }
  },
  endDate: {
    month: {
      type: String,
      required: [true, 'End month is required'],
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    },
    year: {
      type: String,
      required: [true, 'End year is required'],
      validate: {
        validator: function(v) {
          const year = parseInt(v);
          const currentYear = new Date().getFullYear();
          return year >= 1950 && year <= currentYear + 10;
        },
        message: 'End year must be between 1950 and 10 years from now'
      }
    }
  },
  grade: {
    type: String,
    trim: true,
    maxlength: [20, 'Grade cannot exceed 20 characters']
  },
  activities: {
    type: String,
    trim: true,
    maxlength: [500, 'Activities description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
educationSchema.pre('save', function(next) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const startYear = parseInt(this.startDate.year);
  const endYear = parseInt(this.endDate.year);
  const startMonthIndex = months.indexOf(this.startDate.month);
  const endMonthIndex = months.indexOf(this.endDate.month);
  
  if (endYear < startYear) {
    return next(new Error('End year must be after start year'));
  }
  
  if (endYear === startYear && endMonthIndex < startMonthIndex) {
    return next(new Error('End date must be after start date'));
  }
  
  next();
});

// Index for faster queries
educationSchema.index({ userId: 1, createdAt: -1 });

const Education = model('Education', educationSchema);
export default Education;