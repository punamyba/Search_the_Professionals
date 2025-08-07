import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',  // Adjust to your backend URL/port
  headers: {
    'Content-Type': 'application/json',
  },
});

export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  jobCategory?: string;
  interests?: string;
  bio?: string;
};

export const registerApi = (data: RegisterFormData) => {
  return axiosInstance.post('/api/auth/register', data);
};

export const login = (data: { username: string; password: string }) => {
  return axiosInstance.post('/api/auth/login', data);
};

export const getUserListApi = () => {
  return axiosInstance.get('/user/list');
};