import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from '../../auth/navbar/navbar';


type User = {
  _id: string;
  username: string;
  email: string;
  address?: string | null;
  profilePicture?: {    // Yo line add gara
    url?: string;
    public_id?: string;
  };
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
        console.log(' Users loaded from backend database:', data.users?.length);
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
        console.log(' Backend search results:', data.users?.length, 'for query:', query);
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
            <h1>Welcome , {username} </h1>
            <p>Ready to discover amazing opportunities and connect with wonderful people? Let's make today productive!</p>

            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Only show results-info when there's something to show */}
            {(loading || error || searchText) && (
              <div className="results-info">
                {loading && "Searching..."}
                {error && `Error: ${error}`}
                {!loading && !error && searchText && `${users.length} users found for "${searchText}"`}
              </div>
            )}

            {error && (
              <button onClick={getUsers} className="retry-btn">
                Reload
              </button>
            )}
          </section>

          {/* Only showing features section when NOT searching */}
          {!searchText && (
            <section className="features">
              <div className="feature-card">
                <h3> Job Listings</h3>
                <p>Browse jobs tailored to your skills and interests.</p>
              </div>
              <div className="feature-card">
                <h3> Update Your Profile</h3>
                <p>Build a standout profile to attract top employers.</p>
                
              </div>
              <div className="feature-card">
                <h3> Post a Job</h3>
                <p>Looking to hire? Post jobs and find the right talent.</p>
              </div>
            </section>
          )}
        </div>

        <div className="user-grid">
          {loading && <div>Loading...</div>}
          
          {error && (
            <div className="error-message">
              <p> {error}</p>
              <button onClick={getUsers}>Try Again</button>
            </div>
          )}

          {!loading && !error && users.length === 0 && searchText && (
            <div className="no-results">
              <p>No users found for "{searchText}"</p>
            </div>
          )}

          {!loading && !error && users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-avatar">
                {user.profilePicture?.url ? (
                  <img 
                    src={user.profilePicture.url} 
                    alt={user.username}
                    style={{
                       width: '80px',
                       height: '80px',
                       borderRadius: '50%',
                       objectFit: 'cover'
                      }}
                   />
                ) : (
               user.username.charAt(0).toUpperCase()
             )}
            </div>
              
              <h3>{user.username}</h3>
              <p className="user-email">{user.email}</p>
              
              {user.address && (
                <p className="user-address"> {user.address}</p>
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