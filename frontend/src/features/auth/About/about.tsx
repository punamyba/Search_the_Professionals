import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../auth/navbar/navbar';
import Footer from '../Footer/footer';
import './about.css';

export default function About() {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/contact');
  };

  return (
    <div>
      <Navbar />
      
      <div className="about-wrapper">
        <div className="about-container">
          
          {/* Hero Section */}
          <section className="about-hero">
            <h1>Our Story</h1>
            <p>Connecting talent with opportunity through innovation and dedication</p>
          </section>

          {/* Main Content */}
          <div className="about-content">
            
            {/* The Story - Mission & Values */}
            <section className="about-section story-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-book-open"></i>
                </div>
                <h2>The Story</h2>
                <p className="section-subtitle">What do we believe?</p>
              </div>
              <div className="story-content">
                <p>
                  We believe that every professional deserves to be discovered for their unique talents. 
                  In a world where opportunities often depend on connections, we're committed to creating 
                  a platform where merit and skill take center stage.
                </p>
                <p>
                  Our platform represents more than just a directory - it's a movement toward fair and 
                  transparent professional discovery. We understand that behind every profile is a person 
                  with dreams, aspirations, and the skills to make a difference. That's why we've built 
                  our platform with careful attention to showcasing not just what professionals do, but 
                  who they are and what drives their passion for excellence.
                </p>
                <p>
                  We're dedicated to breaking down barriers that traditionally limit professional opportunities. 
                  Whether you're a seasoned expert or an emerging talent, our platform provides equal visibility 
                  and access to meaningful connections.
                </p>
                <div className="values-list">
                  <div className="value-point">
                    <i className="fas fa-check-circle"></i>
                    <span>Excellence in professional representation</span>
                  </div>
                  <div className="value-point">
                    <i className="fas fa-check-circle"></i>
                    <span>Transparent and accessible talent discovery</span>
                  </div>
                  <div className="value-point">
                    <i className="fas fa-check-circle"></i>
                    <span>Quality connections that drive success</span>
                  </div>
                  <div className="value-point">
                    <i className="fas fa-check-circle"></i>
                    <span>Equal opportunity for all skill levels</span>
                  </div>
                </div>
              </div>
            </section>

            {/* The Characters - Team */}
            <section className="about-section characters-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h2>The Characters</h2>
                <p className="section-subtitle">Who is behind this platform?</p>
              </div>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-avatar">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <h4>Development Team</h4>
                  <p>Experienced engineers building robust, scalable solutions with modern technologies and best practices</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h4>Product Visionaries</h4>
                  <p>Design thinkers and strategists focused on creating intuitive user experiences that solve real problems</p>
                </div>
                <div className="team-member">
                  <div className="member-avatar">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h4>Community Managers</h4>
                  <p>Dedicated professionals committed to fostering growth, connections, and success within our platform</p>
                </div>
              </div>
              <div className="team-description">
                <p>
                  Our team brings together diverse expertise from technology, design, and business backgrounds. 
                  We're united by a shared passion for solving complex problems and creating meaningful impact 
                  in the professional world. Each team member contributes unique perspectives that help us 
                  build a platform that truly serves both professionals and those seeking talent.
                </p>
                <p>
                  We believe in continuous learning, collaborative innovation, and maintaining the highest 
                  standards of quality in everything we build. Our team culture emphasizes transparency, 
                  creativity, and a genuine commitment to our users' success.
                </p>
              </div>
            </section>

            {/* The Conflict - Problem */}
            <section className="about-section conflict-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2>The Conflict</h2>
                <p className="section-subtitle">Why did we start this platform?</p>
              </div>
              <div className="conflict-content">
                <p>
                  Traditional hiring processes are broken. Talented professionals get overlooked while 
                  companies struggle to find the right people. The disconnect between skill and opportunity 
                  costs everyone - professionals miss out on ideal roles, and businesses lose access to 
                  exceptional talent.
                </p>
                <p>
                  We witnessed countless stories of brilliant minds going unnoticed because they lacked 
                  the right connections or didn't fit into conventional hiring frameworks. Meanwhile, 
                  organizations spent months searching for talent that was right under their noses, 
                  hidden in the maze of traditional recruitment methods.
                </p>
                <p>
                  The old system favored those with extensive networks over those with exceptional skills. 
                  Geographic limitations meant local talent pools were often the only option, regardless 
                  of whether they were the best fit. This inefficiency frustrated both sides of the 
                  equation and inspired us to create a better solution.
                </p>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>The Challenge</h4>
                    <p>Inefficient talent discovery methods limiting opportunities for both sides, creating barriers that prevented the best matches from happening naturally</p>
                  </div>
                </div>
              </div>
            </section>

            {/* The Resolution - Solution */}
            <section className="about-section resolution-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h2>The Resolution</h2>
                <p className="section-subtitle">What problem do we solve? How?</p>
              </div>
              <div className="solution-grid">
                <div className="solution-item">
                  <h4>Comprehensive Profiles</h4>
                  <p>Detailed professional showcases that highlight skills, experience, and achievements</p>
                </div>
                <div className="solution-item">
                  <h4>Smart Search Technology</h4>
                  <p>Advanced filtering and matching algorithms that connect the right talent with opportunities</p>
                </div>
                <div className="solution-item">
                  <h4>Quality Verification</h4>
                  <p>Verified professional information ensuring trust and reliability</p>
                </div>
              </div>
            </section>

            {/* The Sequel - Future Vision */}
            <section className="about-section sequel-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <h2>The Sequel</h2>
                <p className="section-subtitle">What is our vision for the future?</p>
              </div>
              <div className="vision-content">
                <p>
                  We envision a future where professional discovery is seamless, where talent is recognized 
                  regardless of background, and where the best matches happen naturally through intelligent 
                  technology and comprehensive data.
                </p>
                <p>
                  Our roadmap includes expanding into new markets, developing AI-powered matching algorithms, 
                  and creating industry-specific professional communities. We're building toward a world 
                  where geographical boundaries don't limit opportunity, where skills matter more than 
                  credentials, and where every professional has the chance to showcase their unique value.
                </p>
                <p>
                  The future we're building isn't just about technology - it's about creating a more 
                  equitable professional landscape. We're working on features that will help professionals 
                  grow their skills, connect with mentors, and access opportunities that align with their 
                  career aspirations.
                </p>
                <div className="vision-points">
                  <div className="vision-point">
                    <i className="fas fa-globe"></i>
                    <span>Global talent accessibility</span>
                  </div>
                  <div className="vision-point">
                    <i className="fas fa-chart-line"></i>
                    <span>Continuous platform evolution</span>
                  </div>
                  <div className="vision-point">
                    <i className="fas fa-brain"></i>
                    <span>AI-powered intelligent matching</span>
                  </div>
                  <div className="vision-point">
                    <i className="fas fa-users-cog"></i>
                    <span>Professional development tools</span>
                  </div>
                </div>
              </div>
            </section>

            {/* The Setting - Where we operate */}
            <section className="about-section setting-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h2>The Setting</h2>
                <p className="section-subtitle">Where does this story unfold?</p>
              </div>
              <div className="location-info">
                <div className="location-item">
                  <i className="fas fa-building"></i>
                  <div>
                    <h4>Digital First</h4>
                    <p>Operating in the digital space, connecting professionals globally</p>
                  </div>
                </div>
                <div className="location-item">
                  <i className="fas fa-heart"></i>
                  <div>
                    <h4>Based in Nepal</h4>
                    <p>Proudly built and operated from Kathmandu, with a global perspective</p>
                  </div>
                </div>
              </div>
            </section>

            {/* The Credits - Contact & CTA */}
            <section className="about-section credits-section">
              <div className="section-header">
                <div className="story-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h2>The Credits</h2>
                <p className="section-subtitle">How can you get in touch?</p>
              </div>
              <div className="credits-content">
                <p>
                  Ready to be part of our story? Whether you're a professional looking to showcase 
                  your talents or seeking exceptional talent for your projects, we're here to help 
                  write your next chapter.
                </p>
                <p>
                  We're constantly evolving and improving our platform based on user feedback and 
                  industry needs. Your input helps us create better tools, more intuitive features, 
                  and stronger connections within our professional community.
                </p>
                <p>
                  Join thousands of professionals who have already discovered new opportunities through 
                  our platform. From freelance projects to full-time positions, from local collaborations 
                  to global partnerships - your next professional breakthrough might be just a click away.
                </p>
                <div className="contact-actions">
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>hello@professionals.com</span>
                  </div>
                  <div className="cta-button">
                    <button className="primary-cta" onClick={handleStartJourney}>Start Your Journey</button>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}