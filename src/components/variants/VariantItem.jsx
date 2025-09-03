// VariantItem.jsx
"use client"

import { useState } from "react"
import ProductVariantService from "../../services/ProductVariantService"
import "../../styles/VariantItem.css"

const VariantItem = ({ variant, onImport, onViewHistory, onPriceUpdated }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [priceInput, setPriceInput] = useState(variant.price)

    const getQuantityBadge = (quantity) => {
        if (quantity === 0) return <span className="badge badge-danger">Hết hàng</span>
        if (quantity < 10) return <span className="badge badge-warning">Sắp hết</span>
        return <span className="badge badge-success">Còn hàng</span>
    }

    const savePrice = async () => {
        try {
            const payload = { newPrice: priceInput }
            await ProductVariantService.changePriceVariant(variant.skuCode, payload)
            setIsEditing(false)
            onPriceUpdated(variant.skuCode, priceInput)
        } catch (err) {
            alert("Lỗi khi lưu giá: " + err)
        }
    }

    return (
        <tr className="variant-row">
            <td className="variant-cell">
                <div className="sku-code">{variant.skuCode}</div>
            </td>
            <td className="variant-cell variant-size">{variant.size}</td>
            <td className="variant-cell">
                <div className="color-info">
                    <div
                        className="color-indicator"
                        style={{ backgroundColor: variant.color.toLowerCase() }}
                    />
                    <span className="color-text">{variant.color}</span>
                </div>
            </td>
            <td className="variant-cell variant-price">
                {isEditing ? (
                    <>
                        <input
                            type="number"
                            className="edit-price-input"
                            value={priceInput}
                            min="0"
                            onChange={(e) => setPriceInput(Number(e.target.value))}
                        />
                        <button className="btn-save-price" onClick={savePrice}>💾</button>
                    </>
                ) : (
                    <>
                        {variant.price?.toLocaleString?.("vi-VN") || variant.price}₫
                        <button className="btn-edit-price" onClick={() => setIsEditing(true)}>✏️</button>
                    </>
                )}
            </td>
            <td className="variant-cell variant-cost">
                {variant.averageCost?.toLocaleString?.("vi-VN") || variant.averageCost}₫
            </td>
            <td className="variant-cell">
                <div className="quantity-info">
                    <span className="quantity-number">{variant.quantity}</span>
                    {getQuantityBadge(variant.quantity)}
                </div>
            </td>
            <td className="variant-cell">
                <div className="action-buttons">
                    <button className="btn btn-import" onClick={() => onImport(variant.skuCode)}>
                        <span className="btn-icon">📦</span>
                        Nhập hàng
                    </button>
                    <button className="btn btn-history" onClick={() => onViewHistory(variant.skuCode)}>
                        <span className="btn-icon">📋</span>
                        Lịch sử
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default VariantItem