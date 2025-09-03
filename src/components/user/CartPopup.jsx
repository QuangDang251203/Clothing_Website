// src/components/common/CartPopup.jsx
import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Popup from "../common/Popup";
import { AuthContext } from "../common/AuthContext";
import VoucherSelector from "./VoucherSelector";
import CartSummary from "./CartSummary";
import "../../styles/cart-popup.css";

export default function CartPopup({ isOpen, onClose }) {
    const { user, cart, cartLoading, refreshCart } = useContext(AuthContext);
    const navigate = useNavigate();

    // 1. Chi tiết từng item trong cart (đã fetch)
    const [cartDetails, setCartDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    // 2. Voucher đã chọn
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // ====================
    // Hàm fetch chi tiết cart (bao gồm productId, price, image, …)
    // ====================
    const fetchCartDetails = useCallback(async () => {
        if (!cart || !cart.items || cart.items.length === 0) {
            setCartDetails([]);
            return;
        }
        setDetailsLoading(true);
        setDetailsError("");
        try {
            const results = await Promise.all(
                cart.items.map(async (item) => {
                    const sku = item.skuCode;
                    // 1. Lấy variant (để có price, productId, …)
                    const variantRes = await fetch(
                        `http://localhost:8080/storage/getSku/${encodeURIComponent(sku)}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                            },
                        }
                    );
                    if (!variantRes.ok) throw new Error(`Không lấy được variant cho ${sku}`);
                    const variantBody = await variantRes.json();
                    const variant = variantBody.data; // { price, productId, … }

                    // 2. Lấy product (để có productName, imageURLs, productId…)
                    const productRes = await fetch(
                        `http://localhost:8080/storage/getProductBySkuCode/${encodeURIComponent(sku)}`,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                            },
                        }
                    );
                    if (!productRes.ok) throw new Error(`Không lấy được product cho ${sku}`);
                    const productBody = await productRes.json();
                    const product = productBody.data; // { id, productName, imageURLs, … }

                    return {
                        skuCode: sku,
                        productId: product.id,
                        quantity: item.quantity,
                        price: variant.price,
                        productName: product.productName,
                        imageURL:
                            product.imageURLs && product.imageURLs.length > 0
                                ? product.imageURLs[0].url
                                : null,
                    };
                })
            );
            setCartDetails(results);
        } catch (err) {
            console.error(err);
            setDetailsError(err.message || "Lỗi khi tải chi tiết giỏ hàng.");
        } finally {
            setDetailsLoading(false);
        }
    }, [cart]);

    // Khi popup mở hoặc cart thay đổi, gọi fetchCartDetails
    useEffect(() => {
        if (isOpen) {
            fetchCartDetails();
        } else {
            // Khi đóng popup, reset state
            setCartDetails([]);
            setDetailsError("");
            setDetailsLoading(false);
        }
    }, [isOpen, cart, fetchCartDetails]);

    // ====================
    // 2. Tính cartTotal và cartProductIds
    // ====================
    const cartTotal = useMemo(() => {
        return cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cartDetails]);

    const cartProductIds = useMemo(() => {
        return cartDetails.map((item) => item.productId);
    }, [cartDetails]);

    // ====================
    // 3. Các hàm thao tác Cart: removeItem, updateItem, clearCart
    // ====================
    // 3.1. Xóa một item khỏi cart
    const handleRemoveItem = async (skuCode) => {
        if (!user || !user.id) return;
        try {
            const res = await fetch(
                `http://localhost:8080/cart/removeItem/${user.id}?skuCode=${encodeURIComponent(skuCode)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                    },
                }
            );
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Xóa item thất bại.");
            }
            // Thao tác thành công, chỉ cần gọi refreshCart()
            if (refreshCart) refreshCart();
            // Không gọi fetchCartDetails ở đây nữa, để useEffect([cart]) tự động kích hoạt
        } catch (err) {
            console.error("Lỗi khi xóa item:", err);
            alert("Xóa sản phẩm thất bại: " + err.message);
        }
    };

    // 3.2. Cập nhật số lượng item
    const handleQuantityChange = async (skuCode, newQty) => {
        if (!user || !user.id) return;
        if (newQty < 1) return; // Chỉ cho phép > 0, nếu = 0 hãy gọi remove
        try {
            const payload = {
                accountId: user.id,
                skuCode: skuCode,
                quantity: newQty,
            };
            const res = await fetch(`http://localhost:8080/cart/updateItem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Cập nhật số lượng thất bại.");
            }
            // Thao tác thành công, chỉ cần gọi refreshCart()
            if (refreshCart) refreshCart();
        } catch (err) {
            console.error("Lỗi khi cập nhật số lượng:", err);
            alert("Cập nhật số lượng thất bại: " + err.message);
        }
    };

    // 3.3. Xóa toàn bộ cart
    const handleClearCart = async () => {
        if (!user || !user.id) return;
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) return;
        try {
            const res = await fetch(`http://localhost:8080/cart/clearCart/${user.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Xóa toàn bộ giỏ hàng thất bại.");
            }
            // Thao tác thành công, chỉ cần gọi refreshCart()
            if (refreshCart) refreshCart();
        } catch (err) {
            console.error("Lỗi khi xóa toàn bộ giỏ hàng:", err);
            alert("Xóa giỏ hàng thất bại: " + err.message);
        }
    };

    // ====================
    // 4. Khi cartDetails hoặc cartTotal thay đổi, kiểm tra lại tính hợp lệ của selectedVoucher
    //    – Nếu tổng tiền < minOrderAmount → hủy voucher (setSelectedVoucher(null))
    //    – Nếu voucher chỉ áp dụng cho một số sản phẩm, kiểm tra xem có ít nhất 1 sản phẩm phù hợp trong cartDetails hay không
    // ====================
    useEffect(() => {
        if (!selectedVoucher) return;

        // 4.1. Nếu tổng tiền hiện tại nhỏ hơn minOrderAmount → hủy voucher
        if (cartTotal < Number(selectedVoucher.minOrderAmount || 0)) {
            setSelectedVoucher(null);
            return;
        }

        // 4.2. Nếu voucher chỉ áp cho một số productIds cụ thể
        if (selectedVoucher.productIdsAllowed) {
            const allowedIds = selectedVoucher.productIdsAllowed; // mảng các ID sản phẩm mà voucher áp dụng
            const foundMatch = cartDetails.some((item) =>
                allowedIds.includes(item.productId)
            );
            if (!foundMatch) {
                setSelectedVoucher(null);
                return;
            }
        }
    }, [cartDetails, cartTotal, selectedVoucher]);

    // ====================
    // 5. Xử lý khi voucher được chọn
    // ====================
    const handleApplyVoucher = (voucherObj) => {
        setSelectedVoucher(voucherObj);
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Giỏ hàng của bạn">
            <div className="cart-popup-inner">
                {cartLoading || detailsLoading ? (
                    <p className="cp-text-center">Đang tải…</p>
                ) : detailsError ? (
                    <p className="cp-text-center cp-error">Lỗi: {detailsError}</p>
                ) : cartDetails.length > 0 ? (
                    <>
                        {/* === Bảng chi tiết giỏ hàng === */}
                        <table className="cart-table">
                            <thead>
                            <tr>
                                <th>Hình Ảnh</th>
                                <th>Mã SKU</th>
                                <th>Sản Phẩm</th>
                                <th>Đơn Giá</th>
                                <th>Số Lượng</th>
                                <th>Số Tiền</th>
                                <th>Thao Tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cartDetails.map((item, idx) => {
                                const totalPrice = item.price * item.quantity;
                                return (
                                    <tr key={idx}>
                                        <td className="cell-image">
                                            {item.imageURL ? (
                                                <img
                                                    src={item.imageURL}
                                                    alt={item.productName}
                                                    className="thumb-image"
                                                />
                                            ) : (
                                                <div className="no-image">No Image</div>
                                            )}
                                        </td>
                                        <td className="cell-sku">{item.skuCode}</td>
                                        <td className="cell-name">{item.productName}</td>
                                        <td className="cell-price">
                                            {item.price.toLocaleString()} ₫
                                        </td>
                                        <td className="cell-quantity">
                                            <button
                                                className="qty-btn"
                                                onClick={() =>
                                                    handleQuantityChange(item.skuCode, item.quantity - 1)
                                                }
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() =>
                                                    handleQuantityChange(item.skuCode, item.quantity + 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </td>
                                        <td className="cell-total">
                                            {totalPrice.toLocaleString()} ₫
                                        </td>
                                        <td className="cell-action">
                                            <button
                                                className="btn-remove-item"
                                                onClick={() => handleRemoveItem(item.skuCode)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {/* Nút Xóa toàn bộ giỏ hàng */}
                        <div className="clear-cart-container">
                            <button className="btn-clear-cart" onClick={handleClearCart}>
                                Xóa toàn bộ giỏ hàng
                            </button>
                        </div>

                        {/* === PHẦN CHỌN VOUCHER === */}
                        <VoucherSelector
                            onSelect={handleApplyVoucher}
                            cartTotal={cartTotal}
                            cartProductIds={cartProductIds}
                        />

                        {/* === HIỂN THỊ voucher đã chọn (nếu có) === */}
                        {selectedVoucher && (
                            <div className="applied-voucher-info">
                                <strong>Mã voucher:</strong>{" "}
                                <span>{selectedVoucher.voucherCode}</span> |{" "}
                                <strong>Giá trị:</strong>{" "}
                                <span>
                  {selectedVoucher.isPercentage
                      ? `Giảm ${selectedVoucher.voucherValue}%`
                      : `Giảm ₫${Number(
                          selectedVoucher.voucherValue
                      ).toLocaleString()}`}
                </span>
                            </div>
                        )}

                        {/* === PHẦN TỔNG CỘNG VÀ NÚT MUA HÀNG === */}
                        <CartSummary
                            cartDetails={cartDetails}
                            voucher={selectedVoucher}
                            onCheckout={() => {
                                navigate("/checkout");
                            }}
                        />
                    </>
                ) : (
                    <p className="cp-text-center">Giỏ hàng trống.</p>
                )}
            </div>
        </Popup>
    );
}
