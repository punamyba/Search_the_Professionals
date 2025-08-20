import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import './contact.css';
import Navbar from '../../auth/navbar/navbar';

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    mode: 'onChange'
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Form Data:', data);
      
      // Reset form and show success
      reset();
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      
      <div className="contact-wrapper">
        <div className="contact-content">
          
          {/* Hero Section */}
          <section className="contact-hero">
            <h1>Get in Touch</h1>
            <p>Have a question or want to work together? We'd love to hear from you!</p>
          </section>

          <div className="contact-main">
            
            {/* Contact Form */}
            <div className="contact-form-container">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              {success && (
                <div className="success-message">
                  <p>✓ Message sent successfully! We'll get back to you soon.</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter your full name"
                      {...register('name', {
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        },
                        pattern: {
                          value: /^[A-Za-z\s]+$/,
                          message: 'Name should only contain letters and spaces'
                        }
                      })}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name.message}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    placeholder="What's this about?"
                    {...register('subject', {
                      maxLength: {
                        value: 100,
                        message: 'Subject should not exceed 100 characters'
                      }
                    })}
                    className={errors.subject ? 'error' : ''}
                  />
                  {errors.subject && <span className="error-text">{errors.subject.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters'
                      },
                      maxLength: {
                        value: 500,
                        message: 'Message should not exceed 500 characters'
                      }
                    })}
                    className={errors.message ? 'error' : ''}
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message.message}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>Address</h3>
                <p>Kathmandu, Bagmati Province<br />Nepal</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>Email</h3>
                <p>contact@yoursite.com<br />support@yoursite.com</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <h3>Phone</h3>
                <p>+977 98XXXXXXXX<br />Available 24/7</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3>Working Hours</h3>
                <p>Monday - Friday: 9AM - 6PM<br />Saturday: 10AM - 4PM</p>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="back-home">
            <button onClick={() => navigate('/')} className="back-home-btn">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}