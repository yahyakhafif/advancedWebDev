import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in on component mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem('token');

                if (token) {
                    const res = await authAPI.getCurrentUser();
                    setUser(res.data);
                }
            } catch (err) {
                console.error('Auth error:', err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Register user
    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const res = await authAPI.register(userData);
            localStorage.setItem('token', res.data.token);

            // Fetch user data after registering
            const userRes = await authAPI.getCurrentUser();
            setUser(userRes.data);

            return true;
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const res = await authAPI.login(userData);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};