// src/components/common/VoucherSelector.jsx
import React, { useState } from "react";
import VoucherPopup from "./VoucherPopup";
import "../../styles/voucher-selector.css";

export default function VoucherSelector({
                                            onSelect,
                                            cartTotal,
                                            cartProductIds,
                                        }) {
    const [isVoucherPopupOpen, setIsVoucherPopupOpen] = useState(false);

    const handleOpenPopup = () => {
        setIsVoucherPopupOpen(true);
    };
    const handleClosePopup = () => {
        setIsVoucherPopupOpen(false);
    };

    const handleApplyVoucher = (voucher) => {
        if (onSelect) onSelect(voucher);
        setIsVoucherPopupOpen(false);
    };

    return (
        <>
            <div className="voucher-select-header">
                <div className="voucher-icon">🎟️</div>
                <div className="voucher-label">Shopee Voucher</div>
                <button className="voucher-open-btn" onClick={handleOpenPopup}>
                    Chọn hoặc nhập mã
                </button>
            </div>

            {isVoucherPopupOpen && (
                <VoucherPopup
                    isOpen={isVoucherPopupOpen}
                    onClose={handleClosePopup}
                    onApply={handleApplyVoucher}
                    cartTotal={cartTotal}
                    cartProductIds={cartProductIds}
                />
            )}
        </>
    );
}
