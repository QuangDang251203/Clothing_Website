// src/pages/CheckoutForm.jsx

import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../common/AuthContext";
import ShippingAddressPopup from "../user/ShippingAddressPopup";
import "../../styles/checkout-form.css"; // bạn tự định nghĩa style

export default function CheckoutForm() {
    const { user, refreshCart } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông số từ CartSummary (rawTotal, discount, finalTotal, voucherCode)
    // Giả sử bạn đã làm bên CartSummary gửi state qua navigate("/checkout", { state: { ... } })
    const {
        rawTotal = 0,
        discount = 0,
        finalTotal = 0,
        voucherCode = ""
    } = location.state || {};

    // === 1. Quản lý danh sách địa chỉ và popup thêm địa chỉ ===
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [addressesError, setAddressesError] = useState("");
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddressListOpen, setIsAddressListOpen] = useState(false);
    const [isAddressPopupOpen, setIsAddressPopupOpen] = useState(false);

    const [hasFetchedAddresses, setHasFetchedAddresses] = useState(false);
    // Fetch địa chỉ khi component mount hoặc user thay đổi
    useEffect(() => {
        if (!user || !user.id) return;
        setLoadingAddresses(true);
        fetch(`http://localhost:8080/shippingAddress/getByAccountId/${user.id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Không tải được địa chỉ");
                return res.json();
            })
            .then(data => {
                setAddresses(data);
                if (Array.isArray(data) && data.length > 0 && !selectedAddressId) {
                    // Mặc định chọn địa chỉ đầu tiên
                    setSelectedAddressId(data[0].id);
                }
            })
            .catch(err => {
                console.error(err);
                setAddressesError(err.message || "Lỗi khi lấy địa chỉ");
                setAddresses([]);
            })
            .finally(() => {
                setLoadingAddresses(false);
                setHasFetchedAddresses(true);
            });
    }, [user]);

    // Nếu không có địa chỉ nào, ép mở popup thêm địa chỉ
    useEffect(() => {
        if (hasFetchedAddresses && !loadingAddresses && addresses && addresses.length === 0) {
            alert("Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ trước khi đặt hàng.");
            setIsAddressPopupOpen(true);
        }
    }, [hasFetchedAddresses, loadingAddresses, addresses]);

    // Khi đóng popup thêm địa chỉ, refetch và chọn địa chỉ vừa thêm
    const handleCloseAddressPopup = () => {
        setIsAddressPopupOpen(false);
        if (!user || !user.id) return;
        fetch(`http://localhost:8080/shippingAddress/getByAccountId/${user.id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Không tải được địa chỉ");
                return res.json();
            })
            .then(data => {
                setAddresses(data);
                if (Array.isArray(data) && data.length > 0) {
                    setSelectedAddressId(data[data.length - 1].id);
                }
            })
            .catch(err => {
                console.error(err);
                setAddressesError(err.message || "Lỗi khi lấy địa chỉ");
            });
    };

    // === 2. Quản lý phương thức thanh toán ===
    // 1 = COD; 2 = VNPay
    const [paymentMethod, setPaymentMethod] = useState(1);

    // === 3. Quản lý “Đặt hàng” ===
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState("");

    const handlePlaceOrder = () => {
        setOrderError("");
        if (!selectedAddressId) {
            alert("Vui lòng chọn địa chỉ giao hàng!");
            return;
        }
        setPlacingOrder(true);

        // Gọi API checkout: thêm &paymentMethod=${paymentMethod}
        fetch(
            `http://localhost:8080/orders/checkout?` +
            `accountId=${user.id}` +
            `&shippingAddressId=${selectedAddressId}` +
            `&voucherCode=${encodeURIComponent(voucherCode)}` +
            `&paymentMethod=${paymentMethod}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`
                }
            }
        )
            .then(async res => {
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || "Đặt hàng thất bại");
                }
                return res.json();
            })
            .then(body => {
                // Với paymentMethod = 2 (VNPay), backend trả về PaymentResDTO (data.url)
                if (paymentMethod === 2 || paymentMethod === 3) {
                    const paymentRes = body.data;
                    const paymentUrl = paymentRes.url;
                    if (paymentUrl) {
                        window.location.href = paymentUrl;
                        return;
                    }
                    navigate("/");
                    return;
                }

                // Với paymentMethod = 1 (COD), backend trả về OrdersDTO
                const createdOrder = body.data;
                const orderId = createdOrder.id;
                if (!orderId) {
                    navigate("/");
                    return;
                }
                // refresh cart rồi điều hướng sang trang xem chi tiết
                if (refreshCart) refreshCart();
                navigate(`/order/${orderId}`);
            })
            .catch(err => {
                console.error(err);
                if (paymentMethod === 2) {
                    // KHÔNG alert ở đây nữa
                    navigate("/");
                } else {
                    setOrderError(err.message || "Lỗi khi tạo đơn hàng.");
                }
            })
            .finally(() => {
                setPlacingOrder(false);
            });
    };

    return (
        <div className="checkout-form-container">
            <h2>Thanh Toán Đơn Hàng</h2>

            {/* 1. Card hiển thị địa chỉ chính (mặc định chọn đầu) */}
            {!loadingAddresses && !addressesError && addresses.length > 0 && (
                <div className="shipping-summary-card">
                    <div className="shipping-header">
                        <span className="shipping-icon">📍</span>
                        <span className="shipping-label">Địa Chỉ Nhận Hàng</span>
                        <button
                            className="change-address-btn"
                            onClick={() => setIsAddressListOpen(prev => !prev)}
                        >
                            Thay Đổi
                        </button>
                    </div>
                    <div className="shipping-info">
                        {addresses
                            .filter(addr => addr.id === selectedAddressId)
                            .map(addr => (
                                <React.Fragment key={addr.id}>
                                    <p>
                                        <strong>{addr.consigneeName}</strong> ({addr.mobile})
                                    </p>
                                    <p>{addr.address}</p>
                                </React.Fragment>
                            ))}
                    </div>
                </div>
            )}

            {/* 2. Bảng chọn lại địa chỉ (dạng dropdown) */}
            {!loadingAddresses &&
                !addressesError &&
                addresses.length > 0 &&
                isAddressListOpen && (
                    <div className="address-list-panel">
                        <ul className="address-list">
                            {addresses.map(addr => (
                                <li key={addr.id} className="address-item">
                                    <label>
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => {
                                                setSelectedAddressId(addr.id);
                                                setIsAddressListOpen(false);
                                            }}
                                        />
                                        <div className="address-details">
                                            <p>
                                                <strong>{addr.consigneeName}</strong> – {addr.mobile}
                                            </p>
                                            <p>{addr.address}</p>
                                        </div>
                                    </label>
                                </li>
                            ))}
                        </ul>
                        <div className="add-address-section">
                            <button
                                className="btn-add-address"
                                onClick={() => {
                                    setIsAddressPopupOpen(true);
                                    setIsAddressListOpen(false);
                                }}
                            >
                                + Thêm địa chỉ mới
                            </button>
                        </div>
                    </div>
                )}

            {/* 3. Hiển thị tóm tắt đơn hàng (tổng tiền, giảm, phí) */}
            <div className="order-summary-card">
                <div className="order-line">
                    <span className="label">Tổng tiền hàng:</span>
                    <span className="value">{rawTotal.toLocaleString()} ₫</span>
                </div>
                {discount > 0 && (
                    <div className="order-line discount-line">
                        <span className="label">Giảm voucher:</span>
                        <span className="value discount-value">
              -{discount.toLocaleString()} ₫
            </span>
                    </div>
                )}
                <div className="order-line final-line">
                    <span className="label">Tổng phải trả:</span>
                    <span className="value final-value">
            {finalTotal.toLocaleString()} ₫
          </span>
                </div>
            </div>

            {/* 4. Chọn phương thức thanh toán */}
            {!loadingAddresses &&
                !addressesError &&
                addresses.length > 0 && (
                    <section className="payment-method-section">
                        <h3>Phương Thức Thanh Toán</h3>
                        <label className="payment-item">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={1}
                                checked={paymentMethod === 1}
                                onChange={() => setPaymentMethod(1)}
                            />
                            <span>Thanh toán khi nhận hàng (COD)</span>
                        </label>
                        <label className="payment-item">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={2}
                                checked={paymentMethod === 2}
                                onChange={() => setPaymentMethod(2)}
                            />
                            <span>Thanh toán qua VNPay</span>
                        </label>
                        <label className="payment-item">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={3}
                                checked={paymentMethod === 3}
                                onChange={() => setPaymentMethod(3)}
                            />
                            <span>Thanh toán qua ZaloPay</span>
                        </label>
                    </section>
                )}

            {/* 5. Hiển thị lỗi (nếu có) */}
            {orderError && <p className="error-text">Lỗi: {orderError}</p>}

            {/* 6. Nút “Đặt hàng” */}
            {!loadingAddresses &&
                !addressesError &&
                addresses.length > 0 && (
                    <div className="place-order-section">
                        <button
                            className="btn-place-order"
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                        >
                            {placingOrder ? "Đang xử lý…" : "Đặt hàng"}
                        </button>
                    </div>
                )}

            {/* 7. Popup thêm địa chỉ */}
            {isAddressPopupOpen && (
                <ShippingAddressPopup
                    isOpen={isAddressPopupOpen}
                    onClose={handleCloseAddressPopup}
                />
            )}
        </div>
    );
}
