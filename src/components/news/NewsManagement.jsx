"use client"

import React, { useState, useContext, useEffect, useRef } from "react"
import "../../styles/NewsManagement.css"

const API_BASE = "http://localhost:8080/news"

// Thay thế bằng AuthContext thực tế của bạn
const AuthContext = React.createContext({
    isAuthenticated: true,
    user: { role: "ADMIN", name: "Admin User" },
})

// Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null)
    const fileInputRef = useRef(null)

    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        editorRef.current.focus()
        updateContent()
    }

    const updateContent = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files)
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const img = `<img src="${e.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`
                    insertAtCursor(img)
                }
                reader.readAsDataURL(file)
            }
        })
        event.target.value = "" // Reset input
    }

    const insertAtCursor = (html) => {
        editorRef.current.focus()
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            const div = document.createElement("div")
            div.innerHTML = html
            const fragment = document.createDocumentFragment()
            while (div.firstChild) {
                fragment.appendChild(div.firstChild)
            }
            range.insertNode(fragment)
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
        } else {
            editorRef.current.innerHTML += html
        }
        updateContent()
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const text = e.clipboardData.getData("text/plain")
        document.execCommand("insertText", false, text)
        updateContent()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        files.forEach((file) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const img = `<img src="${event.target.result}" alt="Dropped image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`
                    insertAtCursor(img)
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    return (
        <div className="rich-editor-container">
            <div className="rich-editor-toolbar">
                <button type="button" className="toolbar-btn" onClick={() => handleCommand("bold")} title="Bold">
                    <strong>B</strong>
                </button>
                <button type="button" className="toolbar-btn" onClick={() => handleCommand("italic")} title="Italic">
                    <em>I</em>
                </button>
                <button type="button" className="toolbar-btn" onClick={() => handleCommand("underline")} title="Underline">
                    <u>U</u>
                </button>
                <div className="toolbar-separator"></div>
                <button type="button" className="toolbar-btn" onClick={() => handleCommand("justifyLeft")} title="Align Left">
                    ⬅️
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand("justifyCenter")}
                    title="Align Center"
                >
                    ↔️
                </button>
                <button type="button" className="toolbar-btn" onClick={() => handleCommand("justifyRight")} title="Align Right">
                    ➡️
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand("insertUnorderedList")}
                    title="Bullet List"
                >
                    • List
                </button>
                <button
                    type="button"
                    className="toolbar-btn"
                    onClick={() => handleCommand("insertOrderedList")}
                    title="Numbered List"
                >
                    1. List
                </button>
                <div className="toolbar-separator"></div>
                <button
                    type="button"
                    className="toolbar-btn toolbar-btn-image"
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert Image"
                >
                    🖼️ Thêm Ảnh
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                />
            </div>
            <div
              ref={editorRef}
              className="rich-editor-content"
              contentEditable
              dir="ltr"                            // ép LTR ngay trên thẻ
              onInput={updateContent}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              data-placeholder={placeholder}
            />
        </div>
    )
}

