import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../auth/navbar/navbar';
import './profile.css';

type User = {
  _id: string;
  username: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
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
        }
      } catch (error) {
        console.log('Error:', error);
      }
      setLoading(false);
    };

    getUser();
  }, [userId]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <h2>Loading...</h2>
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
            ← Back to Home
          </button>

          {/* Profile Card */}
          <div className="profile-card">
            
            {/* Avatar */}
            <div className="avatar">
              {user?.username.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <h1 className="username">{user?.username}</h1>
            <p className="email">{user?.email}</p>
            <p className="company">ING Tech</p>

            {/* Buttons */}
            <div className="button-container">
              <button className="message-btn">
                📩 Message
              </button>
              
              <button className="connect-btn">
                👥 Connect
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}