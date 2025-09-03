"use client"
import { Edit, ToggleLeft, ToggleRight } from "lucide-react"
import "../../styles/ProductItem.css"

const API_BASE = "http://localhost:8080"

const ProductItem = ({ product, onEdit, onStatusChanged, viewMode = "table" }) => {
    const rawUrl = product.imageURLs?.[0]?.url
    const thumbUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `${API_BASE}${rawUrl}`) : null

    const isActive = product.status === 1

    if (viewMode === "grid") {
        return (
            <div className="product-card">
                <div className="product-image-container">
                    {thumbUrl ? (
                        <img
                            src={thumbUrl || "/placeholder.svg"}
                            alt={product.productName}
                            className="product-image"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                    ) : (
                        <div className="product-image-placeholder">
                            <span>📷</span>
                        </div>
                    )}
                    <div className={`status-badge ${isActive ? "active" : "inactive"}`}>
                        {isActive ? "Hoạt động" : "Tạm dừng"}
                    </div>
                </div>

                <div className="product-info">
                    <div className="product-code">{product.productCode}</div>
                    <h3 className="product-name">{product.productName}</h3>
                    <div className="product-meta">
                        <span className="product-category">{product.category}</span>
                        <span className="product-sales">{product.numberOfPurchase} lượt bán</span>
                    </div>
                </div>

                <div className="product-actions">
                    <button onClick={() => onEdit(product)} className="btn-action btn-edit" title="Chỉnh sửa">
                        <Edit size={16} />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => onStatusChanged(product.productCode)}
                        className={`btn-action btn-toggle ${isActive ? "active" : "inactive"}`}
                        title="Đổi trạng thái"
                    >
                        {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {isActive ? "Tắt" : "Bật"}
                    </button>
                </div>
                <div className="product-status-container">
          <span
              className={`product-status ${
                  product.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
          >
            {product.status === 1 ? "HOẠT ĐỘNG" : "NGỪNG BÁN"}
          </span>
                </div>
            </div>
        )
    }

    return (
        <tr className="product-row">
            <td className="product-code-cell">{product.productCode}</td>
            <td className="product-image-cell">
                {thumbUrl ? (
                    <img
                        src={thumbUrl || "/placeholder.svg"}
                        alt={product.productName}
                        className="product-thumb"
                        onError={(e) => (e.target.style.display = "none")}
                    />
                ) : (
                    <div className="product-thumb-placeholder">📷</div>
                )}
            </td>
            <td className="product-name-cell">{product.productName}</td>
            <td className="product-category-cell">{product.category}</td>
            <td className="product-sales-cell">{product.numberOfPurchase}</td>
            <td className="product-status-cell">
        <span
            className={`product-status ${
                product.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
        >
          {product.status === 1 ? "HOẠT ĐỘNG" : "NGỪNG BÁN"}
        </span>
            </td>
            <td className="product-actions-cell">
                <div className="table-actions">
                    <button onClick={() => onEdit(product)} className="btn-action btn-edit" title="Chỉnh sửa">
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={() => onStatusChanged(product.productCode)}
                        className={`btn-action btn-toggle ${isActive ? "active" : "inactive"}`}
                        title="Đổi trạng thái"
                    >
                        {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default ProductItem
