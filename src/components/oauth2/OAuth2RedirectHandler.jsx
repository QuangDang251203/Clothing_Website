// src/components/oauth2/OAuth2RedirectHandler.jsx
import React, { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../common/AuthContext";

export default function OAuth2RedirectHandler() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const token = params.get("token");
        if (token) {
            login(token).then(() => navigate("/", { replace: true }));
        } else {
            navigate("/login", { replace: true });
        }
    }, [search, login, navigate]);

    return <div>Đang xử lý đăng nhập...</div>;
}
