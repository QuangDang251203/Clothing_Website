// src/components/common/RequireAdmin.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function RequireAdmin({ children }) {
    const { isAuthenticated, user, loading } = useContext(AuthContext);
    const location = useLocation();

    // 1. Nếu đang khởi tạo (fetchProfile hoặc check token), cứ render null (hoặc spinner) để không redirect vội
    if (loading) {
        return null; // hoặc <div>Loading...</div> nếu bạn muốn hiển thị spinner
    }

    // 2. Nếu không login (sau khi loading xong) → redirect đến /login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Nếu đã login nhưng không có ROLE_ADMIN → redirect về "/"
    if (!user?.roles?.includes('ROLE_ADMIN')) {
        return <Navigate to="/" replace />;
    }

    // 4. Nếu đã login và có ROLE_ADMIN → render admin layout
    return children;
}
