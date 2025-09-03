"use client"

import { useState, useEffect } from "react"
import OrderDetailModal from "./OrderDetailModal"
import "../../styles/OrderManagement.css"

const OrderManagement = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("awaiting")
    const [selectedOrders, setSelectedOrders] = useState([])
    const [processingOrderIds, setProcessingOrderIds] = useState([])
    const [bulkProcessing, setBulkProcessing] = useState(false)
    const [selectedOrderId, setSelectedOrderId] = useState(null)
    const [sortOrder, setSortOrder] = useState("desc")

    const STATUS_MAPPING = {
        1: { text: "Chờ xác nhận", tab: "awaiting", class: "status-awaiting" },
        2: { text: "Đang giao", tab: "shipping", class: "status-shipping" },
        4: { text: "Đã giao", tab: "delivered", class: "status-delivered" },
        99: { text: "Đã hủy", tab: "cancelled", class: "status-cancelled" },
    }

    const PAYMENT_METHOD = {
        1: "Thanh toán khi nhận hàng (COD)",
        2: "VNPay",
        3: "Thẻ tín dụng",
        4: "Chuyển khoản ngân hàng",
    }

    // Fetch all orders & their shipping addresses
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true)
                const response = await fetch("http://localhost:8080/orders/getAllOrders")
                if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng")
                const result = await response.json()
                if (result.code !== "00" || result.message !== "Success") {
                    throw new Error(result.message || "Lỗi khi tải danh sách đơn hàng")
                }
                const ordersRaw = result.data || []

                // Gọi API lấy chi tiết địa chỉ cho từng order
                const ordersWithAddress = await Promise.all(
                    ordersRaw.map(async (order) => {
                        try {
                            const addrRes = await fetch(
                                `http://localhost:8080/shippingAddress/getShippingAddressById?id=${order.shippingAddressId}`
                            )
                            if (!addrRes.ok) throw new Error("Lỗi khi tải địa chỉ")
                            const addrJson = await addrRes.json()
                            if (addrJson.code === "00" && addrJson.message === "Success") {
                                return { ...order, shippingAddress: addrJson.data }
                            }
                        } catch (err) {
                            console.warn(`Không lấy được địa chỉ cho order ${order.id}`, err)
                        }
                        return { ...order, shippingAddress: null }
                    })
                )

                setOrders(ordersWithAddress)
            } catch (err) {
                console.error("Error fetching orders:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const getFilteredOrders = () => {
        const statusMap = { awaiting: 1, shipping: 2, delivered: 4, cancelled: 99 }
        const filtered = orders.filter(o => o.status === statusMap[activeTab])
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB
        })
        return filtered
    }

    const toggleSortOrder = () => setSortOrder(prev => prev === "desc" ? "asc" : "desc")

    const handleChangeStatus = async (orderId) => {
        try {
            setProcessingOrderIds(prev => [...prev, orderId])
            const response = await fetch(`http://localhost:8080/orders/changeStatus/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            })
            if (!response.ok) throw new Error("Không thể cập nhật trạng thái đơn hàng")
            const result = await response.json()
            if (result.code === "00" && result.message === "Success") {
                setOrders(prev => prev.map(o => o.id === orderId
                    ? { ...o, status: o.status === 1 ? 2 : o.status === 2 ? 4 : o.status }
                    : o
                ))
                setSelectedOrders(prev => prev.filter(id => id !== orderId))
            } else {
                throw new Error(result.message)
            }
        } catch (err) {
            console.error("Error changing order status:", err)
            alert(`Lỗi: ${err.message}`)
        } finally {
            setProcessingOrderIds(prev => prev.filter(id => id !== orderId))
        }
    }

    const handleBulkChangeStatus = async () => {
        if (selectedOrders.length === 0) return alert("Vui lòng chọn ít nhất một đơn hàng")
        try {
            setBulkProcessing(true)
            for (const id of selectedOrders) await handleChangeStatus(id)
            setSelectedOrders([])
        } finally {
            setBulkProcessing(false)
        }
    }

    const toggleOrderSelection = (orderId) => setSelectedOrders(prev =>
        prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    )

    const toggleAllOrders = () => {
        const filtered = getFilteredOrders()
        setSelectedOrders(prev => prev.length === filtered.length ? [] : filtered.map(o => o.id))
    }

    const formatDate = (d) => d
        ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
        : "N/A"

    const formatCurrency = (amt) => amt != null
        ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(amt)
        : "0 ₫"

    const getSkuCodes = (details) => {
        if (!details?.length) return "Không có"
        const codes = details.map(d => d.skuCode).filter(Boolean)
        if (!codes.length) return "Không có"
        return codes.length <= 2 ? codes.join(", ") : `${codes.slice(0,2).join(", ")} +${codes.length-2}`
    }

    if (loading) return (
        <div className="admin-order-mgmt-container">
            <div className="admin-order-mgmt-loading">
                <div className="admin-order-mgmt-spinner"></div>
                <p>Đang tải danh sách đơn hàng...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="admin-order-mgmt-container">
            <div className="admin-order-mgmt-error">
                <h2>Có lỗi xảy ra</h2>
                <p>{error}</p>
                <button className="admin-order-mgmt-retry-btn" onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        </div>
    )

    const filteredOrders = getFilteredOrders()

    return (
        <div className="admin-order-mgmt-container">
            <div className="admin-order-mgmt-header">
                <h1>Quản Lý Đơn Hàng</h1>
                <p>Quản lý và theo dõi tất cả đơn hàng</p>
            </div>

            <div className="admin-order-mgmt-tabs">
                {Object.entries(STATUS_MAPPING).map(([status, { text, tab }]) => (
                    <button
                        key={status}
                        className={`admin-order-mgmt-tab ${activeTab===tab?"admin-order-mgmt-tab-active":""}`}
                        onClick={()=>setActiveTab(tab)}
                    >
                        {text}
                        <span className="admin-order-mgmt-count">{orders.filter(o=>o.status===Number(status)).length}</span>
                    </button>
                ))}
            </div>

            {activeTab==="awaiting" && filteredOrders.length>0 && (
                <div className="admin-order-mgmt-bulk-actions">
                    <label className="admin-order-mgmt-checkbox-container">
                        <input type="checkbox" checked={selectedOrders.length===filteredOrders.length} onChange={toggleAllOrders}/>
                        <span className="admin-order-mgmt-checkmark"></span>
                    </label>
                    <span>{selectedOrders.length} / {filteredOrders.length} đơn hàng được chọn</span>
                    <button onClick={handleBulkChangeStatus} disabled={!selectedOrders.length || bulkProcessing} className="admin-order-mgmt-bulk-ship-btn">
                        {bulkProcessing?"Đang xử lý...":"Giao hàng loạt"}
                    </button>
                </div>
            )}

            {filteredOrders.length===0 ? (
                <div className="admin-order-mgmt-empty">
                    <div className="admin-order-mgmt-empty-icon">📦</div>
                    <h2>Không có đơn hàng nào</h2>
                    <p>Hiện không có đơn hàng nào trong trạng thái này</p>
                </div>
            ) : (
                <div className="admin-order-mgmt-table-container">
                    <table className="admin-order-mgmt-table">
                        <thead>
                        <tr>
                            {activeTab==="awaiting" && <th></th>}
                            <th>Mã đơn</th>
                            <th>Tên người nhận</th>
                            <th>
                                <div className="admin-order-mgmt-date-header">
                                    Ngày đặt
                                    <button onClick={toggleSortOrder} title={`Sắp xếp ${sortOrder==="desc"?"tăng dần":"giảm dần"}`} className="admin-order-mgmt-sort-btn">
                                        {sortOrder==="desc"?"↓":"↑"}
                                    </button>
                                </div>
                            </th>
                            <th>Tổng tiền</th>
                            <th>Thanh toán</th>
                            <th>Sản phẩm</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map(order=> (
                            <tr key={order.id}>
                                {activeTab==="awaiting" && (
                                    <td>
                                        <label className="admin-order-mgmt-checkbox-container">
                                            <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={()=>toggleOrderSelection(order.id)}/>
                                            <span className="admin-order-mgmt-checkmark"></span>
                                        </label>
                                    </td>
                                )}
                                <td>#{order.id}</td>
                                <td>
                                    <div className="admin-order-mgmt-recipient-info">
                                        <span className="admin-order-mgmt-recipient-name">{order.shippingAddress?.consigneeName||"N/A"}</span>
                                        <span className="admin-order-mgmt-recipient-phone">{order.shippingAddress?.mobile||"N/A"}</span>
                                    </div>
                                </td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td className="admin-order-mgmt-price">{formatCurrency(order.totalPrice)}</td>
                                <td>{PAYMENT_METHOD[order.payMethod]||"Không xác định"}</td>
                                <td><span className="admin-order-mgmt-sku-codes">{getSkuCodes(order.details)}</span></td>
                                <td>
                                    <button className="admin-order-mgmt-view-btn" onClick={()=>setSelectedOrderId(order.id)}>Chi tiết</button>
                                    {activeTab==="awaiting" && <button className="admin-order-mgmt-ship-btn" onClick={()=>handleChangeStatus(order.id)} disabled={processingOrderIds.includes(order.id)}>{processingOrderIds.includes(order.id)?"Đang xử lý...":"Giao hàng"}</button>}
                                    {activeTab==="shipping" && <button className="admin-order-mgmt-deliver-btn" onClick={()=>handleChangeStatus(order.id)} disabled={processingOrderIds.includes(order.id)}>{processingOrderIds.includes(order.id)?"Đang xử lý...":"Xác nhận đã giao"}</button>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrderId && <OrderDetailModal orderId={selectedOrderId} onClose={()=>setSelectedOrderId(null)} />}
        </div>
    )
}

export default OrderManagement
