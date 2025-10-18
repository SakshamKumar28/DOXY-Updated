import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

export const useAuth = (userType = 'user') => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                setError('');
                
                if (userType === 'doctor') {
                    const response = await api.get('/auth/doctor/me');
                    setUser(response.data?.data);
                } else {
                    const response = await api.get('/auth/user/profile');
                    setUser(response.data?.data);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setError('Authentication required');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [userType]);

    const logout = async () => {
        try {
            if (userType === 'doctor') {
                await api.post('/auth/doctor/logout');
            } else {
                await api.post('/auth/user/logout');
            }
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return { user, loading, error, logout };
};
