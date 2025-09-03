"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, Upload, X } from "lucide-react"
import ProductService from "../../services/ProductService"
import CategoryService from "../../services/CategoryService"
import "../../styles/EditProductPage.css"

const API_BASE = "http://localhost:8080"

const EditProductPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { productCode } = useParams()
    const product = location.state?.product

    const [formData, setFormData] = useState({
        productCode: "",
        productName: "",
        description: "",
        status: 1,
        category: "",
    })
    const [categories, setCategories] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef()

    useEffect(() => {
        CategoryService.getAllCategories()
            .then(setCategories)
            .catch(() => setCategories([]))
    }, [])

    useEffect(() => {
        if (!product) return
        setFormData({
            productCode: product.productCode,
            productName: product.productName,
            description: product.description,
            status: product.status,
            category: product.category,
        })
        setExistingImages(Array.isArray(product.imageURLs) ? product.imageURLs.map((i) => i.url) : [])
        setNewImages([])
    }, [product])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((fd) => ({ ...fd, [name]: value }))
    }

    const handleImageClick = () => fileInputRef.current.click()

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files)
        const slots = 9 - (existingImages.length + newImages.length)
        if (slots <= 0) return
        setNewImages((imgs) => [...imgs, ...files.slice(0, slots)])
        e.target.value = null
    }

    const removeNewImage = (idx) => {
        setNewImages((imgs) => imgs.filter((_, i) => i !== idx))
    }

    const removeExistingImage = (idx) => {
        setExistingImages((imgs) => imgs.filter((_, i) => i !== idx))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        const dto = { ...formData }
        dto.imageURLs = existingImages.map((url) => ({ url }))

        const payload = new FormData()
        payload.append("product", new Blob([JSON.stringify(dto)], { type: "application/json" }))
        newImages.forEach((file) => payload.append("images", file))

        try {
            await ProductService.changeInfoProduct(payload)
            navigate("/admin/products", { state: { message: "Cập nhật sản phẩm thành công!" } })
        } catch (err) {
            console.error(err)
            alert("Lỗi khi cập nhật sản phẩm!")
        } finally {
            setIsLoading(false)
        }
    }

    if (!product) {
        return (
            <div className="edit-product-page">
                <div className="error-state">
                    <h2>Không tìm thấy sản phẩm</h2>
                    <button className="btn-primary" onClick={() => navigate("/admin/products")}>
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="edit-product-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate("/admin/products")}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1 className="page-title">Chỉnh sửa sản phẩm</h1>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-section">
                        <h2 className="section-title">Thông tin cơ bản</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Mã sản phẩm</label>
                                <input name="productCode" className="form-input" value={formData.productCode} readOnly disabled />
                            </div>

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

                    <div className="form-section">
                        <h2 className="section-title">Hình ảnh sản phẩm</h2>
                        <div className="image-upload-section">
                            <div className="image-grid">
                                {existingImages.map((url, i) => (
                                    <div key={`old-${i}`} className="image-item">
                                        <img
                                            src={url.startsWith("http") ? url : API_BASE + url}
                                            alt=""
                                            className="preview-image"
                                            onError={(e) => (e.target.style.display = "none")}
                                        />
                                        <button type="button" onClick={() => removeExistingImage(i)} className="remove-image-btn">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {newImages.map((file, i) => (
                                    <div key={`new-${i}`} className="image-item">
                                        <img src={URL.createObjectURL(file) || "/placeholder.svg"} alt="" className="preview-image" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="remove-image-btn">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {existingImages.length + newImages.length < 9 && (
                                    <div onClick={handleImageClick} className="image-upload-placeholder">
                                        <Upload size={24} />
                                        <span>Thêm hình ảnh</span>
                                        <small>({existingImages.length + newImages.length}/9)</small>
                                    </div>
                                )}
                            </div>
                            <input type="file" accept="image/*" multiple hidden ref={fileInputRef} onChange={handleFilesChange} />
                            <p className="upload-note">* Tối đa 9 ảnh. Định dạng: JPG, PNG, GIF</p>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate("/admin/products")} disabled={isLoading}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProductPage
