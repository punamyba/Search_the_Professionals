import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../auth/navbar/navbar';
import './profile.css';
import EducationSection from '../EducationSection/education';
import ExperienceSection from '../ExperienceSection/experience';
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
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
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
        console.log(' Fetching profile for userId:', userId);
        console.log(' Using token:', token ? 'Token exists' : 'No token');
        
        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(' Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log(' Profile data received:', data);
          setUser(data.user);
        } else {
          const errorData = await response.text();
          console.error(' Response error:', errorData);
          setError(`Failed to load user profile: ${response.status}`);
        }
      } catch (error) {
        console.error(' Network error:', error);
        setError('Network error occurred');
      }
      setLoading(false);
    };

    if (userId) {
      getUser();
    }
  }, [userId]);

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
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/home')}
            className="back-button"
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>

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
                  <h1 className="profile-name">{user.username}</h1>
                  
                  {user.address && (
                    <p className="profile-location">
                      <i className="fas fa-map-marker-alt"></i>
                      {user.address}
                    </p>
                  )}
                  
                  {user.bio && (
                    <p className="profile-description">{user.bio}</p>
                  )}
                </div>

              </div>

              {/* Skills  Section */}
              <div className="profile-section">
                <h3 className="section-title">
                  <i className="fas fa-code"></i> Skills 
                </h3>
                <div className="skills-container">
                  <span className="skill-tag">React</span>
                  <span className="skill-tag">Node.js</span>
                  <span className="skill-tag">JavaScript</span>
                  <span className="skill-tag">MongoDB</span>
                </div>
              </div>

              {/* Experience Section */}
              <div className="profile-section">
                <ExperienceSection userId={userId} />
              </div>

            </div>

            {/* Right Side - Sidebar */}
            <div className="profile-sidebar">
              
              {/* Quick Stats */}
              <div className="sidebar-card">
                <h3 className="card-title">
                  <i className="fas fa-chart-line"></i> Quick Stats
                </h3>
                <div className="stat-item">
                  <span className="stat-label">
                    <i className="fas fa-dollar-sign"></i> Hourly Rate
                  </span>
                  <span className="stat-value">$45/hr</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <i className="fas fa-clock"></i> Experience
                  </span>
                  <span className="stat-value">2+ years</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">
                    <i className="fas fa-calendar-check"></i> Availability
                  </span>
                  <span className="stat-value">Full-Time</span>
                </div>
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

              {/* Education Section */}
              <EducationSection userId={userId} />

            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}