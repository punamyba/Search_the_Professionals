// backend/models/experience.model.js
import { Schema, model } from 'mongoose';

const experienceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters long'],
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters long'],
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: {
      values: ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal'],
      message: 'Invalid employment type'
    }
  },
  startMonth: {
    type: String,
    required: [true, 'Start month is required'],
    enum: {
      values: ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'],
      message: 'Invalid start month'
    }
  },
  startYear: {
    type: String,
    required: [true, 'Start year is required'],
    validate: {
      validator: function(value) {
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= 1950 && year <= currentYear;
      },
      message: 'Start year must be between 1950 and current year'
    }
  },
  endMonth: {
    type: String,
    enum: {
      values: ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December'],
      message: 'Invalid end month'
    },
    validate: {
      validator: function(value) {
        return this.isCurrentRole || (value && value.length > 0);
      },
      message: 'End month is required for non-current roles'
    }
  },
  endYear: {
    type: String,
    validate: [
      {
        validator: function(value) {
          return this.isCurrentRole || (value && value.length > 0);
        },
        message: 'End year is required for non-current roles'
      },
      {
        validator: function(value) {
          if (!value || this.isCurrentRole) return true;
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          return year >= 1950 && year <= currentYear;
        },
        message: 'End year must be between 1950 and current year'
      }
    ]
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [2, 'Location must be at least 2 characters long'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  locationType: {
    type: String,
    required: [true, 'Location type is required'],
    enum: {
      values: ['On-site', 'Remote', 'Hybrid'],
      message: 'Invalid location type'
    },
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

experienceSchema.index({ userId: 1, createdAt: -1 });

const Experience = model('Experience', experienceSchema);
export default Experience;