const NewsManagement = () => {
    const { isAuthenticated, user } = useContext(AuthContext)
    const isAdmin = user?.role === "ADMIN"
    const isStaff = user?.role === "STAFF"

    const [newsList, setNewsList] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isViewModalVisible, setIsViewModalVisible] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [currentNews, setCurrentNews] = useState({
        id: null,
        newsCode: "",
        title: "",
        detail: "",
    })
    const [selectedNews, setSelectedNews] = useState(null)
    const [images, setImages] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState("")

    // Fetch news data from API
    useEffect(() => {
        if (isAuthenticated && (isAdmin || isStaff)) {
            fetchNews()
        }
    }, [isAuthenticated, isAdmin, isStaff])

    // Filter news based on search only
    const filteredNews = newsList.filter((news) => {
        const matchesSearch =
            news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.newsCode.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    // Statistics - chỉ tổng số tin tức
    const totalNews = newsList.length

    const fetchNews = async () => {
        setLoading(true)
        setError("")
        try {
            const response = await fetch(`${API_BASE}/getAllNews`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success && result.data) {
                setNewsList(result.data)
            } else {
                setNewsList(result.data || [])
            }
        } catch (error) {
            console.error("Error fetching news:", error)
            setError("Không thể tải danh sách tin tức. Vui lòng thử lại.")
            setNewsList([])
        } finally {
            setLoading(false)
        }
    }

    const fetchNewsById = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/getNewsById?id=${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            return result.data
        } catch (error) {
            console.error("Error fetching news by ID:", error)
            setError("Không thể tải chi tiết tin tức.")
            return null
        }
    }

    const showModal = (news = null) => {
        if (!isAdmin && !isStaff) return
        if (news) {
            setIsEdit(true)
            setCurrentNews({
                id: news.id,
                newsCode: news.newsCode,
                title: news.title,
                detail: news.detail,
            })
        } else {
            setIsEdit(false)
            setCurrentNews({
                id: null,
                newsCode: "",
                title: "",
                detail: "",
            })
        }
        setImages([])
        setError("")
        setIsModalVisible(true)
    }

    const showViewModal = async (news) => {
        setLoading(true)
        const fullNews = await fetchNewsById(news.id)
        if (fullNews) {
            setSelectedNews(fullNews)
            setIsViewModalVisible(true)
        }
        setLoading(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        setCurrentNews({ id: null, newsCode: "", title: "", detail: "" })
        setImages([])
        setError("")
    }

    const handleDelete = async (id) => {
        if (!isAdmin) return
        if (window.confirm("Bạn có chắc muốn xóa tin tức này?")) {
            try {
                const response = await fetch(`${API_BASE}/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                    },
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                await fetchNews()
                setError("")
            } catch (error) {
                console.error("Error deleting news:", error)
                setError("Không thể xóa tin tức. Vui lòng thử lại.")
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setCurrentNews((prev) => ({ ...prev, [name]: value }))
    }

    const handleDetailChange = (content) => {
        setCurrentNews((prev) => ({ ...prev, detail: content }))
    }

    const handleFileChange = (e) => {
        setImages(Array.from(e.target.files))
    }

    const handleSubmit = async () => {
        if (!isAdmin && !isStaff) return

        if (!currentNews.newsCode.trim() || !currentNews.title.trim() || !currentNews.detail.trim()) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const formData = new FormData()

            const newsData = {
                newsCode: currentNews.newsCode.trim(),
                title: currentNews.title.trim(),
                detail: currentNews.detail.trim(),
            }

            formData.append("news", new Blob([JSON.stringify(newsData)], { type: "application/json" }))

            images.forEach((file) => {
                formData.append("images", file)
            })

            const config = {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
                },
                body: formData,
            }

            const url = isEdit ? `${API_BASE}/updateNewById/${currentNews.id}` : `${API_BASE}/createNews`

            const response = await fetch(url, config)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success || result.data) {
                await fetchNews()
                setIsModalVisible(false)
                handleCancel()
            } else {
                throw new Error(result.message || "Có lỗi xảy ra")
            }
        } catch (error) {
            console.error("Error saving news:", error)
            setError(isEdit ? "Không thể cập nhật tin tức. Vui lòng thử lại." : "Không thể tạo tin tức. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    // Helper function to strip HTML tags for preview
    const stripHtml = (html) => {
        const tmp = document.createElement("DIV")
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ""
    }

    if (!isAuthenticated) {
        return (
            <div className="news-auth-error">
                <div className="news-error-card">
                    <div className="news-error-icon">🔒</div>
                    <h3>Yêu cầu đăng nhập</h3>
                    <p>Vui lòng đăng nhập để quản lý tin tức.</p>
                </div>
            </div>
        )
    }

    if (!isAdmin && !isStaff) {
        return (
            <div className="news-auth-error">
                <div className="news-error-card">
                    <div className="news-error-icon">⚠️</div>
                    <h3>Không có quyền truy cập</h3>
                    <p>Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="news-management">
            {/* Header */}
            <div className="news-header">
                <div className="news-header-content">
                    <div className="news-title-section">
                        <h1 className="news-main-title">Quản Lý Tin Tức</h1>
                        <p className="news-subtitle">Quản lý và tổ chức các bài viết tin tức của cửa hàng</p>
                    </div>
                    {(isAdmin || isStaff) && (
                        <button className="news-btn news-btn-primary" onClick={() => showModal()}>
                            <span className="news-btn-icon">+</span>
                            Tạo Tin Tức Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="news-error-message">
                    <span className="news-error-text">⚠️ {error}</span>
                    <button className="news-error-close" onClick={() => setError("")}>
                        ×
                    </button>
                </div>
            )}

            {/* Statistics Card - Chỉ hiển thị tổng số tin tức */}
            <div className="news-stats-grid">
                <div className="news-stat-card">
                    <div className="news-stat-header">
                        <span className="news-stat-title">Tổng Tin Tức</span>
                        <div className="news-stat-icon news-stat-icon-total">📄</div>
                    </div>
                    <div className="news-stat-value">{totalNews}</div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="news-content-card">
                <div className="news-search-section">
                    <div className="news-search-container">
                        <div className="news-search-input-wrapper">
                            <span className="news-search-icon">🔍</span>
                            <input
                                type="text"
                                className="news-search-input"
                                placeholder="Tìm kiếm theo tiêu đề hoặc mã tin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="news-btn news-btn-secondary" onClick={fetchNews} disabled={loading}>
                            🔄 Làm mới
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="news-table-container">
                    <table className="news-table">
                        <thead>
                        <tr>
                            <th>Mã Tin</th>
                            <th>Tiêu Đề</th>
                            <th>Ngày Tạo</th>
                            <th>Hình Ảnh</th>
                            <th>Hành Động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="news-table-loading">
                                    <div className="news-loading-spinner"></div>
                                    <span>Đang tải...</span>
                                </td>
                            </tr>
                        ) : filteredNews.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="news-table-empty">
                                    {newsList.length === 0 ? "Chưa có tin tức nào" : "Không tìm thấy tin tức nào"}
                                </td>
                            </tr>
                        ) : (
                            filteredNews.map((news) => (
                                <tr key={news.id}>
                                    <td className="news-table-code">{news.newsCode}</td>
                                    <td className="news-table-title">
                                        <div className="news-title-content">
                                            <h4>{news.title}</h4>
                                            <p>{news.detail ? stripHtml(news.detail).substring(0, 80) + "..." : ""}</p>
                                        </div>
                                    </td>
                                    <td className="news-table-date">
                                        <span className="news-date-icon">📅</span>
                                        {news.createdAt || news.createDate || "N/A"}
                                    </td>
                                    <td className="news-table-images">
                                        <span className="news-image-icon">🖼️</span>
                                        {news.images?.length || 0}
                                    </td>
                                    <td className="news-table-actions">
                                        <button
                                            className="news-action-btn news-action-view"
                                            onClick={() => showViewModal(news)}
                                            title="Xem chi tiết"
                                        >
                                            👁️
                                        </button>
                                        {(isAdmin || isStaff) && (
                                            <button
                                                className="news-action-btn news-action-edit"
                                                onClick={() => showModal(news)}
                                                title="Chỉnh sửa"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button
                                                className="news-action-btn news-action-delete"
                                                onClick={() => handleDelete(news.id)}
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalVisible && (
                <div className="news-modal-overlay" onClick={handleCancel}>
                    <div className="news-modal-content news-large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="news-modal-header">
                            <h3 className="news-modal-title">
                                <span className="news-modal-icon">{isEdit ? "✏️" : "+"}</span>
                                {isEdit ? "Cập Nhật Tin Tức" : "Tạo Tin Tức Mới"}
                            </h3>
                            <button className="news-modal-close" onClick={handleCancel}>
                                ×
                            </button>
                        </div>

                        <div className="news-modal-body">
                            {error && <div className="news-form-error">⚠️ {error}</div>}

                            <div className="news-form-group">
                                <label className="news-form-label">Mã Tin Tức *</label>
                                <input
                                    type="text"
                                    name="newsCode"
                                    className="news-form-input"
                                    value={currentNews.newsCode}
                                    onChange={handleChange}
                                    placeholder="VD: NEWS001"
                                    required
                                />
                            </div>

                            <div className="news-form-group">
                                <label className="news-form-label">Tiêu Đề *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="news-form-input"
                                    value={currentNews.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tiêu đề tin tức..."
                                    required
                                />
                            </div>

                            <div className="news-form-group">
                                <label className="news-form-label">Nội Dung Chi Tiết *</label>
                                <RichTextEditor
                                    value={currentNews.detail}
                                    onChange={handleDetailChange}
                                    placeholder="Nhập nội dung chi tiết... Bạn có thể thêm ảnh bằng cách nhấn nút 'Thêm Ảnh' hoặc kéo thả ảnh vào đây."
                                />
                            </div>

                            <div className="news-form-group">
                                <label className="news-form-label">Tệp Đính Kèm Bổ Sung</label>
                                <div className="news-upload-area">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="news-upload-input"
                                        id="news-upload"
                                    />
                                    <label htmlFor="news-upload" className="news-upload-label">
                                        <div className="news-upload-icon">📁</div>
                                        <div className="news-upload-text">
                                            <p>
                                                <strong>Tệp đính kèm bổ sung</strong>
                                            </p>
                                            <p className="news-upload-hint">PNG, JPG, GIF (MAX. 10MB)</p>
                                        </div>
                                    </label>
                                </div>
                                {images.length > 0 && <div className="news-upload-info">Đã chọn {images.length} file</div>}
                            </div>
                        </div>

                        <div className="news-modal-footer">
                            <button className="news-btn news-btn-secondary" onClick={handleCancel} disabled={loading}>
                                Hủy
                            </button>
                            <button className="news-btn news-btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Đang xử lý..." : isEdit ? "Cập Nhật" : "Tạo Mới"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalVisible && selectedNews && (
                <div className="news-modal-overlay" onClick={() => setIsViewModalVisible(false)}>
                    <div className="news-modal-content news-view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="news-modal-header">
                            <h3 className="news-modal-title">
                                <span className="news-modal-icon">👁️</span>
                                Chi Tiết Tin Tức
                            </h3>
                            <button className="news-modal-close" onClick={() => setIsViewModalVisible(false)}>
                                ×
                            </button>
                        </div>

                        <div className="news-modal-body">
                            <div className="news-view-item">
                                <label className="news-view-label">Mã Tin Tức</label>
                                <p className="news-view-value">{selectedNews.newsCode}</p>
                            </div>

                            <div className="news-view-item">
                                <label className="news-view-label">Tiêu Đề</label>
                                <h2 className="news-view-title">{selectedNews.title}</h2>
                            </div>

                            <div className="news-view-divider"></div>

                            <div className="news-view-item">
                                <label className="news-view-label">Nội Dung</label>
                                <div className="news-view-content news-rich-content">
                                    <div dangerouslySetInnerHTML={{ __html: selectedNews.detail }} />
                                </div>
                            </div>

                            <div className="news-view-meta">
                                <div className="news-view-meta-item">
                                    <span className="news-meta-icon">📅</span>
                                    Ngày tạo: {selectedNews.createdAt || selectedNews.createDate || "N/A"}
                                </div>
                                <div className="news-view-meta-item">
                                    <span className="news-meta-icon">🖼️</span>
                                    {selectedNews.images?.length || 0} hình ảnh
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NewsManagement
