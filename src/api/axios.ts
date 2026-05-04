import axios from "axios";
import { getAdminToken } from "../utils/adminAuth";

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = getAdminToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
