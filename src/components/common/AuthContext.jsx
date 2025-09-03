// src/components/common/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    cart: null,
    loading: true,
    cartLoading: false,
    login: () => {},
    logout: () => {},
    refreshCart: () => {},      // <== thêm
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    const [loading, setLoading] = useState(true);

    // Hàm fetchCart
    const fetchCart = async (accountId) => {
        setCartLoading(true);
        setCartError(null);
        try {
            const res = await fetch(`http://localhost:8080/cart/getCart/${accountId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('TOKEN')}`
                },
            });
            if (!res.ok) throw new Error('Không lấy được cart');
            const body = await res.json();   // ResponseToData<CartDTO>
            setCart(body.data);
        } catch (err) {
            console.error(err);
            setCartError(err.message || 'Lỗi khi lấy cart');
        } finally {
            setCartLoading(false);
        }
    };

    // expose hàm refreshCart để component ngoài có thể gọi
    const refreshCart = () => {
        if (user && user.id) {
            fetchCart(user.id);
        }
    };

    // 1. Khi mount, nếu có token => fetch profile
    useEffect(() => {
        const existingToken = localStorage.getItem('TOKEN');
        if (existingToken) {
            fetchProfile(existingToken);
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Hàm fetchProfile
    const fetchProfile = async (token) => {
        setIsAuthenticated(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error('Không lấy được profile');
            const body = await res.json();
            const dto  = body.data;
            // Chuyển ["ROLE_STAFF"] thành "STAFF"
            const rawRoles     = dto.roles || [];
            const normalized   = rawRoles.length
                ? rawRoles[0].replace('ROLE_', '')
                : 'USER';
            setUser({ ...dto, role: normalized });

            // sau khi có user, fetch cart
            fetchCart(dto.id);
        } catch (err) {
            console.error(err);
            localStorage.removeItem('TOKEN');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // 3. Hàm login
    const login = async (token) => {
        localStorage.setItem('TOKEN', token);
        await fetchProfile(token);

        try {
            const res = await fetch('http://localhost:8080/api/auth/me', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) throw new Error('Không lấy được profile');
            const body = await res.json();
            setUser(body.data);

            // khi login xong, fetch cart
            fetchCart(body.data.id);
        } catch (err) {
            console.error(err);
            localStorage.removeItem('TOKEN');
            setIsAuthenticated(false);
            setUser(null);
            setCart(null);
        }
    };

    // 4. Hàm logout
    const logout = () => {
        localStorage.removeItem('TOKEN');
        setIsAuthenticated(false);
        setUser(null);
        setCart(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                cart,
                loading,
                cartLoading,
                login,
                logout,
                refreshCart,    // <== expose ở đây
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
