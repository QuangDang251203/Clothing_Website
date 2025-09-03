"use client"

import { useState, useEffect } from "react"
import storeSystemService from "../../services/StoreSystemService"
import "../../styles/StoreSystemManagement.css"

export default function StoreSystemManagement() {
    const [storeSystems, setStoreSystems] = useState([])
    const [newStore, setNewStore] = useState({
        merchantCode: "",
        merchantName: "",
        address: "",
        phone: "",
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchStoreSystems()
    }, [])

    const fetchStoreSystems = async () => {
        try {
            setLoading(true)
            const data = await storeSystemService.getAllStore()
            setStoreSystems(data)
        } catch (error) {
            console.error("Lỗi khi lấy danh sách store:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewStoreChange = (e) => {
        const { name, value } = e.target
        setNewStore((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleAddStore = async () => {
        if (
            !newStore.merchantCode.trim() ||
            !newStore.merchantName.trim() ||
            !newStore.address.trim() ||
            !newStore.phone.trim()
        ) {
            alert("Vui lòng điền đầy đủ thông tin trước khi thêm.")
            return
        }

        try {
            await storeSystemService.createStore({
                merchantCode: newStore.merchantCode,
                merchantName: newStore.merchantName,
                address: newStore.address,
                phone: newStore.phone,
            })
            setNewStore({ merchantCode: "", merchantName: "", address: "", phone: "" })
            fetchStoreSystems()
        } catch (error) {
            console.error("Lỗi khi tạo cửa hàng mới:", error)
            alert("Tạo cửa hàng thất bại. Có thể mã merchantCode đã tồn tại.")
        }
    }

    const handleEditChange = (index, e) => {
        const { name, value } = e.target
        setStoreSystems((prev) => {
            const copy = [...prev]
            copy[index] = {
                ...copy[index],
                [name]: value,
            }
            return copy
        })
    }

    const handleUpdateStore = async (index) => {
        const store = storeSystems[index]
        const payload = {
            merchantCode: store.merchantCode,
            merchantName: store.merchantName,
            address: store.address,
            phone: store.phone,
        }
        try {
            await storeSystemService.updateStore(store.id, payload)
            fetchStoreSystems()
        } catch (error) {
            console.error("Lỗi khi cập nhật store:", error)
            alert("Cập nhật thất bại.")
        }
    }

    const handleChangeStatus = async (index) => {
        const store = storeSystems[index]
        const isActive = store.status === 1
        const confirmText = isActive
            ? "Bạn có chắc chắn muốn chuyển sang Inactive?"
            : "Bạn có chắc chắn muốn chuyển sang Active?"
        if (!window.confirm(confirmText)) {
            return
        }
        try {
            await storeSystemService.changeStatusStore(store.id)
            setStoreSystems((prev) => {
                const copy = [...prev]
                copy[index] = {
                    ...copy[index],
                    status: isActive ? 0 : 1,
                }
                return copy
            })
        } catch (error) {
            console.error("Lỗi khi đổi trạng thái:", error)
            alert("Đổi trạng thái thất bại.")
        }
    }

    const filteredStores = storeSystems.filter(
        (store) =>
            store.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.merchantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (loading) {
        return (
            <div className="store-system-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="store-system-container">
            <div className="header-section">
                <div className="title-section">
                    <h1 className="page-title">
                        <span className="title-icon">🏪</span>
                        Quản lý Cửa hàng
                    </h1>
                    <p className="page-subtitle">Quản lý thông tin các cửa hàng trong hệ thống</p>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã hoặc địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            {/* Add New Store Card */}
            <div className="add-store-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <span className="card-icon">➕</span>
                        Thêm cửa hàng mới
                    </h3>
                </div>
                <div className="card-content">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Mã cửa hàng</label>
                            <input
                                type="text"
                                name="merchantCode"
                                value={newStore.merchantCode}
                                onChange={handleNewStoreChange}
                                placeholder="Nhập mã cửa hàng"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tên cửa hàng</label>
                            <input
                                type="text"
                                name="merchantName"
                                value={newStore.merchantName}
                                onChange={handleNewStoreChange}
                                placeholder="Nhập tên cửa hàng"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={newStore.address}
                                onChange={handleNewStoreChange}
                                placeholder="Nhập địa chỉ"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={newStore.phone}
                                onChange={handleNewStoreChange}
                                placeholder="Nhập số điện thoại"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleAddStore}>
                            <span className="btn-icon">✓</span>
                            Thêm cửa hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Stores List */}
            <div className="stores-section">
                <div className="section-header">
                    <h3 className="section-title">Danh sách cửa hàng ({filteredStores.length})</h3>
                </div>

                <div className="stores-grid">
                    {filteredStores.map((store, idx) => (
                        <div key={store.id} className="store-card">
                            <div className="store-card-header">
                                <div className="store-status">
                  <span className={`status-badge ${store.status === 1 ? "active" : "inactive"}`}>
                    {store.status === 1 ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                                </div>
                                <div className="store-actions">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleUpdateStore(idx)}
                                        title="Lưu thay đổi"
                                    >
                                        💾
                                    </button>
                                    <button
                                        className="btn btn-sm btn-warning"
                                        onClick={() => handleChangeStatus(idx)}
                                        title="Đổi trạng thái"
                                    >
                                        🔄
                                    </button>
                                </div>
                            </div>

                            <div className="store-card-content">
                                <div className="form-group">
                                    <label className="form-label">Mã cửa hàng</label>
                                    <input
                                        type="text"
                                        name="merchantCode"
                                        value={store.merchantCode}
                                        onChange={(e) => handleEditChange(idx, e)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Tên cửa hàng</label>
                                    <input
                                        type="text"
                                        name="merchantName"
                                        value={store.merchantName}
                                        onChange={(e) => handleEditChange(idx, e)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={store.address}
                                        onChange={(e) => handleEditChange(idx, e)}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={store.phone}
                                        onChange={(e) => handleEditChange(idx, e)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredStores.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🏪</div>
                        <h3>Không tìm thấy cửa hàng nào</h3>
                        <p>Thử thay đổi từ khóa tìm kiếm hoặc thêm cửa hàng mới</p>
                    </div>
                )}
            </div>
        </div>
    )
}
