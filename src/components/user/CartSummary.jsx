// src/components/common/CartSummary.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/cart-summary.css";

export default function CartSummary({ cartDetails, voucher, onCheckout }) {
    const navigate = useNavigate();

    // Tính rawTotal = tổng tiền trước khi giảm
    const rawTotal = useMemo(() => {
        return cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cartDetails]);

    // Tính discount = số tiền được giảm (dựa vào voucher nếu có)
    const discount = useMemo(() => {
        if (!voucher) return 0;

        const total = rawTotal;
        const minOrder = Number(voucher.minOrderAmount || 0);

        // Nếu tổng chưa đạt minOrderAmount, không giảm
        if (total < minOrder) return 0;

        let disc = 0;
        // Nếu voucher tính phần trăm
        if (voucher.isPercentage) {
            // voucher.voucherValue là số phần trăm, ví dụ 10 = 10%
            disc = total * (Number(voucher.voucherValue) / 100);
        } else {
            // voucher.voucherValue là số tiền cố định
            disc = Number(voucher.voucherValue);
        }
        // Không giảm quá maxDiscountAmount
        const maxDisc = Number(voucher.maxDiscountAmount || 0);
        disc = Math.min(disc, maxDisc);
        // Không cho lùi âm
        if (disc < 0) disc = 0;
        return Math.round(disc); // có thể làm tròn số
    }, [rawTotal, voucher]);

    // Tính finalTotal = số tiền sau khi giảm
    const finalTotal = useMemo(() => {
        const t = rawTotal - discount;
        return t < 0 ? 0 : t;
    }, [rawTotal, discount]);

    // Khi nhấn “Mua Hàng”, đưa sang trang /checkout kèm voucherCode (nếu có)
    const handleCheckout = () => {
        const voucherCode = voucher ? voucher.voucherCode : "";
        navigate("/checkout", {
            state: {
                voucherCode,
                rawTotal,
                discount,
                finalTotal,
            },
        });
    };

    return (
        <div className="cart-summary-container">
            <div className="summary-lines">
                {/* Hiển thị Raw Total */}
                <div className="summary-line">
                    <span className="summary-label">Tổng tiền (chưa giảm):</span>
                    <span className="summary-value">
            {rawTotal.toLocaleString()} ₫
          </span>
                </div>

                {/* Nếu có discount > 0, hiển thị dòng giảm giá */}
                {discount > 0 && (
                    <div className="summary-line discount-line">
                        <span className="summary-label">Giảm:</span>
                        <span className="summary-value discount-value">
              -{discount.toLocaleString()} ₫
            </span>
                    </div>
                )}

                {/* Hiển thị Tổng phải trả */}
                <div className="summary-line final-line">
                    <span className="summary-label">Tổng phải trả:</span>
                    <span className="summary-value final-value">
            {finalTotal.toLocaleString()} ₫
          </span>
                </div>
            </div>

            <button className="btn-buy-now" onClick={handleCheckout}>
                Mua Hàng
            </button>
        </div>
    );
}
