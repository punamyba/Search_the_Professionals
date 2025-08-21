import "./footer.css";
import Logo from "../logo/logo";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <Logo />
          <p className="footer-description">
            Connect talent with opportunity. Nepal's leading job portal helping you find your dream career.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>For Job Seekers</h4>
          <div className="footer-links">
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/companies">Companies</Link>
            <Link to="/salary">Salary Guide</Link>
            <Link to="/career-advice">Career Advice</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>For Employers</h4>
          <div className="footer-links">
            
            <Link to="/find-talent">Find Talent</Link>
            <Link to="/employer-resources">Resources</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Company</h4>
          <div className="footer-links">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
        
        <div className="footer-right">
          <h4>Connect With Us</h4>
          <div className="social-links">
            <a href="https://www.linkedin.com/" aria-label="LinkedIn">
              <div className="social-icon">in</div>
            </a>
            <a href="https://www.facebook.com/" aria-label="Facebook">
              <div className="social-icon">f</div>
            </a>
            <a href="https://x.com/" aria-label="Twitter">
              <div className="social-icon">t</div>
            </a>
          </div>
          <div className="newsletter">
            <p>Get job alerts</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Enter email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 JobPortal Nepal. Connecting careers across Nepal.</p>
      </div>
    </footer>
  );
};

export default Footer;