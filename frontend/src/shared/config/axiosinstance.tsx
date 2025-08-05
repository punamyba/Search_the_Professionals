import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
   // withCredentials: true,

});

// Request Intercepter

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
            if(token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    
);


// Response Interceptor
// response aayo if it is right send it back as it is , if error send alert to user 
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            alert("Unauthorized! Please login again.");
            localStorage.clear();
            setTimeout(() =>{
                window.location.href = "/";
            },1500);        
        }
        return Promise.reject(error);
    }
);

export default axiosInstance