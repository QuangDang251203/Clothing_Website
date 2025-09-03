"use client"

import { useState, useEffect } from "react"
import "../../styles/OrderDetailModal.css"

const OrderDetailModal = ({ orderId, onClose }) => {
    const [orderDetails, setOrderDetails] = useState(null)
    const [voucherInfo, setVoucherInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const STATUS_MAPPING = {
        1: { text: "Chờ xác nhận", class: "status-awaiting" },
        2: { text: "Đang giao", class: "status-shipping" },
        3: { text: "Đang giao", class: "status-shipping" },
        4: { text: "Đã giao", class: "status-delivered" },
        99: { text: "Đã hủy", class: "status-cancelled" },
    }

    const PAYMENT_METHOD = {
        1: "Thanh toán khi nhận hàng (COD)",
        2: "VNPay",
        3: "Thẻ tín dụng",
        4: "Chuyển khoản ngân hàng",
    }

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true)
                const res = await fetch(`http://localhost:8080/orders/getDetailOrder/${orderId}`)
                if (!res.ok) throw new Error("Không thể tải thông tin đơn hàng")
                const result = await res.json()
                if (result.code !== "00" || result.message !== "Success") throw new Error(result.message)

                const data = result.data
                if (data.voucherId && data.voucherId !== 0) fetchVoucherInfo(data.voucherId)

                // fetch shipping address
                let shippingAddress = null
                if (data.shippingAddressId) {
                    try {
                        const addrRes = await fetch(
                            `http://localhost:8080/shippingAddress/getShippingAddressById?id=${data.shippingAddressId}`
                        )
                        if (addrRes.ok) {
                            const addrJson = await addrRes.json()
                            if (addrJson.code === "00" && addrJson.message === "Success") {
                                shippingAddress = addrJson.data
                            }
                        }
                    } catch {}
                }

                setOrderDetails({ ...data, shippingAddress })
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        const fetchVoucherInfo = async (voucherId) => {
            try {
                const res = await fetch(`http://localhost:8080/voucher/getVoucherById?id=${voucherId}`)
                const result = await res.json()
                if (result.code === "00" && result.message === "Success") setVoucherInfo(result.data)
            } catch {}
        }

        if (orderId) fetchOrderDetails()
    }, [orderId])

    const calculateDiscountAmount = () => {
        if (!orderDetails || !voucherInfo) return 0
        const subtotal = orderDetails.details?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0
        if (voucherInfo.isPercentage) {
            const amount = subtotal * voucherInfo.voucherValue
            return Math.min(amount, voucherInfo.maxDiscountAmount || amount)
        }
        return voucherInfo.voucherValue
    }

    const formatDate = (d) =>
        d
            ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                new Date(d)
            )
            : "N/A"

    const formatCurrency = (a) =>
        a != null
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(a)
            : "0 ₫"

    const discountAmount = calculateDiscountAmount()
    const subtotal = orderDetails?.details?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0

    return (
        <div className="admin-order-detail-modal-overlay" onClick={onClose}>
            <div className="admin-order-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-order-detail-modal-header">
                    <h2>Chi tiết đơn hàng #{orderId}</h2>
                    <button className="admin-order-detail-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="admin-order-detail-modal-content">
                    {loading ? (
                        <div className="admin-order-detail-loading">
                            <div className="admin-order-detail-spinner"></div>
                            <p>Đang tải thông tin đơn hàng...</p>
                        </div>
                    ) : error ? (
                        <div className="admin-order-detail-error">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>Thử lại</button>
                        </div>
                    ) : orderDetails ? (
                        <>
                            <div className="admin-order-detail-summary">
                                <div className="admin-order-detail-status-row">
                                    <span className="admin-order-detail-label">Trạng thái:</span>
                                    <span
                                        className={`admin-order-detail-status ${STATUS_MAPPING[orderDetails.status]?.class}`}>
                    {STATUS_MAPPING[orderDetails.status]?.text}
                  </span>
                                </div>
                                <div className="admin-order-detail-info-grid">
                                    <div className="admin-order-detail-info-item">
                                        <span className="admin-order-detail-label">Ngày đặt:</span>
                                        <span>{formatDate(orderDetails.createdAt)}</span>
                                    </div>
                                    <div className="admin-order-detail-info-item">
                                        <span className="admin-order-detail-label">Phương thức thanh toán:</span>
                                        <span>{PAYMENT_METHOD[orderDetails.payMethod]}</span>
                                    </div>
                                    {voucherInfo && (
                                        <div className="admin-order-detail-info-item">
                                            <span className="admin-order-detail-label">Mã giảm giá:</span>
                                            <span className="admin-order-detail-voucher">
                        {voucherInfo.voucherCode}
                      </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="admin-order-detail-sections">
                                <div className="admin-order-detail-section">
                                    <h3>Địa chỉ giao hàng</h3>
                                    {orderDetails.shippingAddress ? (
                                        <div className="admin-order-detail-address">
                                            <p>
                                                <strong>Người nhận:</strong> {orderDetails.shippingAddress.consigneeName}
                                            </p>
                                            <p>
                                                <strong>Số điện thoại:</strong> {orderDetails.shippingAddress.mobile}
                                            </p>
                                            <p>
                                                <strong>Địa chỉ:</strong> {orderDetails.shippingAddress.address}
                                            </p>
                                        </div>
                                    ) : (
                                        <p>Không có thông tin địa chỉ</p>
                                    )}
                                </div>
                            </div>

                            <div className="admin-order-detail-products">
                                <h3>Sản phẩm ({orderDetails.details?.length || 0})</h3>
                                {orderDetails.details?.length ? (
                                    <table className="admin-order-detail-products-table">
                                        <thead>
                                        <tr>
                                            <th>Mã SKU</th>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {orderDetails.details.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.skuCode}</td>
                                                <td>
                                                    <div className="admin-order-detail-product">
                                                        {item.productVariant?.product?.imageURLs?.[0]?.url && (
                                                            <img
                                                                src={item.productVariant.product.imageURLs[0].url}
                                                                alt={item.productVariant.product.productName}
                                                                className="admin-order-detail-product-image"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="admin-order-detail-product-name">
                                                                {item.productVariant?.product?.productName}
                                                            </div>
                                                            <div className="admin-order-detail-product-variant">
                                                                {item.productVariant?.variantName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(item.price)}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr>
                                            <td colSpan="4" className="admin-order-detail-subtotal-label">
                                                Tạm tính
                                            </td>
                                            <td className="admin-order-detail-subtotal-price">
                                                {formatCurrency(subtotal)}
                                            </td>
                                        </tr>
                                        {discountAmount > 0 && (
                                            <tr>
                                                <td colSpan="4" className="admin-order-detail-discount-label">
                                                    Giảm giá ({voucherInfo.voucherCode})
                                                </td>
                                                <td className="admin-order-detail-discount-amount">
                                                    -{formatCurrency(discountAmount)}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td colSpan="4" className="admin-order-detail-total-label">
                                                Tổng cộng
                                            </td>
                                            <td className="admin-order-detail-total-price">
                                                {formatCurrency(orderDetails.totalPrice)}
                                            </td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                ) : (
                                    <p>Không có sản phẩm nào</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <p>Không tìm thấy thông tin đơn hàng</p>
                    )}
                </div>

                <div className="admin-order-detail-modal-footer">
                    <button className="admin-order-detail-close-button" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailModal
