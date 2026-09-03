import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, loading, user, captain } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role === 'captain' && !captain) {
        return <Navigate to="/captain-login" replace />;
    }

    if (role === 'user' && !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
