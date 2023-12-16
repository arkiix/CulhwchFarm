import axios, { InternalAxiosRequestConfig } from "axios";


export const API_URL = `${window.location.origin.toString()}/api/`;

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use(async function (config: InternalAxiosRequestConfig) {
    let password = localStorage.getItem('authorization');
    
    if (password && config.url !== 'auth/login') {
        config.headers.Authorization = password;
    };

    return config;
});

api.interceptors.response.use(undefined, async function (error: any) {
    if (error.response.status === 401) {
		localStorage.removeItem('authorization');
    } else {
        throw error;
    };
});

export default api;