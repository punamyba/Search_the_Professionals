import { useState, type ChangeEvent, type FormEvent } from "react";
import './login.css';
import { useNavigate } from "react-router-dom";
import { login } from "../../../shared/config/api";
import type { AxiosResponse, AxiosError } from "axios";

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(formData).then((res: AxiosResponse) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
      navigate('/home');
    }).catch((error: AxiosError) => {
      const message = (error.response?.data as { message?: string })?.message ?? 'Server Error';
      alert(message);
    }).finally(() => {
      console.log('Okay');
    });
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', color: '#1d8cee', marginBottom: '1.5rem', fontSize: '2rem' }}>
          Login
        </h2>

        <div className="login-field">
          <label htmlFor="username" style={{ fontWeight: 'bold' }}>Username:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="password" style={{ fontWeight: 'bold' }}>Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="login-btn" type="submit">
          Sign In
        </button>

        <h4 style={{ textAlign: 'center', fontWeight: 'normal' }}>
          Don't have an account? <a href='/register'> Register</a>
        </h4>
      </form>
    </div>
  );
}
