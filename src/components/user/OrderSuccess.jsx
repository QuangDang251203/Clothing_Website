// src/pages/OrderSuccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
    const navigate = useNavigate();
    return (
        <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>🎉 Đặt Hàng Thành Công!</h2>
            <p>Cảm ơn bạn đã mua hàng. Chúng tôi sẽ giao nhanh chóng nhất có thể.</p>
            <button onClick={() => navigate("/")}>Quay về trang chủ</button>
        </div>
    );
}
