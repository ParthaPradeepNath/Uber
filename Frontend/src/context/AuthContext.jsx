/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userApi, captainApi } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [ token, setToken ] = useState(() => localStorage.getItem('token') || null);
    const [ user, setUser ] = useState(null);
    const [ captain, setCaptain ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [ token ]);

    const loginUser = useCallback(async (email, password) => {
        const { data } = await userApi.login({ email, password });
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const registerUser = useCallback(async (data) => {
        const response = await userApi.register(data);
        setToken(response.data.token);
        setUser(response.data.user);
        return response.data.user;
    }, []);

    const loginCaptain = useCallback(async (email, password) => {
        const { data } = await captainApi.login({ email, password });
        setToken(data.token);
        setCaptain(data.captain);
        return data.captain;
    }, []);

    const registerCaptain = useCallback(async (data) => {
        const response = await captainApi.register(data);
        setToken(response.data.token);
        setCaptain(response.data.captain);
        return response.data.captain;
    }, []);

    const logout = useCallback(async (role) => {
        if (role === 'captain') {
            await captainApi.logout();
            setCaptain(null);
        } else {
            await userApi.logout();
            setUser(null);
        }
        setToken(null);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await userApi.getProfile();
            setUser(data);
        } catch {
            setToken(null);
        }
    }, [ token ]);

    useEffect(() => {
        const hydrate = async () => {
            if (token) {
                await refreshUser();
            }
            setLoading(false);
        };
        hydrate();
    }, [ token, refreshUser ]);

    const value = {
        token,
        user,
        captain,
        loading,
        loginUser,
        registerUser,
        loginCaptain,
        registerCaptain,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        isCaptain: !!captain,
        isUser: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
