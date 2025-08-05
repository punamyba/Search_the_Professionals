
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const eLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      navigate('/login')
    }
  



  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">ItsPunam</span>
      </div>

      

      <div className="navbar-right">
        <Link to="/home">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/contact">Contact</Link>
        <a onClick={eLogout}>Logout</a>
      </div>
    </nav>
  );
};

export default Navbar;
