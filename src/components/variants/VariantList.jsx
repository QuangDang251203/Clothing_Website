"use client"

import { useEffect, useState } from "react"
import ProductVariantService from "../../services/ProductVariantService"
import ProductService from "../../services/ProductService"
import ImportRecordService from "../../services/ImportRecordService"
import VariantItem from "./VariantItem"
import AddVariantForm from "./AddVariantForm"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import "../../styles/VariantList.css"

export default function VariantList() {
    const [products, setProducts] = useState([])
    const [variants, setVariants] = useState([])
    const [filterProductId, setFilterProductId] = useState("")

    // Import modal state
    const [importSku, setImportSku] = useState(null)
    const [importQty, setImportQty] = useState(1)
    const [importCost, setImportCost] = useState("")
    const [showImportModal, setShowImportModal] = useState(false)

    // History modal state
    const [showHistory, setShowHistory] = useState(false)
    const [histData, setHistData] = useState([])
    const [skuFilter, setSkuFilter] = useState("")
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)


    useEffect(() => {
        ProductService.getAllProducts({ page: 1, row: 1000 })
            .then((res) => setProducts(res.data))
            .catch(console.error)
        loadAllVariants()
    }, [])

    const loadAllVariants = () => {
        ProductVariantService.getAllVariants({ page: 1, row: 100 })
            .then((res) => setVariants(res.data.data))
            .catch(console.error)
    }
    const handlePriceUpdated = (skuCode, newPrice) => {
        setVariants((list) =>
            list.map((v) =>
                v.skuCode === skuCode ? { ...v, price: newPrice } : v
            )
        )
    }
    const loadVariantsByProduct = () => {
        const id = Number.parseInt(filterProductId, 10)
        if (isNaN(id)) {
            alert("Vui lòng chọn sản phẩm hợp lệ")
            return
        }
        ProductVariantService.getByProduct(id)
            .then((res) => setVariants(res.data.data))
            .catch(console.error)
    }

    const openImport = (sku) => {
        setImportSku(sku)
        setImportQty(1)
        setImportCost("")
        setShowImportModal(true)
    }

    const submitImport = () => {
        if (!window.confirm(`Nhập ${importQty} cho SKU ${importSku}?`)) return
        ImportRecordService.importGoods({ skuCode: importSku, quantity: importQty, costPrice: Number(importCost) })
            .then(() => {
                setShowImportModal(false)
                filterProductId ? loadVariantsByProduct() : loadAllVariants()
            })
            .catch((err) => alert("Lỗi nhập hàng: " + err))
    }

    const openHistoryModal = (skuParam) => {
        const skuCodeParam = skuParam && skuParam.length > 0 ? skuParam : undefined
        setSkuFilter(skuParam || "")

        const params = {
            productId: filterProductId ? Number.parseInt(filterProductId, 10) : undefined,
            skuCode: skuCodeParam,
            from: fromDate ? fromDate.toISOString() : undefined,
            to: toDate ? toDate.toISOString() : undefined,
        }

        ImportRecordService.getHistory(params)
            .then((res) => {
                setHistData(res.data.data)
                setShowHistory(true)
            })
            .catch((err) => alert("Lỗi load lịch sử: " + err))
    }

    const exportExcel = () => {
        const sheet = XLSX.utils.json_to_sheet(
            histData.map((r) => ({
                SKU: r.skuCode,
                Quantity: r.quantity,
                Cost: r.costPrice,
                Date: new Date(r.createdAt).toLocaleString(),
            })),
        )
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, sheet, "ImportHistory")
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), "ImportHistory.xlsx")
    }

    return (
        <div className="variant-list-container">
            <div className="container-wrapper">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Quản lý Variants</h1>
                        <p className="page-subtitle">Quản lý các biến thể sản phẩm và lịch sử nhập hàng</p>
                    </div>
                    <div className="header-badge">{variants.length} variants</div>
                </div>

                {/* Filters */}
                <div className="filter-card">
                    <div className="filter-header">
                        <h3 className="filter-title">
                            <span className="filter-icon">🔍</span>
                            Bộ lọc
                        </h3>
                    </div>
                    <div className="filter-content">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">Sản phẩm</label>
                                <select
                                    className="filter-select"
                                    value={filterProductId}
                                    onChange={(e) => setFilterProductId(e.target.value)}
                                >
                                    <option value="">-- Chọn sản phẩm --</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.productCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-actions">
                                <button className="btn btn-primary" onClick={loadVariantsByProduct} disabled={!filterProductId}>
                                    <span className="btn-icon">🔍</span>
                                    Tìm
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setFilterProductId("")
                                        loadAllVariants()
                                    }}
                                >
                                    <span className="btn-icon">🔄</span>
                                    Tải lại tất cả
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSkuFilter("")
                                        setFromDate(null)
                                        setToDate(null)
                                        openHistoryModal()
                                    }}
                                >
                                    <span className="btn-icon">📋</span>
                                    Lịch sử nhập hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Variant Form */}
                <AddVariantForm
                    productId={filterProductId ? Number.parseInt(filterProductId, 10) : undefined}
                    onAdded={() => (filterProductId ? loadVariantsByProduct() : loadAllVariants())}
                />

                {/* Variants Table */}
                <div className="table-card">
                    <div className="table-header">
                        <h3 className="table-title">
                            <span className="table-icon">📦</span>
                            Danh sách Variants
                        </h3>
                    </div>
                    <div className="table-content">
                        <div className="table-wrapper">
                            <table className="variants-table">
                                <thead className="table-head">
                                <tr>
                                    <th className="table-th">SKU Code</th>
                                    <th className="table-th">Kích cỡ</th>
                                    <th className="table-th">Màu sắc</th>
                                    <th className="table-th">Giá bán</th>
                                    <th className="table-th">Giá nhập trung bình</th>
                                    <th className="table-th">Số lượng</th>
                                    <th className="table-th">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="table-body">
                                {variants.map((v) => (
                                    <VariantItem
                                        key={v.skuCode}
                                        variant={v}
                                        onImport={() => openImport(v.skuCode)}
                                        onViewHistory={() => openHistoryModal(v.skuCode)}
                                        onPriceUpdated={handlePriceUpdated}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Import Modal */}
                {showImportModal && (
                    <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
                        <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <span className="modal-icon">📦</span>
                                    Nhập hàng cho SKU: {importSku}
                                </h4>
                                <button className="modal-close" onClick={() => setShowImportModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">SKU Code</label>
                                    <input type="text" className="form-input" value={importSku || ""} readOnly />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Giá nhập</label>
                                    <input
                                        type="number"
                                        min="1000"
                                        className="form-input"
                                        value={importCost}
                                        onChange={(e) => setImportCost(e.target.value)}
                                        placeholder="Nhập giá..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Số lượng</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-input"
                                        value={importQty}
                                        onChange={(e) => setImportQty(Number(e.target.value))}
                                        placeholder="Nhập số lượng..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                                    Hủy
                                </button>
                                <button className="btn btn-success" onClick={submitImport}>
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Modal */}
                {showHistory && (
                    <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
                        <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    <span className="modal-icon">📋</span>
                                    Lịch sử nhập hàng
                                </h4>
                                <button className="modal-close" onClick={() => setShowHistory(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="history-filters">
                                    <div className="form-group">
                                        <label className="form-label">SKU Code</label>
                                        <input
                                            className="form-input"
                                            placeholder="Tìm theo SKU..."
                                            value={skuFilter}
                                            onChange={(e) => setSkuFilter(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Từ ngày</label>
                                        <DatePicker
                                            selected={fromDate}
                                            onChange={setFromDate}
                                            placeholderText="Từ ngày"
                                            className="form-input datepicker-input"
                                            showTimeSelect
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Đến ngày</label>
                                        <DatePicker
                                            selected={toDate}
                                            onChange={setToDate}
                                            placeholderText="Đến ngày"
                                            className="form-input datepicker-input"
                                            showTimeSelect
                                        />
                                    </div>
                                    <div className="filter-actions">
                                        <button className="btn btn-primary" onClick={() => openHistoryModal(skuFilter)}>
                                            <span className="btn-icon">🔍</span>
                                            Lọc
                                        </button>
                                        <button className="btn btn-success" onClick={exportExcel}>
                                            <span className="btn-icon">📊</span>
                                            Xuất Excel
                                        </button>
                                    </div>
                                </div>

                                <div className="history-table-wrapper">
                                    <table className="history-table">
                                        <thead>
                                        <tr>
                                            <th>SKU Code</th>
                                            <th>Quantity</th>
                                            <th>CostPrice</th>
                                            <th>CreatedAt</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {histData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-medium">{r.skuCode}</td>
                                                <td>{r.quantity}</td>
                                                <td>{r.costPrice}</td>
                                                <td className="text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
