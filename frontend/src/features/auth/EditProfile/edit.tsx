import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Navbar from '../../auth/navbar/navbar';
import './edit.css';
import Footer from '../Footer/footer';

type User = {
  _id: string;
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  profilePicture?: {
    url?: string;
    public_id?: string;
  };
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  employmentType?: string;
  expectedSalary?: string;
};

// Form data type - matches the form fields we want to validate
type FormData = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  employmentType: string;
  expectedSalary: string;
};

export default function EditProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // React Hook Form setup with validation rules
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
    clearErrors
  } = useForm<FormData>({
    // Default values for the form
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      bio: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      employmentType: '',
      expectedSalary: ''
    },
    // Form validation mode - validate on submit and onChange after first submit
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  // Keep only simple options that might be useful
  const genderOptions = ['Male', 'Female', 'Other'];
  const employmentTypeOptions = ['Full Time', 'Remote', 'Part Time', 'Intern', 'Freelance'];
  const salaryOptions = ['15k-20k', '20k-30k', '30k-50k', '50k-75k', '75k-100k', '100k+'];

  // Custom validation function to check if username is unique (excluding current user)
  const validateUsername = async (username: string) => {
    if (!username || username === user?.username) return true;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/check-username/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.available || 'Username is already taken';
      }
      return true;
    } catch (error) {
      console.error('Username validation error:', error);
      return true; // Allow submission if validation fails
    }
  };

  // Custom validation function for phone number format
  const validatePhoneNumber = (phone: string) => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    
    // Basic phone number validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid phone number';
    }
    
    if (cleanPhone.length < 7) {
      return 'Phone number must be at least 7 digits';
    }
    
    return true;
  };

  // Custom validation for date of birth
  const validateDateOfBirth = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'Date of birth is required';
    }
    
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      return 'Please enter a valid date';
    }
    
    // Check if date is not in the future
    if (birthDate > today) {
      return 'Date of birth cannot be in the future';
    }
    
    // Adjust age calculation if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
    
    // Check reasonable age limits (16-65 years old for employment purposes)
    if (actualAge < 16) {
      return 'You must be at least 16 years old';
    }
    
    if (actualAge > 65) {
      return 'Please enter a valid date of birth';
    }
    
    return true;
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Decode token to get user ID
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.userId || decoded.id || decoded._id;

        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // Reset form with user data when loaded
          reset({
            fullName: data.user.fullName || '',
            username: data.user.username || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
            address: data.user.address || '',
            dateOfBirth: data.user.dateOfBirth || '',
            gender: data.user.gender || '',
            employmentType: data.user.employmentType || '',
            expectedSalary: data.user.expectedSalary || ''
          });
        } else {
          setError('Failed to load user profile');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [navigate, reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/uploadProfilePic', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataImg
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prevUser => ({
          ...prevUser!,
          profilePicture: data.profilePicture
        }));
        alert('Profile picture updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.profilePicture?.url) return;

    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/deleteProfilePic', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prevUser => ({
          ...prevUser!,
          profilePicture: { url: '', public_id: '' }
        }));
        alert('Profile picture deleted successfully!');
      } else {
        throw new Error(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete profile picture. Please try again.');
    }
  };

  // Form submit handler with React Hook Form
  const onSubmit = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/updateProfile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        navigate(`/profile/${user?._id}`);
      } else {
        // Handle server validation errors
        if (data.errors) {
          // Set specific field errors from server
          Object.keys(data.errors).forEach(field => {
            setFormError(field as keyof FormData, {
              type: 'server',
              message: data.errors[field]
            });
          });
        } else {
          throw new Error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <h2>Error: {error || 'User not found'}</h2>
          <button onClick={() => navigate('/home')} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="edit-profile-wrapper">
        <div className="edit-profile-container">
          
          {/* Header */}
          <div className="edit-header">
            <button 
              onClick={() => navigate(`/profile/${user._id}`)}
              className="back-button"
            >
              <i className="fas fa-arrow-left"></i> Back to Profile
            </button>
            <h1>Edit Profile</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
            
            {/* Profile Picture Section */}
            <div className="edit-section">
              <h3 className="section-title">Profile Picture</h3>
              <div className="profile-picture-edit">
                <div className="picture-container">
                  {user.profilePicture?.url ? (
                    <img 
                      src={user.profilePicture.url} 
                      alt={user.username}
                      className="profile-img"
                    />
                  ) : (
                    <div className="profile-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="picture-controls">
                  <button 
                    type="button"
                    className="btn btn-outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-camera"></i>
                        Change photo
                      </>
                    )}
                  </button>
                  
                  {user.profilePicture?.url && (
                    <button 
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDeleteImage}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="edit-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                
                {/* Full Name Field with Validation */}
                <div className="form-group">
                  <label htmlFor="fullName">Full name <span className="required">*</span></label>
                  <Controller
                    name="fullName"
                    control={control}
                    rules={{
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Full name must be at least 2 characters long'
                      },
                      maxLength: {
                        value: 50,
                        message: 'Full name cannot exceed 50 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message: 'Full name can only contain letters and spaces'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        id="fullName"
                        placeholder="Enter your full name"
                        className={errors.fullName ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.fullName && (
                    <span className="form-error">{errors.fullName.message}</span>
                  )}
                </div>

                {/* Username Field with Validation */}
                <div className="form-group">
                  <label htmlFor="username">Username <span className="required">*</span></label>
                  <Controller
                    name="username"
                    control={control}
                    rules={{
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters long'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Username cannot exceed 20 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores'
                      },
                      validate: validateUsername
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        id="username"
                        placeholder="Enter your username"
                        className={errors.username ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.username && (
                    <span className="form-error">{errors.username.message}</span>
                  )}
                </div>

                {/* Email Field with Validation */}
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        className={errors.email ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

                {/* Phone Field with Validation */}
                <div className="form-group">
                  <label htmlFor="phone">Phone number <span className="required">*</span></label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: 'Phone number is required',
                      validate: validatePhoneNumber
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        id="phone"
                        placeholder="Enter your phone number"
                        className={errors.phone ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.phone && (
                    <span className="form-error">{errors.phone.message}</span>
                  )}
                </div>

                {/* Date of Birth Field with Validation */}
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of birth <span className="required">*</span></label>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    rules={{
                      required: 'Date of birth is required',
                      validate: validateDateOfBirth
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        id="dateOfBirth"
                        placeholder="Select your date of birth"
                        className={errors.dateOfBirth ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.dateOfBirth && (
                    <span className="form-error">{errors.dateOfBirth.message}</span>
                  )}
                </div>

                {/* Gender Field */}
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <select {...field} id="gender">
                        <option value="">--select--</option>
                        {genderOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                {/* Employment Type Field with Validation */}
                <div className="form-group">
                  <label htmlFor="employmentType">Employment type <span className="required">*</span></label>
                  <Controller
                    name="employmentType"
                    control={control}
                    rules={{
                      required: 'Employment type is required'
                    }}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="employmentType"
                        className={errors.employmentType ? 'error' : ''}
                      >
                        <option value="">--select--</option>
                        {employmentTypeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.employmentType && (
                    <span className="form-error">{errors.employmentType.message}</span>
                  )}
                </div>

                {/* Expected Salary Field */}
                <div className="form-group">
                  <label htmlFor="expectedSalary">Expected salary</label>
                  <Controller
                    name="expectedSalary"
                    control={control}
                    render={({ field }) => (
                      <select {...field} id="expectedSalary">
                        <option value="">--select--</option>
                        {salaryOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                {/* Address Field with Validation */}
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <Controller
                    name="address"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 100,
                        message: 'Address cannot exceed 100 characters'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        id="address"
                        placeholder="Your current address"
                        className={errors.address ? 'error' : ''}
                      />
                    )}
                  />
                  {errors.address && (
                    <span className="form-error">{errors.address.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="edit-section">
              <h3 className="section-title">About You</h3>
              <div className="form-group full-width">
                <label htmlFor="bio">Bio</label>
                <Controller
                  name="bio"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 500,
                      message: 'Bio cannot exceed 500 characters'
                    }
                  }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="bio"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className={errors.bio ? 'error' : ''}
                    />
                  )}
                />
                {errors.bio && (
                  <span className="form-error">{errors.bio.message}</span>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Profile
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </div>
          </form>

        </div>
      </div>
      <Footer/>
    </div>
  );
}