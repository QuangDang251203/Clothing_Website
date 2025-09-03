"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import ProductService from "../../services/ProductService"
import CategoryService from "../../services/CategoryService"
import ImportRecordService from "../../services/ImportRecordService"
import "../../styles/AddProductPage.css"

const AddProductPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        category: "",
        productCode: "",
        productName: "",
        description: "",
        status: 1,
        variants: [
            { size: "", color: "", skuCode: "", price: "", quantity: "", costPrice: "" },
        ],
    })
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        CategoryService.getAllCategories()
            .then((list) => setCategories(list))
            .catch(() => setCategories([]))
    }, [])

    useEffect(
        () => () => {
            images.forEach((img) => URL.revokeObjectURL(img.preview))
        },
        [images],
    )

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleVariantChange = (e, idx) => {
        const { name, value } = e.target
        setFormData((prev) => {
            const vars = [...prev.variants]
            vars[idx][name] = value
            return { ...prev, variants: vars }
        })
    }

    const addVariantField = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                { size: "", color: "", skuCode: "", price: "", quantity: "", costPrice: "" },
            ],
        }))
    }

    const removeVariant = (idx) => {
        if (formData.variants.length > 1) {
            setFormData((prev) => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== idx),
            }))
        }
    }

    const handleImageClick = () => fileInputRef.current.click()

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 9 - images.length)
        const newImgs = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
        setImages((prev) => [...prev, ...newImgs])
        e.target.value = null
    }

    const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx))

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Kiểm tra tồn tại ít nhất 1 ảnh
        if (images.length < 1) {
            alert("Bạn phải chọn ít nhất 1 ảnh sản phẩm")
            return
        }

        // Kiểm tra duplicate SKU trên client
        const skuList = formData.variants.map((v) => v.skuCode.trim()).filter((s) => s)
        const dupSku = skuList.find((sku, idx) => skuList.indexOf(sku) !== idx)
        if (dupSku) {
            alert(`Trùng SKU Code: ${dupSku}. Vui lòng kiểm tra lại các biến thể.`)
            return
        }

        setIsLoading(true)

        // Chuẩn bị dữ liệu tạo sản phẩm
        const productData = { ...formData }
        const variantsWithQuantity = formData.variants.map((v) => ({
            skuCode: v.skuCode,
            quantity: Number(v.quantity),
            costPrice: Number(v.costPrice),
        }))
        productData.variants = formData.variants.map((v) => ({
            size: v.size,
            color: v.color,
            skuCode: v.skuCode,
            price: Number(v.price),
            quantity: 0,
        }))

        const payload = new FormData()
        payload.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }))
        images.forEach((img) => payload.append("images", img.file))

        try {
            // Gọi API tạo sản phẩm
            await ProductService.createProduct(payload)

            // Lưu lịch sử nhập hàng
            const importPromises = variantsWithQuantity.map((variant) => {
                if (variant.skuCode && variant.quantity > 0 && variant.costPrice) {
                    return ImportRecordService.importGoods({
                        skuCode: variant.skuCode,
                        quantity: variant.quantity,
                        costPrice: variant.costPrice,
                    })
                }
                return Promise.resolve()
            })
            await Promise.all(importPromises)

            navigate("/admin/products", {
                state: { message: "Tạo sản phẩm và lưu lịch sử nhập hàng thành công!" },
            })
        } catch (err) {
            if (err.response?.status === 409) {
                alert(err.response.data?.message || "Mã sản phẩm đã tồn tại!")
            } else {
                console.error(err)
                alert("Có lỗi xảy ra khi tạo sản phẩm!")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="add-product-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate("/admin/products")}>
                    <ArrowLeft size={20} /> Quay lại
                </button>
                <h1 className="page-title">Thêm sản phẩm mới</h1>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="product-form">
                    {/* Thông tin cơ bản */}
                    <div className="form-section">
                        <h2 className="section-title">Thông tin cơ bản</h2>
                        <div className="form-grid">
                            {/* Loại */}
                            <div className="form-group">
                                <label className="form-label">Loại sản phẩm *</label>
                                <select
                                    name="category"
                                    className="form-input"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Chọn loại --</option>
                                    {categories.map((c) => (
                                        <option key={c.categoryCode} value={c.categoryCode}>
                                            {c.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mã */}
                            <div className="form-group">
                                <label className="form-label">Mã sản phẩm *</label>
                                <input
                                    name="productCode"
                                    className="form-input"
                                    value={formData.productCode}
                                    onChange={handleChange}
                                    placeholder="Nhập mã sản phẩm"
                                    required
                                />
                            </div>

                            {/* Tên */}
                            <div className="form-group full-width">
                                <label className="form-label">Tên sản phẩm *</label>
                                <input
                                    name="productName"
                                    className="form-input"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm"
                                    required
                                />
                            </div>

                            {/* Mô tả */}
                            <div className="form-group full-width">
                                <label className="form-label">Mô tả *</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả sản phẩm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hình ảnh */}
                    <div className="form-section">
                        <h2 className="section-title">Hình ảnh sản phẩm</h2>
                        <div className="image-upload-section">
                            <div className="image-grid">
                                {images.map((img, idx) => (
                                    <div key={idx} className="image-item">
                                        <img src={img.preview} alt="preview" className="preview-image" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="remove-image-btn"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 9 && (
                                    <div onClick={handleImageClick} className="image-upload-placeholder">
                                        <Upload size={24} /> Thêm hình ảnh <small>({images.length}/9)</small>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={handleFilesChange}
                            />
                            <p className="upload-note">
                                * Tối thiểu 1 ảnh, tối đa 9 ảnh. Định dạng: JPG, PNG, GIF
                            </p>
                        </div>
                    </div>

                    {/* Biến thể */}
                    <div className="form-section">
                        <div className="section-header">
                            <h2 className="section-title">Biến thể sản phẩm</h2>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={addVariantField}
                            >
                                <Plus size={16} /> Thêm biến thể
                            </button>
                        </div>
                        <div className="variants-container">
                            {formData.variants.map((variant, idx) => (
                                <div key={idx} className="variant-item">
                                    <div className="variant-header">
                                        <span className="variant-number">Biến thể #{idx + 1}</span>
                                        {formData.variants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(idx)}
                                                className="remove-variant-btn"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="variant-grid">
                                        <div className="form-group">
                                            <label className="form-label">SKU Code *</label>
                                            <input
                                                name="skuCode"
                                                className="form-input"
                                                value={variant.skuCode}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="Mã SKU"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Kích cỡ</label>
                                            <input
                                                name="size"
                                                className="form-input"
                                                value={variant.size}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="S, M, L, XL..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Màu sắc</label>
                                            <input
                                                name="color"
                                                className="form-input"
                                                value={variant.color}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="Đỏ, Xanh, Vàng..."
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giá bán *</label>
                                            <input
                                                name="price"
                                                type="number"
                                                className="form-input"
                                                value={variant.price}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="0"
                                                min="1000"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Giá nhập **</label>
                                            <input
                                                name="costPrice"
                                                type="number"
                                                className="form-input"
                                                value={variant.costPrice}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="0"
                                                min="1000"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Số lượng nhập *</label>
                                            <input
                                                name="quantity"
                                                type="number"
                                                className="form-input"
                                                value={variant.quantity}
                                                onChange={(e) => handleVariantChange(e, idx)}
                                                placeholder="0"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nút submit */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate("/admin/products")}
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? "Đang tạo..." : "Tạo sản phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddProductPage
