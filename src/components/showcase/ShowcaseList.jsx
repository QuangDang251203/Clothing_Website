"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import "../../styles/ShowcaseList.css"

const API_BASE = "http://localhost:8080"

const ShowcaseManagement = () => {
    const [showcases, setShowcases] = useState([])
    const [selected, setSelected] = useState(null)
    const [formData, setFormData] = useState({ label: "", link: "", image: null })
    const [creating, setCreating] = useState(false)

    // Fetch all showcases
    const fetchShowcases = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/showcase`)
            setShowcases(resp.data.data)
        } catch (err) {
            console.error("Error fetching showcases", err)
        }
    }

    useEffect(() => {
        fetchShowcases()
    }, [])

    // Open create form: clear selected and enable creating
    const openCreate = () => {
        setSelected(null)
        setFormData({ label: "", link: "", image: null })
        setCreating(true)
    }

    // Open edit form: clear creating flag and set selected
    const openEdit = (item) => {
        console.log("[Open Edit] item:", item)
        setCreating(false)
        setSelected(item)
        setFormData({ label: item.label, link: item.link, image: null })
    }

    // Close modal for both create and edit
    const closeModal = () => {
        setSelected(null)
        setCreating(false)
    }

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === "image") {
            setFormData((prev) => ({ ...prev, image: files[0] }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    // Submit for create or update
    const handleSubmit = async (e) => {
        e.preventDefault()
        const payload = new FormData()
        payload.append("label", formData.label)
        payload.append("link", formData.link)
        if (formData.image) payload.append("imageUrl", formData.image)

        try {
            if (creating) {
                // Create new showcase
                await axios.post(`${API_BASE}/showcase`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            } else if (selected) {
                // Update existing showcase
                await axios.put(`${API_BASE}/showcase/${selected.id}`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            }
            fetchShowcases()
            closeModal()
        } catch (err) {
            console.error("Submit failed", err)
        }
    }

    return (
        <div className="showcase-mgmt-container">
            <div className="showcase-mgmt-header">
                <h1 className="showcase-mgmt-title">Showcase</h1>
                <button className="showcase-mgmt-btn-create" onClick={openCreate}>
                    <span className="showcase-mgmt-btn-icon">+</span>
                    Tạo mới Showcase
                </button>
            </div>

            {/* Grid of existing showcases with Edit buttons */}
            <div className="showcase-mgmt-grid">
                {showcases.map((item) => (
                    <div key={item.id} className="showcase-mgmt-card">
                        <div className="showcase-mgmt-card-image">
                            <img src={item.imageUrl || "/placeholder.svg"} alt={item.label} />
                            <div className="showcase-mgmt-card-overlay">
                                <button className="showcase-mgmt-btn-edit" onClick={() => openEdit(item)}>
                                    Sửa
                                </button>
                            </div>
                        </div>
                        <div className="showcase-mgmt-card-content">
                            <h3 className="showcase-mgmt-card-title">{item.label}</h3>
                            <p className="showcase-mgmt-card-link">{item.link}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal form for create or edit */}
            {(creating || selected) && (
                <div className="showcase-mgmt-modal">
                    <div className="showcase-mgmt-modal-content">
                        <div className="showcase-mgmt-modal-header">
                            <h2 className="showcase-mgmt-modal-title">
                                {creating ? "Tạo mới Showcase" : `Sửa Showcase #${selected.id}`}
                            </h2>
                            <button className="showcase-mgmt-modal-close" onClick={closeModal} type="button">
                                ×
                            </button>
                        </div>

                        <form className="showcase-mgmt-form" onSubmit={handleSubmit}>
                            <div className="showcase-mgmt-form-group">
                                <label className="showcase-mgmt-form-label">Label:</label>
                                <input
                                    className="showcase-mgmt-form-input"
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập tên showcase"
                                />
                            </div>

                            <div className="showcase-mgmt-form-group">
                                <label className="showcase-mgmt-form-label">Link:</label>
                                <input
                                    className="showcase-mgmt-form-input"
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập đường dẫn"
                                />
                            </div>

                            <div className="showcase-mgmt-form-group">
                                <label className="showcase-mgmt-form-label">{creating ? "Ảnh:" : "Ảnh mới (nếu muốn đổi):"}</label>
                                <input
                                    className="showcase-mgmt-form-file"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    {...(creating ? { required: true } : {})}
                                />
                            </div>

                            <div className="showcase-mgmt-form-actions">
                                <button className="showcase-mgmt-btn-cancel" type="button" onClick={closeModal}>
                                    Hủy
                                </button>
                                <button className="showcase-mgmt-btn-submit" type="submit">
                                    {creating ? "Tạo mới" : "Cập nhật"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShowcaseManagement
