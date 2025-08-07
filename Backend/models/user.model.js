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
  jobCategory: {
    type: String,
    required: [true, 'Job category is required']
  },
  interests: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be under 500 characters']
  }
}, {
  timestamps: true
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = model('User', userSchema);
export default User;
