import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function RequireAdminOrStaff({ children }) {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return null; // hoặc spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const allowedRoles = ['ROLE_ADMIN', 'ROLE_STAFF'];
    const hasAccess = user?.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
}
