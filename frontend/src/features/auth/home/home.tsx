import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import Navbar from '../../auth/navbar/navbar';
import Footer from '../Footer/footer';
import Logo from '../logo/logo';

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
  editProfile?: EditProfile;
}

type EditProfile = {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  employmentType: string;
  expectedSalary: string;
};

export default function Home() {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
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
        const userList = data.users || [];
        setUsers(userList);
        applyFilters(userList, selectedFilter, sortBy);
        console.log('Users loaded from backend database:', userList?.length);
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
        const userList = data.users || [];
        setUsers(userList);
        applyFilters(userList, selectedFilter, sortBy);
        console.log('Backend search results:', userList?.length, 'for query:', query);
      } else {
        setError('Backend search failed');
      }
    } catch (err) {
      setError('Backend search connection failed');
    }
    
    setLoading(false);
  };

  const applyFilters = (userList: User[], filter: string, sort: string) => {
    let filtered = [...userList];

    // Apply filter based on employment type from editProfile
    if (filter === 'with-profile') {
      filtered = filtered.filter(user => user.profilePicture && user.profilePicture.url && user.profilePicture.url.trim() !== '');
    } else if (filter === 'without-profile') {
      filtered = filtered.filter(user => !user.profilePicture || !user.profilePicture.url || user.profilePicture.url.trim() === '');
    } else if (filter === 'internship') {
      filtered = filtered.filter(user => 
        user.editProfile?.employmentType?.toLowerCase().includes('intern') ||
        user.username.toLowerCase().includes('intern') || 
        user.email.toLowerCase().includes('intern')
      );
    } else if (filter === 'full-time') {
      filtered = filtered.filter(user => 
        user.editProfile?.employmentType?.toLowerCase().includes('full-time') ||
        user.editProfile?.employmentType?.toLowerCase().includes('full time') ||
        user.username.toLowerCase().includes('senior') || 
        user.username.toLowerCase().includes('lead') ||
        user.username.toLowerCase().includes('manager')
      );
    } else if (filter === 'remote') {
      filtered = filtered.filter(user => 
        user.editProfile?.employmentType?.toLowerCase().includes('remote') ||
        (user.address && user.address.toLowerCase().includes('remote')) ||
        user.username.toLowerCase().includes('remote')
      );
    } else if (filter === 'freelance') {
      filtered = filtered.filter(user => 
        user.editProfile?.employmentType?.toLowerCase().includes('freelance') ||
        user.username.toLowerCase().includes('freelance') || 
        user.username.toLowerCase().includes('consultant') ||
        user.email.toLowerCase().includes('freelance')
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sort === 'name-asc') {
        return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
      } else if (sort === 'name-desc') {
        return b.username.toLowerCase().localeCompare(a.username.toLowerCase());
      } else if (sort === 'newest') {
        return b._id.localeCompare(a._id);
      } else if (sort === 'oldest') {
        return a._id.localeCompare(b._id);
      } else if (sort === 'email-asc') {
        return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
      } else if (sort === 'most-active') {
        // You can implement this based on last login or activity data
        return b.username.length - a.username.length; // Placeholder logic
      }
      return 0;
    });

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    
    if (value.trim() === '') {
      // Reset filters when search is cleared
      setSelectedFilter('all');
      setSortBy('name-asc');
      getUsers();
    } else {
      searchUsersInBackend(value);
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    applyFilters(users, filter, sortBy);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    applyFilters(users, selectedFilter, sort);
  };

  const goToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Helper function to get employment type badge class
  const getEmploymentTypeBadgeClass = (employmentType?: string) => {
    if (!employmentType) return 'default';
    
    const type = employmentType.toLowerCase();
    if (type.includes('full-time') || type.includes('full time')) return 'full-time';
    if (type.includes('part-time') || type.includes('part time')) return 'part-time';
    if (type.includes('freelance')) return 'freelance';
    if (type.includes('intern')) return 'internship';
    if (type.includes('remote')) return 'remote';
    if (type.includes('contract')) return 'contract';
    
    return 'default';
  };

  // Helper function to format salary
  const formatSalary = (salary?: string) => {
    if (!salary) return null;
    
    // Return the salary exactly as it appears in the profile
    return salary;
  };

  return (
    <div>
      <Navbar />
      
      <div className="home-wrapper">
        <div className="home-content">
          
          <section className="hero-section">
            <h1>Welcome, {username}</h1>
            <p>Ready to discover amazing opportunities and connect with wonderful people? Let's make today productive!</p>
            
            <div className="search-container">
              <div className="search-and-filters">
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search users..."
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                
                <div className="filters-inline">
                  <div className="filter-group">
                    <label htmlFor="filter-select">Filter by:</label>
                    <select 
                      id="filter-select"
                      className="filter-select"
                      value={selectedFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="with-profile">With Profile</option>
                      <option value="remote">Remote</option>
                      <option value="full-time">Full-time</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select 
                      id="sort-select"
                      className="filter-select"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <option value="name-asc">Username (A-Z)</option>
                      <option value="name-desc">Username (Z-A)</option>
                      <option value="newest">Newest Members</option>
                      <option value="oldest">Oldest Members</option>
                      <option value="email-asc">Email (A-Z)</option>
                      <option value="most-active">Most Active</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Only show results-info when there's something to show */}
            {(loading || error || searchText || selectedFilter !== 'all') && (
              <div className="results-info">
                {loading && "Searching..."}
                {error && `Error: ${error}`}
                {!loading && !error && searchText && `${filteredUsers.length} users found for "${searchText}"`}
                {!loading && !error && !searchText && selectedFilter !== 'all' && `${filteredUsers.length} users match your filter`}
                {!loading && !error && !searchText && selectedFilter === 'all' && `Showing all ${filteredUsers.length} users`}
              </div>
            )}

            {error && (
              <button onClick={getUsers} className="retry-btn">
                Reload
              </button>
            )}
          </section>
        </div>

        <div className="user-grid">
          {loading && <div className="loading">Loading...</div>}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={getUsers}>Try Again</button>
            </div>
          )}

          {!loading && !error && filteredUsers.length === 0 && (searchText || selectedFilter !== 'all') && (
            <div className="no-results">
              <p>
                {searchText 
                  ? `No users found for "${searchText}"` 
                  : 'No users match your current filter'
                }
              </p>
            </div>
          )}

          {!loading && !error && filteredUsers.map(user => (
            <div key={user._id} className="user-card">
              
              {/* Employment Type Badge */}
              {user.editProfile?.employmentType && (
                <div className={`employment-type-badge ${getEmploymentTypeBadgeClass(user.editProfile.employmentType)}`}>
                  {user.editProfile.employmentType}
                </div>
              )}

              {/* User Header with Profile Picture and Basic Info */}
              <div className="user-card-header">
                <div className="user-card-avatar">
                  {user.profilePicture?.url ? (
                    <img 
                      src={user.profilePicture.url} 
                      alt={user.username}
                    />
                  ) : (
                    (user.editProfile?.fullName || user.username).charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="user-card-info">
                  <h3>{user.editProfile?.fullName || user.username}</h3>
                  <div className="user-email">
                    <i className="fas fa-envelope"></i>
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="user-bio">
                  {user.bio}
                </div>
              )}

              <div className="user-details">
                {/* Address */}
                {user.address && (
                  <div className="user-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {user.address}
                  </div>
                )}

                {/* Expected Salary */}
                {user.editProfile?.expectedSalary && (
                  <div className="user-salary">
                    <i className="fas fa-dollar-sign"></i>
                    {formatSalary(user.editProfile.expectedSalary)}
                  </div>
                )}
              </div>

              {/* No data message if user has minimal info */}
              {!user.bio && !user.address && !user.editProfile?.expectedSalary && (
                <div className="no-data-message">
                  User profile is not fully completed
                </div>
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
      <Footer />
    </div>
  );
}