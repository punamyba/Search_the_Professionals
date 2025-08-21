// backend/models/user.model.js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{7,15}$/, 'Enter a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be under 500 characters'],
    default: ''
  },
  profilePicture: {
    url: {
      type: String,
      default: ''
    },
    public_id: {
      type: String,
      default: ''
    }
  },

  experienceIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Experience'
  }],
  educationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Education'
  }],
  skillsIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  editProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'EditProfile'
  }
}, {
  timestamps: true
});

// Virtual for calculating age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to get profile data (excluding sensitive info)
userSchema.methods.getProfileData = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = model('User', userSchema);
export default User;