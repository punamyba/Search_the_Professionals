import { useState } from 'react';
import './register.css';
import { useNavigate } from 'react-router-dom';
import { registerApi } from '../../../shared/config/api';

function Register() {
  const [form, setFormData] = useState({username: '', email: '', password: ''});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Register Data:', form);
      await registerApi(form);
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (err) {
      const errorResponse = (err as any)?.response;
      console.error('Register Error Response:', errorResponse);
      console.error('Backend message:', errorResponse?.data);
    
      setError(errorResponse?.data?.message || 'Registration failed');
    }
    finally {
      
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', color: '#31858b', marginBottom: '1.5rem', fontSize: '2rem' }}>
          Register
        </h2>

        <div className="register-field">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="register-btn" type="submit">Register</button>
        {error && <div className="register-error">{error}</div>}
        
        <h4 style={{ textAlign: 'center', fontWeight: 'normal' }}>
          Already have an account? <a href="/">Login</a>
        </h4>
      </form>
    </div>
  );
}

export default Register;
