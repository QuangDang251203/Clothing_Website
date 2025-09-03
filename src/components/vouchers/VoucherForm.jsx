// src/components/VoucherForm.jsx
import React, {useState, useEffect} from "react";
import {Calendar, Tag} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import VoucherService from '../../services/VoucherService';
import ProductService from '../../services/ProductService';
import "../../styles/voucher-form.css";

export default function VoucherForm({initialData, mode}) {
    // mode = 'create' hoặc 'edit'
    // initialData = dữ liệu khi edit, hoặc {} khi create
    const navigate = useNavigate();

    // Khởi tạo state từ initialData (nếu edit), ngược lại default rỗng
    const [voucherName, setVoucherName] = useState(initialData?.des || "");
    const [voucherCode, setVoucherCode] = useState(initialData?.voucherCode || "");
    const [startDate, setStartDate] = useState(initialData?.startDate ? initialData.startDate.slice(0, 10) : "");
    const [endDate, setEndDate] = useState(initialData?.expiryDate ? initialData.expiryDate.slice(0, 10) : "");
    const [discountType, setDiscountType] = useState(initialData?.isPercentage ? "percent" : "amount");
    const [amountValue, setAmountValue] = useState(
        initialData
            ? initialData.voucherValue?.toString()
            : ""
    );
    const [minOrderValue, setMinOrderValue] = useState(initialData?.minOrderAmount?.toString() || "");
    const [totalUsage, setTotalUsage] = useState(initialData?.maxRedemptions?.toString() || "");
    const [maxDiscountAmount, setMaxDiscountAmount] = useState(initialData?.maxDiscountAmount?.toString() || "");

    const [productScope, setProductScope] = useState("all");
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState(initialData?.productIds || []);

    useEffect(() => {
        if (mode === 'edit' && initialData?.productIds && initialData.productIds.length > 0) {
            // Nếu có productIds, nghĩa là trước đó voucher áp cho những sp đó
            setProductScope("choose");
            setSelectedProductIds(initialData.productIds);
        }
    }, [mode, initialData]);

    // Khi user chọn “Lựa chọn sản phẩm” (radio), fetch danh sách product
    useEffect(() => {
        if (productScope === "choose") {
            ProductService.getAllProductsFull()
                .then(response => {
                    const arrayOfProducts = response.data.data;
                    setAllProducts(Array.isArray(arrayOfProducts) ? arrayOfProducts : []);
                })
                .catch(err => {
                    console.error(err);
                    setAllProducts([]);
                });
        }
    }, [productScope]);

    const handleCancel = () => {
        navigate('/admin/voucher');
    };

    const handleProductCheckbox = (productId, checked) => {
        if (checked) {
            setSelectedProductIds(prev => [...prev, productId]);
        } else {
            setSelectedProductIds(prev => prev.filter(id => id !== productId));
        }
    };
    // Hàm submit chung cho cả create và edit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Tạo payload đúng format VoucherDTO mà backend cần
        const payload = {
            voucherCode: voucherCode.trim(),
            des: voucherName.trim(),
            voucherValue: parseFloat(amountValue) || 0,
            isPercentage: discountType === 'percent',
            minOrderAmount: parseFloat(minOrderValue) || 0,
            maxDiscountAmount: parseFloat(maxDiscountAmount) || 0,      // mẫu không nhập, bạn có thể thêm input nếu muốn
            maxRedemptions: parseInt(totalUsage) || 0,
            startDate: startDate ? startDate : null,
            expiryDate: endDate ? endDate : null,
            productIds: productScope === 'all' ? null : selectedProductIds
        };

        try {
            if (mode === 'create') {
                await VoucherService.create(payload);
                alert('Tạo Voucher thành công');
            } else {
                // mode === 'edit'
                await VoucherService.update(voucherCode, payload);
                alert('Cập nhật Voucher thành công');
            }
            // Sau khi thành công, quay về trang quản lý
            navigate('/admin/voucher');
        } catch (err) {
            console.error(err);
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="voucher-form-container">
            {/* Basic Information Section */}
            <div className="form-section">
                <h2 className="section-title">Thông tin cơ bản</h2>

                {/* Loại mã (mẫu chỉ có 1 loại “Voucher toàn Shop”) */}
                <div className="form-row">
                    <label>Loại mã</label>
                    <div className="voucher-type-selector">
                        <div className="voucher-type-card">
                            <div className="voucher-icon">
                                <Tag color="#ff5722"/>
                            </div>
                            <span>Voucher toàn Shop</span>
                            <div className="corner-ribbon"></div>
                        </div>
                    </div>
                </div>

                {/* Tên chương trình giảm giá (= des) */}
                <div className="form-row">
                    <label>Tên chương trình giảm giá</label>
                    <div className="input-container">
                        <input
                            type="text"
                            value={voucherName}
                            onChange={(e) => setVoucherName(e.target.value)}
                            placeholder="Nhập tên chương trình"
                            maxLength={100}
                        />
                        <span className="char-count">{voucherName.length}/100</span>
                    </div>
                    <div className="helper-text">
                        Tên Voucher sẽ không được hiển thị cho Người mua
                    </div>
                </div>

                {/* Mã voucher (key) */}
                <div className="form-row">
                    <label>Mã voucher</label>
                    <div className="input-container">
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            placeholder="DECO"
                            maxLength={20}
                            readOnly={mode === 'edit'}
                            /* Nếu đang edit, không cho phép sửa voucherCode */
                        />
                        <span className="char-count">{voucherCode.length}/20</span>
                    </div>
                    <div className="helper-text">
                        Vui lòng chỉ nhập các kí tự chữ (A-Z), số (0-9); tối đa 20 kí tự.
                    </div>
                </div>

                {/* Thời gian sử dụng mã */}
                <div className="form-row">
                    <label>Thời gian sử dụng mã</label>
                    <div className="date-range-container">
                        <div className="date-input">
                            <Calendar className="date-icon" size={16}/>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <span className="date-separator">—</span>
                        <div className="date-input">
                            <Calendar className="date-icon" size={16}/>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Setup Section */}
            <div className="form-section">
                <h2 className="section-title">Thiết lập mã giảm giá</h2>

                {/* Loại Voucher (chưa dùng, giữ hiển thị) */}
                {/* Loại giảm giá | Mức giảm */}
                <div className="form-row">
                    <label>Loại giảm giá | Mức giảm</label>
                    <div className="discount-type-container">
                        <div className="select-container">
                            <select
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                            >
                                <option value="amount">Theo số tiền</option>
                                <option value="percent">Theo phần trăm</option>
                            </select>
                            <div className="select-arrow">▼</div>
                        </div>
                        <input
                            type="number"
                            className="amount-input"
                            placeholder={discountType === 'percent' ? '%' : 'đ'}
                            value={amountValue}
                            onChange={(e) => setAmountValue(e.target.value)}
                            min="0"
                        />
                    </div>
                </div>

                {/* Giá trị đơn hàng tối thiểu */}
                <div className="form-row">
                    <label>Giá trị đơn hàng tối thiểu</label>
                    <input
                        type="number"
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(e.target.value)}
                        className="full-width-input"
                        placeholder="đ"
                        min="0"
                    />
                </div>

                {/* Tổng lượt sử dụng tối đa */}
                <div className="form-row">
                    <label>Tổng lượt sử dụng tối đa</label>
                    <input
                        type="number"
                        value={totalUsage}
                        onChange={(e) => setTotalUsage(e.target.value)}
                        className="full-width-input"
                        min="0"
                    />
                    <div className="helper-text">Tổng số Mã giảm giá có thể sử dụng</div>
                </div>

                {/* Lượt sử dụng tối đa/Người mua */}
                <div className="form-row">
                    <label>Số tiền giảm tối đa</label>
                    <input
                        type="number"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(e.target.value)}
                        className="full-width-input"
                        placeholder="đ"
                        min="0"
                    />
                    <div className="helper-text">Số tiền giảm tối đa có thể áp dụng cho voucher này.</div>
                </div>
            </div>

            {/* Display Settings Section */}
            <div className="form-section">
                <h2 className="section-title">Các sản phẩm áp dụng</h2>

                <div className="form-row">
                    <label>Sản phẩm được áp dụng</label>
                    <div className="radio-group">
                        {/* Radio: Tất cả sản phẩm */}
                        <div className="radio-option">
                            <input
                                type="radio"
                                id="allProducts"
                                name="productScope"
                                value="all"
                                checked={productScope === "all"}
                                onChange={() => setProductScope("all")}
                            />
                            <label htmlFor="allProducts" className="radio-label">
                                <span className="radio-custom"></span>
                                Tất cả sản phẩm
                            </label>
                        </div>
                        {/* Radio: Lựa chọn sản phẩm */}
                        <div className="radio-option">
                            <input
                                type="radio"
                                id="chooseProducts"
                                name="productScope"
                                value="choose"
                                checked={productScope === "choose"}
                                onChange={() => setProductScope("choose")}
                            />
                            <label htmlFor="chooseProducts" className="radio-label">
                                <span className="radio-custom"></span>
                                Lựa chọn sản phẩm
                            </label>
                        </div>
                    </div>
                </div>

                {/* Nếu đang chọn sản phẩm thì hiển thị danh sách checkbox */}
                {productScope === "choose" && (
                    <div className="form-row">
                        <label></label>
                        <div className="product-list-container">
                            {allProducts.length === 0
                                ? <div>Đang tải hoặc không có sản phẩm</div>
                                : allProducts.map(product => (
                                    <div key={product.id} className="product-item">
                                        <input
                                            type="checkbox"
                                            id={`prod-${product.id}`}
                                            checked={selectedProductIds.includes(product.id)}
                                            onChange={e => {
                                                const checked = e.target.checked;
                                                if (checked) {
                                                    setSelectedProductIds(prev => [...prev, product.id]);
                                                } else {
                                                    setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`prod-${product.id}`}>{product.productName}</label>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="btn-cancel" onClick={handleCancel}>
                    Hủy
                </button>
                <button className="btn-confirm" onClick={handleSubmit}>
                    {mode === 'create' ? 'Xác nhận' : 'Lưu'}
                </button>
            </div>
        </div>
    );
}
