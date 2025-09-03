"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../common/AuthContext"
import { useNavigate } from "react-router-dom"
import "../../styles/OrderListPage.css"
import ReviewModal from "./ReviewModal"
import ShippingAddressPopup from "../user/ShippingAddressPopup"
import Modal from "react-modal"

Modal.setAppElement("#root")

function SelectAddressPopup({ isOpen, onClose, addresses, onSelect, onAddNew }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="select-address-modal"
            overlayClassName="select-address-overlay"
        >
            <h2>Chọn địa chỉ giao hàng</h2>
            <div className="address-list">
                {addresses.map((addr) => (
                    <label key={addr.id} className="address-item">
                        <input type="radio" name="selectAddress" value={addr.id} onChange={() => onSelect(addr.id)} />
                        <div className="address-info">
                            <p>
                                <strong>{addr.consigneeName}</strong> - {addr.mobile}
                            </p>
                            <p>{addr.address}</p>
                        </div>
                    </label>
                ))}
            </div>
            <div className="actions">
                <button className="btn-cancel" onClick={onClose}>
                    Hủy
                </button>
                <button className="btn-add" onClick={onAddNew}>
                    Thêm địa chỉ
                </button>
            </div>
        </Modal>
    )
}

const OrderListPage = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [accountId, setAccountId] = useState(null)
    const [addressesMap, setAddressesMap] = useState({})
    const [activeTab, setActiveTab] = useState("all")
    const [toast, setToast] = useState({ message: "", type: "" })

    const [showReviewModal, setShowReviewModal] = useState(false)
    const [currentReviewItem, setCurrentReviewItem] = useState(null)
    const [existingReview, setExistingReview] = useState(null)
    const [productNamesMap, setProductNamesMap] = useState({})

    const [showSelectAddress, setShowSelectAddress] = useState(false)
    const [showAddAddress, setShowAddAddress] = useState(false)
    const [pendingOrderId, setPendingOrderId] = useState(null)
    const [accountAddresses, setAccountAddresses] = useState([])
    const token = localStorage.getItem("TOKEN")

    const showToast = (message, type) => {
        setToast({ message, type })
        const timer = setTimeout(() => {
            setToast({ message: "", type: "" })
        }, 3000)
        return () => clearTimeout(timer)
    }

    const getStatusText = (status) => {
        const statusMap = {
            1: { text: "Chờ xác nhận", class: "order-status-pending" },
            2: { text: "Đã xác nhận", class: "order-status-confirmed" },
            3: { text: "Đã giao hàng", class: "order-status-shipping" },
            4: { text: "Đã nhận hàng", class: "order-status-delivered" },
            99: { text: "Đã hủy", class: "order-status-cancelled" },
        }
        return statusMap[status] || { text: "Không xác định", class: "order-status-unknown" }
    }

    const getPaymentMethodText = (payMethod) => {
        const paymentMap = {
            1: "Thanh toán khi nhận hàng",
            2: "VNPay",
            3: "Thẻ tín dụng",
            4: "Chuyển khoản ngân hàng",
        }
        return paymentMap[payMethod] || "Không xác định"
    }

    const fetchShippingAddress = async (shippingAddressId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/shippingAddress/getShippingAddressById?id=${shippingAddressId}`,
            )
            if (!response.ok) return null

            const result = await response.json()
            if (result.code === "00" && result.message === "Success") {
                return result.data
            }
            return null
        } catch (error) {
            console.error("Error fetching shipping address:", error)
            return null
        }
    }

    const fetchProductNameBySkuCode = async (skuCode) => {
        if (!skuCode) return "Sản phẩm không rõ tên"
        if (productNamesMap[skuCode]) return productNamesMap[skuCode]

        try {
            const response = await fetch(`http://localhost:8080/storage/getProductBySkuCode/${skuCode}`)
            if (response.ok) {
                const productResult = await response.json()
                if (productResult.code === "00" && productResult.message === "Success" && productResult.data) {
                    return productResult.data.productName
                }
            }
            console.warn(`Could not fetch product name for SKU: ${skuCode}`)
            return "Sản phẩm không rõ tên"
        } catch (err) {
            console.error(`Error fetching product for SKU: ${skuCode}`, err)
            return "Sản phẩm không rõ tên"
        }
    }

    useEffect(() => {
        if (!user?.id && !authLoading) {
            try {
                const storedUser = localStorage.getItem("user")
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser)
                    if (parsedUser && parsedUser.id) {
                        setAccountId(parsedUser.id)
                        return
                    }
                }
            } catch (e) {
                console.error("Error parsing stored user:", e)
            }
        } else if (user?.id) {
            setAccountId(user.id)
        }
    }, [user, authLoading])

    const loadAccountAddresses = async () => {
        try {
            const res = await fetch(`http://localhost:8080/shippingAddress/getByAccountId/${user.id}`)
            if (res.ok) {
                const list = await res.json()
                setAccountAddresses(list)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleChangeClick = (orderId) => {
        setPendingOrderId(orderId)
        loadAccountAddresses()
        setShowSelectAddress(true)
    }

    const handleSelect = async (addressId) => {
        setShowSelectAddress(false)
        try {
            const res = await fetch(
                `http://localhost:8080/orders/updateShippingAddress/${pendingOrderId}?shippingAddressId=${addressId}`,
                { method: "PUT" },
            )
            const result = await res.json()
            if (res.ok && result.code === "00") {
                setOrders((prev) => prev.map((o) => (o.id === pendingOrderId ? { ...o, shippingAddressId: addressId } : o)))
                const addrRes = await fetch(`http://localhost:8080/shippingAddress/getShippingAddressById?id=${addressId}`)
                const addrJson = await addrRes.json()
                if (addrRes.ok && addrJson.code === "00") {
                    setAddressesMap((m) => ({ ...m, [addressId]: addrJson.data }))
                }
                showToast("Địa chỉ đã được cập nhật", "success")
            } else throw new Error(result.message)
        } catch (e) {
            showToast(e.message || "Cập nhật thất bại", "error")
        }
    }

    const handleAddNew = () => {
        setShowSelectAddress(false)
        setShowAddAddress(true)
    }

    useEffect(() => {
        const fetchOrders = async () => {
            if (authLoading) {
                return
            }

            if (!accountId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await fetch(`http://localhost:8080/orders/getAllOrdersByAccount?accountId=${accountId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách đơn hàng")
                }

                const result = await response.json()

                if (result.code === "00" && result.message === "Success") {
                    setOrders(result.data || [])

                    const uniqueAddressIds = [...new Set(result.data.map((order) => order.shippingAddressId))]
                    const addressesData = {}

                    await Promise.all(
                        uniqueAddressIds.map(async (addressId) => {
                            const addressData = await fetchShippingAddress(addressId)
                            if (addressData) {
                                addressesData[addressId] = addressData
                            }
                        }),
                    )

                    setAddressesMap(addressesData)
                    setError(null)

                    const newProductNames = {}
                    for (const order of result.data) {
                        if (order.details) {
                            for (const item of order.details) {
                                if (item.skuCode && !productNamesMap[item.skuCode] && !newProductNames[item.skuCode]) {
                                    const productName = await fetchProductNameBySkuCode(item.skuCode)
                                    newProductNames[item.skuCode] = productName
                                }
                            }
                        }
                    }
                    if (Object.keys(newProductNames).length > 0) {
                        setProductNamesMap((prevMap) => ({ ...prevMap, ...newProductNames }))
                    }
                } else {
                    console.error("API Error:", result)
                    throw new Error(result.message || "Không thể tải danh sách đơn hàng")
                }
            } catch (err) {
                console.error("Error fetching orders:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [accountId, authLoading])

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            return
        }

        try {
            const response = await fetch(`http://localhost:8080/orders/cancelOrder/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Không thể hủy đơn hàng")
            }

            const result = await response.json()

            if (result.code === "00" && result.message === "Success") {
                setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status: 99 } : order)))
                showToast("Đơn hàng đã được hủy thành công!", "success")
            } else {
                throw new Error(result.message || "Lỗi khi hủy đơn hàng")
            }
        } catch (err) {
            console.error("Error cancelling order:", err)
            showToast(err.message, "error")
        }
    }

    const handleReceiveOrder = async (orderId) => {
        if (!window.confirm("Bạn đã nhận được đơn hàng này?")) {
            return
        }

        try {
            const response = await fetch(`http://localhost:8080/orders/changeStatus/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error("Không thể xác nhận đã nhận hàng")
            }

            const result = await response.json()

            if (result.code === "00" && result.message === "Success") {
                setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status: 4 } : order)))
                showToast("Đơn hàng đã được xác nhận đã nhận thành công!", "success")
            } else {
                throw new Error(result.message || "Lỗi khi xác nhận đã nhận hàng")
            }
        } catch (err) {
            console.error("Error confirming order receipt:", err)
            showToast(err.message, "error")
        }
    }

    const handleOpenReviewModal = async (item, isViewingExisting) => {
        const productName = productNamesMap[item.skuCode] || "Sản phẩm không rõ tên"
        setCurrentReviewItem({ ...item, productName: productName })

        if (isViewingExisting) {
            try {
                const response = await fetch(`http://localhost:8080/review/byOrderDetail/${item.id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) {
                    throw new Error("Không thể tải đánh giá hiện có.")
                }
                const result = await response.json()
                if (result.code === "00" && result.message === "Success") {
                    setExistingReview(result.data)
                } else {
                    throw new Error(result.message || "Không tìm thấy đánh giá.")
                }
            } catch (err) {
                console.error("Lỗi khi tải đánh giá:", err)
                showToast(err.message, "error")
                setExistingReview(null)
            }
        } else {
            setExistingReview(null)
        }
        setShowReviewModal(true)
    }

    const handleCloseReviewModal = () => {
        setShowReviewModal(false)
        setCurrentReviewItem(null)
        setExistingReview(null)
    }

    const handleSubmitReview = async (reviewData) => {
        try {
            if (!accountId || !currentReviewItem) {
                throw new Error("Thông tin tài khoản hoặc chi tiết đơn hàng không hợp lệ.")
            }

            // Validate rating before sending
            if (!reviewData.rating || reviewData.rating === 0 || isNaN(reviewData.rating)) {
                throw new Error("Rating không hợp lệ.")
            }

            const formData = new FormData()

            // Create review object with proper data types
            const reviewDto = {
                orderDetailId: Number.parseInt(currentReviewItem.id),
                accountId: Number.parseInt(accountId),
                rating: Number.parseInt(reviewData.rating), // Ensure integer
                comment: reviewData.comment || "",
            }

            // Get productId
            let productIdForReview = null
            if (currentReviewItem.productId) {
                productIdForReview = currentReviewItem.productId
            } else if (currentReviewItem.productVariant?.product?.id) {
                productIdForReview = currentReviewItem.productVariant.product.id
            } else {
                try {
                    const response = await fetch(`http://localhost:8080/storage/getProductBySkuCode/${currentReviewItem.skuCode}`)
                    if (response.ok) {
                        const productResult = await response.json()
                        if (productResult.code === "00" && productResult.message === "Success" && productResult.data) {
                            productIdForReview = productResult.data.id
                        }
                    }
                } catch (fetchErr) {
                    console.error("Error fetching productId by skuCode:", fetchErr)
                }
            }

            if (!productIdForReview) {
                throw new Error("Product ID không có sẵn. Không thể gửi đánh giá.")
            }

            reviewDto.productId = Number.parseInt(productIdForReview)

            // Add review data as JSON string
            formData.append("review", JSON.stringify(reviewDto))

            // Add image files
            if (reviewData.imageFiles && reviewData.imageFiles.length > 0) {
                reviewData.imageFiles.forEach((file) => {
                    formData.append("images", file)
                })
            }

            console.log("Sending review data:", reviewDto)

            const response = await fetch("http://localhost:8080/review/createReview", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()
                let errorMessage = "Gửi đánh giá thất bại."
                try {
                    const errorJson = JSON.parse(errorText)
                    errorMessage = errorJson.message || errorMessage
                } catch (e) {
                    errorMessage = errorText || errorMessage
                }
                throw new Error(errorMessage)
            }

            const result = await response.json()
            if (result.code === "00" && result.message === "Success") {
                showToast("Đánh giá của bạn đã được gửi thành công!", "success")
                handleCloseReviewModal()
                setOrders((prevOrders) =>
                    prevOrders.map((order) => ({
                        ...order,
                        details: order.details.map((detail) =>
                            detail.id === currentReviewItem.id ? { ...detail, reviewed: true } : detail,
                        ),
                    })),
                )
            } else {
                throw new Error(result.message || "Lỗi khi gửi đánh giá.")
            }
        } catch (err) {
            console.error("Lỗi khi gửi đánh giá:", err)
            showToast(err.message, "error")
        }
    }

    const getFilteredOrders = () => {
        if (activeTab === "all") {
            return orders
        }

        const statusMap = {
            pending: 1,
            confirmed: 2,
            shipping: 3,
            delivered: 4,
            cancelled: 99,
        }

        return orders.filter((order) => order.status === statusMap[activeTab])
    }

    if (authLoading || loading) {
        return (
            <div className="atino-order-container">
                <div className="atino-order-loading">
                    <div className="atino-order-spinner"></div>
                    <p>Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        )
    }

    if (!accountId && !authLoading) {
        return (
            <div className="atino-order-container">
                <div className="atino-order-login-required">
                    <h2>Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để xem đơn hàng của mình</p>
                    <button className="atino-order-login-btn" onClick={() => (window.location.href = "/login")}>
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="atino-order-container">
                <div className="atino-order-error">
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error}</p>
                    <button className="atino-order-retry-btn" onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    const filteredOrders = getFilteredOrders()

    return (
        <div className="atino-order-container">
            {toast.message && (
                <div className={`toast-message toast-${toast.type}`}>
                    <p>{toast.message}</p>
                    <button className="toast-close-btn" onClick={() => setToast({ message: "", type: "" })}>
                        &times;
                    </button>
                </div>
            )}

            <div className="atino-order-header">
                <h1>Đơn hàng của tôi</h1>
                <p>Quản lý và theo dõi các đơn hàng của bạn</p>
            </div>

            <div className="atino-order-tabs">
                <button
                    className={`atino-order-tab ${activeTab === "all" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("all")}
                >
                    Tất cả
                </button>
                <button
                    className={`atino-order-tab ${activeTab === "pending" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("pending")}
                >
                    Chờ xác nhận
                </button>
                <button
                    className={`atino-order-tab ${activeTab === "confirmed" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("confirmed")}
                >
                    Đã xác nhận
                </button>
                <button
                    className={`atino-order-tab ${activeTab === "shipping" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("shipping")}
                >
                    Đã giao hàng
                </button>
                <button
                    className={`atino-order-tab ${activeTab === "delivered" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("delivered")}
                >
                    Đã nhận hàng
                </button>
                <button
                    className={`atino-order-tab ${activeTab === "cancelled" ? "atino-order-tab-active" : ""}`}
                    onClick={() => setActiveTab("cancelled")}
                >
                    Đã hủy
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="atino-order-empty">
                    <div className="atino-order-empty-icon">📦</div>
                    <h2>Không có đơn hàng nào</h2>
                    <p>
                        {activeTab === "all"
                            ? "Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi!"
                            : `Không có đơn hàng nào trong mục "${
                                getStatusText(
                                    activeTab === "pending"
                                        ? 1
                                        : activeTab === "confirmed"
                                            ? 2
                                            : activeTab === "shipping"
                                                ? 3
                                                : activeTab === "delivered"
                                                    ? 4
                                                    : activeTab === "cancelled"
                                                        ? 99
                                                        : 0,
                                ).text
                            }"`}
                    </p>
                    <button className="atino-order-shop-btn" onClick={() => (window.location.href = "/")}>
                        Mua sắm ngay
                    </button>
                </div>
            ) : (
                <div className="atino-order-grid">
                    {filteredOrders.map((order) => {
                        const statusInfo = getStatusText(order.status)
                        const canCancel = order.status === 1
                        const canReceive = order.status === 3
                        const addressInfo = addressesMap[order.shippingAddressId]

                        return (
                            <div key={order.id} className="atino-order-card">
                                <div className="atino-order-card-header">
                                    <div className="atino-order-id">
                                        <strong>Đơn hàng #{order.id}</strong>
                                    </div>
                                    <div className={`atino-order-status ${statusInfo.class}`}>{statusInfo.text}</div>
                                </div>

                                <div className="atino-order-card-details">
                                    <div className="atino-order-detail-row">
                                        <span className="atino-order-detail-label">Tổng tiền:</span>
                                        <span className="atino-order-detail-value atino-order-price">
                      {order.totalPrice?.toLocaleString()} ₫
                    </span>
                                    </div>

                                    <div className="atino-order-detail-row">
                                        <span className="atino-order-detail-label">Phương thức thanh toán:</span>
                                        <span className="atino-order-detail-value">{getPaymentMethodText(order.payMethod)}</span>
                                    </div>

                                    {order.voucherId && order.voucherId !== 0 && (
                                        <div className="atino-order-detail-row">
                                            <span className="atino-order-detail-label">Mã giảm giá:</span>
                                            <span className="atino-order-detail-value atino-order-voucher">Đã áp dụng</span>
                                        </div>
                                    )}
                                </div>

                                {addressInfo && (
                                    <div className="atino-order-address">
                                        <h4>Địa chỉ giao hàng:</h4>
                                        <div className="atino-order-address-content">
                                            <p className="atino-order-address-name">{addressInfo.consigneeName}</p>
                                            <p className="atino-order-address-phone">{addressInfo.mobile}</p>
                                            <p className="atino-order-address-full">{addressInfo.address}</p>
                                        </div>
                                    </div>
                                )}

                                {order.details && order.details.length > 0 && (
                                    <div className="atino-order-items-container">
                                        <h4>Sản phẩm ({order.details.length} món):</h4>
                                        <div className="atino-order-items-list">
                                            {order.details.map((item) => (
                                                <div key={item.id} className="atino-order-item-row">
                                                    <div className="atino-order-item-info">
                            <span className="atino-order-item-name">
                              {productNamesMap[item.skuCode] || "Sản phẩm không rõ tên"}
                            </span>
                                                        <span className="atino-order-item-sku">SKU: {item.skuCode}</span>
                                                        <span className="atino-order-item-quantity">Số lượng: x{item.quantity}</span>
                                                        <span className="atino-order-item-price">Giá: {item.price?.toLocaleString()} ₫</span>
                                                    </div>
                                                    {order.status === 4 && (
                                                        <div className="atino-order-item-actions">
                                                            {item.reviewed ? (
                                                                <button
                                                                    className="atino-order-review-btn atino-order-view-review-btn"
                                                                    onClick={() => handleOpenReviewModal(item, true)}
                                                                >
                                                                    Xem đánh giá
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="atino-order-review-btn"
                                                                    onClick={() => handleOpenReviewModal(item, false)}
                                                                >
                                                                    Đánh giá sản phẩm
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="atino-order-card-actions">
                                    <button
                                        className="atino-order-view-btn"
                                        onClick={() => {
                                            navigate(`/order/${order.id}`)
                                        }}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {order.status === 1 && (
                                        <button className="atino-order-view-btn" onClick={() => handleChangeClick(order.id)}>
                                            Thay đổi địa chỉ
                                        </button>
                                    )}
                                    {canReceive && (
                                        <button className="atino-order-confirm-received-btn" onClick={() => handleReceiveOrder(order.id)}>
                                            Đã nhận hàng
                                        </button>
                                    )}

                                    {canCancel && (
                                        <button className="atino-order-cancel-btn" onClick={() => handleCancelOrder(order.id)}>
                                            Hủy đơn hàng
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {showReviewModal && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={handleCloseReviewModal}
                    item={currentReviewItem}
                    onSubmit={handleSubmitReview}
                    existingReview={existingReview}
                />
            )}

            {showSelectAddress && (
                <SelectAddressPopup
                    isOpen={showSelectAddress}
                    onClose={() => setShowSelectAddress(false)}
                    addresses={accountAddresses}
                    onSelect={handleSelect}
                    onAddNew={handleAddNew}
                />
            )}

            {showAddAddress && (
                <ShippingAddressPopup
                    isOpen={showAddAddress}
                    onClose={() => setShowAddAddress(false)}
                    onSelect={(newId) => {
                        handleSelect(newId)
                        setShowAddAddress(false)
                    }}
                />
            )}
        </div>
    )
}

export default OrderListPage
