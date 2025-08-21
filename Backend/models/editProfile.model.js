// backend/models/edit.model.js
import { Schema, model } from 'mongoose';

const editProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [50, 'Full name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date) {
        if (!date) return false;
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (isNaN(birthDate.getTime()) || birthDate > today) return false;
        
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        
        return actualAge >= 16 && actualAge <= 65;
      },
      message: 'Please enter a valid date of birth (age must be between 16-65)'
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['Full Time', 'Remote', 'Part Time', 'Intern', 'Freelance']
  },
  expectedSalary: {
    type: String,
    enum: ['15k-20k', '20k-30k', '30k-50k', '50k-75k', '75k-100k', '100k+', ''],
    default: ''
  }
}, {
  timestamps: true
});

editProfileSchema.index({ userId: 1 });

const EditProfile = model('EditProfile', editProfileSchema);
export default EditProfile;