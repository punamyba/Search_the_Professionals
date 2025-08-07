import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from '../../auth/navbar/navbar';

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

export default function Home() {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      setUsername(userData.username);
    } else {
      navigate('/login');
    }
  }, []);

  const getUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/user/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        console.log('✅ Users loaded from backend database:', data.users?.length);
      } else {
        setError('Failed to get users from backend');
      }
    } catch (err) {
      setError('Backend server connection failed');
    }
    
    setLoading(false);
  };

  const searchUsersInBackend = async (query: string) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/user/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        console.log('🔍 Backend search results:', data.users?.length, 'for query:', query);
      } else {
        setError('Backend search failed');
      }
    } catch (err) {
      setError('Backend search connection failed');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    
    if (value.trim() === '') {
      getUsers();
    } else {
      searchUsersInBackend(value);
    }
  };

  const goToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div>
      <Navbar />
      
      <div className="home-wrapper">
        <div className="home-content">
          
          <section className="hero-section">
            <h1>Welcome back, {username} 🌼</h1>
            <p>Discover amazing job opportunities and connect with professionals.</p>

            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="Search users in backend database..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="results-info">
              {loading && "Searching in backend database..."}
              {error && `Error: ${error}`}
              {!loading && !error && searchText && `${users.length} users found in backend for "${searchText}"`}
              {!loading && !error && !searchText && `${users.length} total users from backend database`}
            </div>

            {error && (
              <button onClick={getUsers} className="retry-btn">
                Reload from Backend
              </button>
            )}
          </section>

          <section className="features">
            <div className="feature-card">
              <h3>💼 Job Listings</h3>
              <p>Browse jobs tailored to your skills and interests.</p>
            </div>
            <div className="feature-card">
              <h3>🧑‍💻 Create Your Profile</h3>
              <p>Build a standout profile to attract top employers.</p>
            </div>
            <div className="feature-card">
              <h3>📢 Post a Job</h3>
              <p>Looking to hire? Post jobs and find the right talent.</p>
            </div>
          </section>
        </div>

        <div className="user-grid">
          {loading && <div>Loading from backend database...</div>}
          
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
              <button onClick={getUsers}>Try Again</button>
            </div>
          )}

          {!loading && !error && users.length === 0 && searchText && (
            <div className="no-results">
              <p>No users found in backend database for "{searchText}"</p>
            </div>
          )}

          {!loading && !error && users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              
              <h3>{user.username}</h3>
              <p className="user-email">{user.email}</p>
              
              {user.jobCategory && (
                <p className="job-category">
                  💼 {user.jobCategory.charAt(0).toUpperCase() + user.jobCategory.slice(1)}
                </p>
              )}
              
              {user.address && (
                <p className="user-address">📍 {user.address}</p>
              )}
              
              {user.interests && typeof user.interests === 'string' && (
                <p className="user-interests">
                  🎯 {user.interests.split(',').slice(0, 2).join(', ')}
                  {user.interests.split(',').length > 2 && '...'}
                </p>
              )}
              
              <button 
                className="view-profile-btn"
                onClick={() => goToProfile(user._id)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}