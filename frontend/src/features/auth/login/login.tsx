import { useForm } from 'react-hook-form';
import './login.css';
import { useNavigate } from "react-router-dom";
import { login } from "../../../shared/config/api";
import type { AxiosResponse, AxiosError } from "axios";

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (formData: LoginFormData) => {
    console.log('Sending login data:', formData);

    try {
      const res: AxiosResponse = await login(formData);
      console.log('Login successful:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('currentUser', JSON.stringify(res.data.user));
      
      // Reset form on successful login
      reset();
      navigate('/home');
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      const message = (error.response?.data as { message?: string })?.message ?? 'Server Error';
      alert(message);
    } finally {
      console.log('Login attempt complete');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit(onSubmit)}>
        <h2 style={{ textAlign: 'center', color: '#1d8cee', marginBottom: '1.5rem', fontSize: '2rem' }}>
          Login
        </h2>

        <div className="login-field">
          <label htmlFor="username" style={{ fontWeight: 'bold' }}>Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Username or Email"
            className={errors.username ? 'error' : ''}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              },
              maxLength: {
                value: 20,
                message: 'Username cannot exceed 20 characters'
              },
              validate: {
                notEmpty: (value) => (value && value.trim() !== '') || 'Username cannot be empty'
              }
            })}
          />
          {errors.username && (
            <span className="field-error">{errors.username.message}</span>
          )}
        </div>

        <div className="login-field">
          <label htmlFor="password" style={{ fontWeight: 'bold' }}>Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className={errors.password ? 'error' : ''}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              },
              validate: {
                notEmpty: (value) => (value && value.trim() !== '') || 'Password cannot be empty'
              }
            })}
          />
          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
        </div>

        <button 
          className="login-btn" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        <h4 style={{ textAlign: 'center', fontWeight: 'normal' }}>
          Don't have an account? <a href='/register'> Register</a>
        </h4>
      </form>
    </div>
  );
}