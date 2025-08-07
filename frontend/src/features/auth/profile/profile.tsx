import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../auth/navbar/navbar';
import './profile.css';

type User = {
  _id: string;
  username: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  jobCategory?: string | null;
  interests?: string | null;
  bio?: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3000/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log('✅ Profile data loaded:', data.user);
        } else {
          setError('Failed to load user profile');
        }
      } catch (error) {
        console.log('Error:', error);
        setError('Network error occurred');
      }
      setLoading(false);
    };

    if (userId) {
      getUser();
    }
  }, [userId]);

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
          <h2>❌ {error || 'User not found'}</h2>
          <button onClick={() => navigate('/home')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Mock data for professional stats (you can make these dynamic later)
  const profileStats = {
    connections: Math.floor(Math.random() * 100) + 20,
    projects: Math.floor(Math.random() * 50) + 5,
    reviews: Math.floor(Math.random() * 30) + 1
  };

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
            ← Back to Home
          </button>

          {/* Main Profile Card */}
          <div className="profile-card">
            
            {/* Header Section with Gradient Background */}
            <div className="profile-header">
              
              {/* Action Buttons */}
              <div className="header-actions">
                <button className="action-btn connect-btn">
                  <span className="btn-icon">👥</span>
                  Connect
                </button>
                <button className="action-btn message-btn">
                  <span className="btn-icon">💬</span>
                  Message
                </button>
              </div>

              {/* Profile Avatar */}
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Basic Info */}
              <div className="profile-basic-info">
                <h1 className="profile-name">{user.username}</h1>
                
                {user.address && (
                  <p className="profile-location">
                    <span className="location-icon">📍</span>
                    {user.address}
                  </p>
                )}
                
                <div className="profile-title">
                  {user.jobCategory && (
                    <>
                      <span className="job-title">
                        {user.jobCategory.charAt(0).toUpperCase() + user.jobCategory.slice(1)}
                      </span>
                      <span className="job-separator"> • </span>
                    </>
                  )}
                  <span className="company-name">Professional</span>
                </div>
              </div>


            </div>

            {/* Profile Details Section */}
            <div className="profile-details">
              
              {/* Contact Information */}
              <div className="details-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="details-grid">
                  
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <div className="detail-content">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{user.email}</span>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <div className="detail-content">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{user.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              {(user.interests || user.bio) && (
                <div className="details-section">
                  <h3 className="section-title">Professional Details</h3>
                  
                  {user.interests && typeof user.interests === 'string' && (
                    <div className="detail-item">
                      <span className="detail-icon">🎯</span>
                      <div className="detail-content">
                        <span className="detail-label">Skills & Interests</span>
                        <div className="interests-tags">
                          {user.interests.split(',').map((interest, index) => (
                            <span key={index} className="interest-tag">
                              {interest.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div className="bio-section">
                      <h4 className="bio-title">
                        <span className="detail-icon">📝</span>
                        Bio
                      </h4>
                      <p className="bio-text">{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}