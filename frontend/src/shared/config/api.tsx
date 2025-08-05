
import axios from "axios";
import axiosInstance from "./axiosinstance";



export const login = (data: {username: string, password: string }) =>{
    return axios.post('http://localhost:3000/api/auth/login',data)
} 

export const registerApi = (data: {  username: string, email: string, password: string}) =>{
    return axiosInstance.post('/auth/register', data);
};

export const getUserListApi = () =>{
    return axiosInstance.get('/user/list');
};

