import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function VnPayReturnPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(true);
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const paramsString = window.location.search;

        fetch(`http://localhost:8080/orders/vnpay/callback${paramsString}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || "Xác nhận thanh toán thất bại");
                }
                return res.json();
            })
            .then((body) => {
                const id = body.data;
                if (!id) {
                    setNotification("Thanh toán không thành công");
                    // sau 3s tự chuyển về trang chủ
                    setTimeout(() => navigate("/"), 2000);
                    return;
                }
                navigate(`/order/${id}`);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || "Lỗi khi xử lý callback thanh toán");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    // CSS inline style cho notification
    const styles = {
        notification: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            backgroundColor: '#f44336',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
        },
        errorText: {
            color: '#f44336',
            textAlign: 'center',
            marginTop: '20px'
        },
        loadingText: {
            textAlign: 'center',
            marginTop: '20px'
        }
    };

    if (loading) {
        return <p style={styles.loadingText}>Đang xử lý xác nhận thanh toán VNPay…</p>;
    }

    return (
        <>
            {notification && (
                <div style={styles.notification}>
                    {notification}
                </div>
            )}
            {error && <p style={styles.errorText}>Lỗi: {error}</p>}
        </>
    );
}
