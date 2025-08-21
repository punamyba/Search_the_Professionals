import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../auth/navbar/navbar';
import './profile.css';
import EducationSection from '../EducationSection/education';
import ExperienceSection from '../ExperienceSection/experience';
import SkillsSection from '../SkillsSection/skill';
import Footer from '../Footer/footer';

type Experience = {
  id?: string;
  _id?: string;
  title: string;
  company: string;
  employmentType: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  location: string;
  locationType: string;
  description: string;
  isCurrentRole: boolean;
};

type Education = {
  id?: string;
  _id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: {
    month: string;
    year: string;
  };
  endDate: {
    month: string;
    year: string;
  };
  grade?: string;
  activities?: string;
};

type EditProfile = {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  employmentType: string;
  expectedSalary: string;
};

type Skill = {
  _id: string;
  skillName: string;
  level: string;
};

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
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[]; // Added skills to User type
  editProfile?: EditProfile;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user ID from token to check if this is their own profile
    const getCurrentUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 Full decoded token:', decoded); // Debug line to see token structure
          setCurrentUserId(decoded.userId || decoded.id || decoded._id); // Try different field names
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching profile for userId:', userId);
        console.log('Using token:', token ? 'Token exists' : 'No token');
        
        // Single API call to get all data including skills
        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          console.log('Skills in profile:', data.user.skills); // Debug skills
          setUser(data.user);
          
          // Set experiences, educations, and skills from populated data
          setExperiences(data.user.experiences || []);
          setEducations(data.user.educations || []);
        } else {
          const errorData = await response.text();
          console.error('Response error:', errorData);
          setError(`Failed to load user profile: ${response.status}`);
        }
      } catch (error) {
        console.error('Network error:', error);
        setError('Network error occurred');
      }
      setLoading(false);
    };

    if (userId) {
      getUser();
    }
  }, [userId]);

  // Memoized callback to handle skills updates
  const handleSkillsUpdate = useCallback((updatedSkills: Skill[]) => {
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        skills: updatedSkills
      };
    });
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/user/uploadProfilePic', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Update user state with new profile picture
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
      // Reset file input
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
        // Update user state to remove profile picture
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isOwnProfile = currentUserId === userId;

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
          <h2>Err.. {error || 'User not found'}</h2>
          <p>User ID: {userId}</p>
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
      
      <div className="profile-wrapper">
        <div className="profile-container">
          
          {/* Header with Back and Edit buttons */}
          <div className="profile-header-buttons">
            <button 
              onClick={() => navigate('/home')}
              className="back-button"
            >
              <i className="fas fa-arrow-left"></i> Back to Home
            </button>
            
            {/* Edit Profile Button - only show for own profile */}
            {isOwnProfile && (
              <button 
                onClick={() => navigate('/edit-profile')}
                className="edit-profile-button"
              >
                <i className="fas fa-edit"></i> Edit Profile
              </button>
            )}
          </div>

          {/* Main Profile Layout  */}
          <div className="profile-layout">
            
            {/* Left Side - Main Profile */}
            <div className="profile-main">
              
              {/* Header Section */}
              <div className="profile-header">
                
                {/* Profile Avatar - Top Right Corner */}
                <div className="profile-avatar-corner">
                  <div className="avatar-container">
                    {user.profilePicture?.url ? (
                      <img 
                        src={user.profilePicture.url} 
                        alt={user.username}
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-circle">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {/* Upload controls - only show for own profile */}
                    {isOwnProfile && (
                      <div className="avatar-controls">
                        <button 
                          className="upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          title="Upload profile picture"
                        >
                          {uploadingImage ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-camera"></i>
                          )}
                        </button>
                        
                        {user.profilePicture?.url && (
                          <button 
                            className="delete-btn"
                            onClick={handleDeleteImage}
                            title="Delete profile picture"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Basic Info - Left Side */}
                <div className="profile-basic-info">
                  <h1 className="profile-name">
                    {user.editProfile?.fullName || user.username}
                  </h1>
                  
                  {user.address && (
                    <p className="profile-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {user.address}
                    </p>
                  )}
                </div>

              </div>

              {/* Bio Section - Outside header */}
              {user.bio && (
                <div className="profile-section bio-section">
                  <h3 className="section-title">
                    <i className="fas fa-user"></i> Bio
                  </h3>
                  <p className="bio-text">{user.bio}</p>
                </div>
              )}

             {/* Skills Section - Updated with props */}
            <div className="profile-section">
             <SkillsSection 
              skills={user.skills || []}
              userId={userId} 
              isOwnProfile={isOwnProfile}
              onSkillsUpdate={handleSkillsUpdate}
              />
            </div>

              {/* Experience Section - Passing data as props */}
              <div className="profile-section">
                <ExperienceSection 
                  userId={userId} 
                  experiences={experiences}
                  setExperiences={setExperiences}
                />
              </div>

            </div>

            {/* Right Side - Sidebar */}
            <div className="profile-sidebar">
              
              {/* Personal Information (replaces Quick Stats) */}
              <div className="sidebar-card">
                <h3 className="card-title">
                  <i className="fas fa-user"></i> Personal Information
                </h3>
                
                {user.editProfile?.fullName && (
                  <div className="personal-info-item">
                    <span className="info-label">
                      <i className="fas fa-id-card"></i> Full Name
                    </span>
                    <span className="info-value">{user.editProfile.fullName}</span>
                  </div>
                )}
                
                {user.editProfile?.dateOfBirth && (
                  <div className="personal-info-item">
                    <span className="info-label">
                      <i className="fas fa-birthday-cake"></i> Date of Birth
                    </span>
                    <span className="info-value">{formatDate(user.editProfile.dateOfBirth)}</span>
                  </div>
                )}
                
                {user.editProfile?.gender && (
                  <div className="personal-info-item">
                    <span className="info-label">
                      <i className="fas fa-venus-mars"></i> Gender
                    </span>
                    <span className="info-value">{user.editProfile.gender}</span>
                  </div>
                )}
                
                {user.editProfile?.employmentType && (
                  <div className="personal-info-item">
                    <span className="info-label">
                      <i className="fas fa-briefcase"></i> Employment Type
                    </span>
                    <span className="info-value">{user.editProfile.employmentType}</span>
                  </div>
                )}
                
                {user.editProfile?.expectedSalary && (
                  <div className="personal-info-item">
                    <span className="info-label">
                      <i className="fas fa-dollar-sign"></i> Expected Salary
                    </span>
                    <span className="info-value">{user.editProfile.expectedSalary}</span>
                  </div>
                )}
                
                {/* Show message if no edit profile data */}
                {!user.editProfile && (
                  <div className="no-info-message">
                    <i className="fas fa-info-circle"></i>
                    <span>Personal information not available</span>
                    {isOwnProfile && (
                      <button 
                        onClick={() => navigate('/edit-profile')}
                        className="add-info-btn"
                      >
                        Add Information
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="sidebar-card">
                <h3 className="card-title">
                  <i className="fas fa-address-book"></i> Contact Information
                </h3>
                <div className="contact-item">
                  <i className="fas fa-envelope contact-icon"></i>
                  <span className="contact-value">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="contact-item">
                    <i className="fas fa-phone contact-icon"></i>
                    <span className="contact-value">{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Education Section - Passing data as props */}
              <EducationSection 
                userId={userId} 
                educations={educations}
                setEducations={setEducations}
              />

            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}