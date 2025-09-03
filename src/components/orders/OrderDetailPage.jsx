"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "../../styles/OrderDetailPage.css"

const OrderDetailPage = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [orderDetails, setOrderDetails] = useState(null)
    const [shippingAddress, setShippingAddress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Status mapping
    const STATUS_MAPPING = {
        0: { text: "Chờ thanh toán", class: "status-pending-payment" },
        1: { text: "Chờ xác nhận", class: "status-awaiting" },
        2: { text: "Đang giao", class: "status-shipping" },
        4: { text: "Đã giao", class: "status-delivered" },
        99: { text: "Đã hủy", class: "status-cancelled" },
    }

    // Payment method mapping
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

                // Fetch order details
                const orderResponse = await fetch(`http://localhost:8080/orders/getDetailOrder/${orderId}`)
                if (!orderResponse.ok) {
                    throw new Error("Không thể tải thông tin đơn hàng")
                }

                const orderResult = await orderResponse.json()
                if (orderResult.code === "00" && orderResult.message === "Success") {
                    setOrderDetails(orderResult.data)

                    // Fetch shipping address if available
                    if (orderResult.data.shippingAddressId) {
                        const addressResponse = await fetch(
                            `http://localhost:8080/shippingAddress/getShippingAddressById?id=${orderResult.data.shippingAddressId}`,
                        )
                        if (addressResponse.ok) {
                            const addressResult = await addressResponse.json()
                            if (addressResult.code === "00" && addressResult.message === "Success") {
                                setShippingAddress(addressResult.data)
                            }
                        }
                    }
                } else {
                    throw new Error(orderResult.message || "Lỗi khi tải thông tin đơn hàng")
                }
            } catch (err) {
                console.error("Error fetching order details:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (orderId) {
            fetchOrderDetails()
        }
    }, [orderId])

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date)
    }

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "0 ₫"
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="admin-order-detail-container">
                <div className="admin-order-detail-loading">
                    <div className="admin-order-detail-spinner"></div>
                    <p>Đang tải thông tin đơn hàng...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="admin-order-detail-container">
                <div className="admin-order-detail-error">
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error}</p>
                    <button className="admin-order-detail-retry-btn" onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (!orderDetails) {
        return (
            <div className="admin-order-detail-container">
                <div className="admin-order-detail-error">
                    <h2>Không tìm thấy đơn hàng</h2>
                    <p>Đơn hàng #{orderId} không tồn tại</p>
                    <button className="admin-order-detail-back-btn" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-order-detail-container">
            <div className="admin-order-detail-header">
                <button className="admin-order-detail-back-btn" onClick={() => navigate(-1)}>
                    ← Quay lại
                </button>
                <h1>Chi tiết đơn hàng #{orderId}</h1>
            </div>

            <div className="admin-order-detail-content">
                {/* Order Summary */}
                <div className="admin-order-detail-summary">
                    <div className="admin-order-detail-status-row">
                        <span className="admin-order-detail-label">Trạng thái:</span>
                        <span className={`admin-order-detail-status ${STATUS_MAPPING[orderDetails.status]?.class}`}>
              {STATUS_MAPPING[orderDetails.status]?.text || "Không xác định"}
            </span>
                    </div>

                    <div className="admin-order-detail-info-grid">
                        <div className="admin-order-detail-info-item">
                            <span className="admin-order-detail-label">Ngày đặt:</span>
                            <span>{formatDate(orderDetails.createdAt)}</span>
                        </div>
                        <div className="admin-order-detail-info-item">
                            <span className="admin-order-detail-label">Phương thức thanh toán:</span>
                            <span>{PAYMENT_METHOD[orderDetails.payMethod] || "Không xác định"}</span>
                        </div>
                        <div className="admin-order-detail-info-item">
                            <span className="admin-order-detail-label">Tổng tiền:</span>
                            <span className="admin-order-detail-price">{formatCurrency(orderDetails.totalPrice)}</span>
                        </div>
                        {orderDetails.voucherId && orderDetails.voucherId !== 0 && (
                            <div className="admin-order-detail-info-item">
                                <span className="admin-order-detail-label">Mã giảm giá:</span>
                                <span className="admin-order-detail-voucher">ID: {orderDetails.voucherId}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-order-detail-sections">
                    {/* Customer Information */}
                    <div className="admin-order-detail-section">
                        <h3>Thông tin khách hàng</h3>
                        {orderDetails.account ? (
                            <div className="admin-order-detail-customer">
                                <p>
                                    <strong>Họ tên:</strong> {orderDetails.account.fullName || "N/A"}
                                </p>
                                <p>
                                    <strong>Email:</strong> {orderDetails.account.email || "N/A"}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {orderDetails.account.phone || "N/A"}
                                </p>
                                <p>
                                    <strong>ID khách hàng:</strong> {orderDetails.accountId}
                                </p>
                            </div>
                        ) : (
                            <p>Không có thông tin khách hàng (ID: {orderDetails.accountId})</p>
                        )}
                    </div>

                    {/* Shipping Address */}
                    <div className="admin-order-detail-section">
                        <h3>Địa chỉ giao hàng</h3>
                        {shippingAddress ? (
                            <div className="admin-order-detail-address">
                                <p>
                                    <strong>Người nhận:</strong> {shippingAddress.consigneeName}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {shippingAddress.mobile}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {shippingAddress.address}
                                </p>
                            </div>
                        ) : (
                            <p>Không có thông tin địa chỉ (ID: {orderDetails.shippingAddressId})</p>
                        )}
                    </div>
                </div>

                {/* Products */}
                <div className="admin-order-detail-products">
                    <h3>Sản phẩm ({orderDetails.details?.length || 0})</h3>
                    {orderDetails.details && orderDetails.details.length > 0 ? (
                        <table className="admin-order-detail-products-table">
                            <thead>
                            <tr>
                                <th>Mã SKU</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orderDetails.details.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.skuCode || "N/A"}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan="3" className="admin-order-detail-total-label">
                                    Tổng cộng
                                </td>
                                <td className="admin-order-detail-total-price">{formatCurrency(orderDetails.totalPrice)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p>Không có sản phẩm nào</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
