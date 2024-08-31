import axios from 'axios';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const api = axios.create({
        baseURL: 'https://nwr-server.vercel.app/api',
});


api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            history.push('/login');
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export default api;