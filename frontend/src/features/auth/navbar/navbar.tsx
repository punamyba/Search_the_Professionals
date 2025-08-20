import { useEffect, useState } from "react";
import "./navbar.css";
import Logo from "../logo/logo";
import { Link, useNavigate } from "react-router-dom";

type CurrentUser = {
  _id: string;
  username: string;
  email: string;
}

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const eLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login')
  }

  const goToMyProfile = () => {
    if (currentUser) {
      navigate(`/profile/${currentUser._id}`);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
      <Logo />
      </div>
      
      <div className="navbar-right">
        <Link to="/home">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/contact">Contact</Link>
        
        {/* Profile Icon */}
        {currentUser && (
          <div className="navbar-profile-icon" onClick={goToMyProfile}>
            <div className="navbar-avatar">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <a onClick={eLogout}>Logout</a>
      </div>
    </nav>
  );
};

export default Navbar;