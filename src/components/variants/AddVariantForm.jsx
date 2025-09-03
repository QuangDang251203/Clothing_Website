"use client"

import { useState } from "react"
import ProductVariantService from "../../services/ProductVariantService"
import ImportRecordService from "../../services/ImportRecordService"
import "../../styles/AddVariantForm.css"

const AddVariantForm = ({ productId, onAdded }) => {
    const [form, setForm] = useState({
        skuCode: "",
        size: "",
        color: "",
        price: "",
        quantity: "",
        costPrice: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const createDto = {
            productId,
            skuCode: form.skuCode,
            size: form.size,
            color: form.color,
            price: Number(form.price),
            quantity: 0,
        }

        try {
            await ProductVariantService.createVariant(createDto)

            const qty = Number(form.quantity)
            const cost = Number(form.costPrice)
            if (form.skuCode && qty > 0 && cost > 0) {
                await ImportRecordService.importGoods({
                    skuCode: form.skuCode,
                    quantity: qty,
                    costPrice: cost,
                })
            }

            setForm({ skuCode: "", size: "", color: "", price: "", quantity: "", costPrice: "" })
            onAdded()
        } catch (err) {
            alert("Lỗi khi tạo variant hoặc lưu lịch sử nhập: " + err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="add-variant-card">
            <div className="card-header">
                <h3 className="card-title">
                    <span className="title-icon">➕</span>
                    Thêm Variant Mới
                </h3>
            </div>
            <div className="card-content">
                <form onSubmit={handleSubmit} className="variant-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="skuCode" className="form-label">
                                SKU Code *
                            </label>
                            <input
                                id="skuCode"
                                name="skuCode"
                                type="text"
                                placeholder="Nhập mã SKU"
                                className="form-input"
                                value={form.skuCode}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="size" className="form-label">
                                Kích cỡ
                            </label>
                            <input
                                id="size"
                                name="size"
                                type="text"
                                placeholder="S, M, L, XL..."
                                className="form-input"
                                value={form.size}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="color" className="form-label">
                                Màu sắc
                            </label>
                            <input
                                id="color"
                                name="color"
                                type="text"
                                placeholder="Đỏ, Xanh, Vàng..."
                                className="form-input"
                                value={form.color}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantity" className="form-label">
                                Số lượng nhập *
                            </label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                placeholder="0"
                                className="form-input"
                                value={form.quantity}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="costPrice" className="form-label">
                                Giá nhập *
                            </label>
                            <input
                                id="costPrice"
                                name="costPrice"
                                type="number"
                                placeholder="0"
                                className="form-input"
                                value={form.costPrice}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price" className="form-label">
                                Giá bán *
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                placeholder="0"
                                className="form-input"
                                value={form.price}
                                onChange={handleChange}
                                min="1000"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" disabled={isSubmitting} className="btn-submit">
                            {isSubmitting ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">📦</span>
                                    Thêm variant
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddVariantForm
