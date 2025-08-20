import { useState } from 'react';
import './register.css';
import { useNavigate } from 'react-router-dom';
import { type RegisterFormData, registerApi } from '../../../shared/config/api';
import { useForm } from 'react-hook-form';

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      bio: ''
    }
  });

  // Watch bio field for character count
  const bioValue = watch('bio') || '';

  const onSubmit = async (formData: RegisterFormData) => {
    setError('');

    try {
      // Clean the payload by removing empty strings (optional fields)
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value && value.trim() !== '')
      ) as RegisterFormData;

      console.log('Register Data:', payload);
      await registerApi(payload);
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (err) {
      const errorResponse = (err as any)?.response;
      console.error('Register Error Response:', errorResponse?.data || errorResponse);
      setError(errorResponse?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-card" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="register-title">Register</h2>

        <div className="register-field">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            className={errors.username ? 'error' : ''}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters'
              },
              maxLength: {
                value: 30,
                message: 'Username cannot exceed 30 characters'
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

        <div className="register-field">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            className={errors.email ? 'error' : ''}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Please enter a valid email'
              },
              validate: {
                notEmpty: (value) => (value && value.trim() !== '') || 'Email cannot be empty'
              }
            })}
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
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

        <div className="register-field">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="text"
            id="phone"
            className={errors.phone ? 'error' : ''}
            placeholder="Enter your contact number"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^\d{7,15}$/,
                message: 'Phone number must be 7-15 digits only'
              },
              validate: {
                notEmpty: (value) => (value && value.trim() !== '') || 'Phone number cannot be empty'
              }
            })}
          />
          {errors.phone && (
            <span className="field-error">{errors.phone.message}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            className={errors.address ? 'error' : ''}
            {...register('address', {
              required: 'Address is required',
              validate: {
                notEmpty: (value) => (value && value.trim() !== '') || 'Address cannot be empty'
              }
            })}
          />
          {errors.address && (
            <span className="field-error">{errors.address.message}</span>
          )}
        </div>

        <div className="register-field">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            rows={3}
            className={errors.bio ? 'error' : ''}
            placeholder="Tell us about yourself (optional)"
            {...register('bio', {
              maxLength: {
                value: 500,
                message: 'Bio must be under 500 characters'
              }
            })}
          />
          {errors.bio && (
            <span className="field-error">{errors.bio.message}</span>
          )}
          <small className="char-count">{bioValue.length}/500 characters</small>
        </div>

        <button className="register-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Register'}
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