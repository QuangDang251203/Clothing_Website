// src/components/common/VoucherPopup.jsx
import React, { useState, useEffect } from "react";
import Popup from "../common/Popup";
import VoucherService from "../../services/VoucherService";
import "../../styles/voucher-popup.css";

export default function VoucherPopup({
                                         isOpen,
                                         onClose,
                                         onApply,
                                         cartTotal,
                                         cartProductIds,
                                     }) {
    // Danh sách voucher hợp lệ
    const [allVouchers, setAllVouchers] = useState([]);
    const [loadingVouchers, setLoadingVouchers] = useState(false);
    const [errorVouchers, setErrorVouchers] = useState("");

    // State local
    const [manualCode, setManualCode] = useState("");
    const [applyCodeError, setApplyCodeError] = useState("");
    const [selectedVoucherCode, setSelectedVoucherCode] = useState("");
    const [selectedVoucherObj, setSelectedVoucherObj] = useState(null);

    // 1. Khi popup mở, hoặc cartTotal/cartProductIds thay đổi, fetch voucher hợp lệ
    useEffect(() => {
        if (!isOpen) return;
        // Nếu cartTotal hoặc cartProductIds chưa khởi tạo, skip
        if (cartTotal == null || !cartProductIds) {
            setAllVouchers([]);
            return;
        }

        const fetchValid = async () => {
            setLoadingVouchers(true);
            setErrorVouchers("");
            try {
                const data = await VoucherService.getValidForCart(
                    cartTotal,
                    cartProductIds
                );
                console.log("Voucher hợp lệ từ API:", data);
                setAllVouchers(data);
            } catch (err) {
                console.error(err);
                setErrorVouchers("Không tải được danh sách voucher.");
            } finally {
                setLoadingVouchers(false);
            }
        };

        fetchValid();
    }, [isOpen, cartTotal, cartProductIds]);

    // 2. Khi click “ÁP DỤNG” (manual code)
    const handleApplyCode = async () => {
        setApplyCodeError("");
        if (!manualCode.trim()) {
            setApplyCodeError("Vui lòng nhập mã voucher.");
            return;
        }
        try {
            const v = await VoucherService.getByCode(manualCode.trim());
            console.log("VoucherService.getByCode() trả về:", v);

            // Tiếp tục kiểm tra xem voucher đó có nằm trong allVouchers (hợp lệ) không
            const found = allVouchers.find((x) => x.voucherCode === v.voucherCode);
            if (!found) {
                setApplyCodeError("Voucher không hợp lệ cho giỏ hàng này.");
                return;
            }

            setSelectedVoucherCode(v.voucherCode);
            setSelectedVoucherObj(v);
        } catch (err) {
            console.error(err);
            setApplyCodeError("Voucher không tồn tại hoặc đã hết hạn.");
        }
    };

    // 3. Khi người dùng click radio trên danh sách voucher
    const handleSelectRadio = (voucher) => {
        setSelectedVoucherCode(voucher.voucherCode);
        setSelectedVoucherObj(voucher);
        setApplyCodeError("");
        setManualCode("");
    };

    // 4. Khi nhấn “OK” (xác nhận)
    const handleOK = () => {
        if (selectedVoucherObj) {
            onApply(selectedVoucherObj);
        } else {
            if (manualCode.trim()) {
                setApplyCodeError("Vui lòng bấm ÁP DỤNG để xác nhận mã nhập.");
                return;
            }
            onApply(null);
        }
    };

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Chọn Shopee Voucher">
            <div className="voucher-popup-inner">
                {/* 1. Input nhập mã voucher */}
                <div className="vp-section input-section">
                    <input
                        type="text"
                        placeholder="Mã Voucher"
                        value={manualCode}
                        onChange={(e) => {
                            setManualCode(e.target.value);
                            setApplyCodeError("");
                        }}
                    />
                    <button className="btn-apply-code" onClick={handleApplyCode}>
                        ÁP DỤNG
                    </button>
                </div>
                {applyCodeError && <div className="apply-error">{applyCodeError}</div>}

                {/* 2. List Voucher hợp lệ */}
                <div className="vp-section list-section">
                    {loadingVouchers ? (
                        <div className="vp-loading">Đang tải voucher…</div>
                    ) : errorVouchers ? (
                        <div className="vp-error">{errorVouchers}</div>
                    ) : allVouchers.length === 0 ? (
                        <div className="vp-empty">Không có voucher hợp lệ.</div>
                    ) : (
                        <ul className="vp-list">
                            {allVouchers.map((v) => {
                                // Tính percentage đã dùng
                                const usedPercent = Math.floor(
                                    ((v.timesRedeemed || 0) / (v.maxRedemptions || 1)) * 100
                                );
                                return (
                                    <li key={v.voucherCode} className="vp-item">
                                        <label className="vp-item-label">
                                            <div className="vp-card">
                                                <div className="vp-card-left">
                                                    {v.isPercentage ? (
                                                        <div className="vp-discount">
                                                            Giảm {v.voucherValue}%
                                                        </div>
                                                    ) : (
                                                        <div className="vp-discount">
                                                            Giảm ₫{Number(v.voucherValue).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="vp-card-right">
                                                    <div className="vp-desc">{v.des}</div>
                                                    <div className="vp-conditions">
                                                        Đơn tối thiểu ₫
                                                        {v.minOrderAmount
                                                            ? Number(v.minOrderAmount).toLocaleString()
                                                            : 0}
                                                    </div>
                                                    <div className="vp-maxdiscount">
                                                        Giảm tối đa ₫
                                                        {v.maxDiscountAmount
                                                            ? Number(v.maxDiscountAmount).toLocaleString()
                                                            : 0}
                                                    </div>
                                                    <div className="vp-expiry">
                                                        HSD: {new Date(v.expiryDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="vp-progress">
                                                        <div className="vp-progress-bar">
                                                            <div
                                                                className="vp-progress-fill"
                                                                style={{ width: `${usedPercent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="vp-used-count">
                              Đã dùng {usedPercent}%
                            </span>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="vp-radio"
                                                    name="selectedVoucher"
                                                    checked={selectedVoucherCode === v.voucherCode}
                                                    onChange={() => handleSelectRadio(v)}
                                                />
                                            </div>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* 3. Nút “Trở Lại” và “OK” */}
                <div className="vp-footer">
                    <button className="btn-back" onClick={onClose}>
                        TRỞ LẠI
                    </button>
                    <button className="btn-ok" onClick={handleOK}>
                        OK
                    </button>
                </div>
            </div>
        </Popup>
    );
}
