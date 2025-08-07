import { useState } from 'react';
import './register.css';
import { useNavigate } from 'react-router-dom';
import { type RegisterFormData, registerApi } from '../../../shared/config/api';

function Register() {
  const [form, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    jobCategory: '',
    interests: '',
    bio: ''
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean the payload by removing empty strings (optional fields)
      const payload = Object.fromEntries(
        Object.entries(form).filter(([_, value]) => value.trim() !== '')
      ) as RegisterFormData;

      console.log('Register Data:', payload);
      await registerApi(payload);
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (err) {
      const errorResponse = (err as any)?.response;
      console.error('Register Error Response:', errorResponse?.data || errorResponse);
      setError(errorResponse?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2 className="register-title">Register</h2>

        <div className="register-field">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="register-field">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div className="register-field">
          <label htmlFor="jobCategory">Job Category:</label>
          <select
            name="jobCategory"
            id="jobCategory"
            value={form.jobCategory}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <div className="register-field">
          <label htmlFor="interests">Interests (comma separated):</label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={form.interests}
            onChange={handleChange}
          />
        </div>

        <div className="register-field">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <button className="register-btn" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <div className="register-error">{error}</div>}

        <p className="register-login-link">
          Already have an account? <a href="/">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
