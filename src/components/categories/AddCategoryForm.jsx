// src/components/AddCategoryForm.jsx
import React, { useState } from 'react';
import CategoryService from '../../services/CategoryService';
import '../../styles/CategoryList.css';

const AddCategoryForm = ({ onClose }) => {
    const [formData, setFormData] = useState({ categoryCode: '', categoryName: '' });

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        CategoryService.createCategory(formData)
            .then(() => onClose())
            .catch(err => alert('Lỗi tạo loại: ' + err));
    };

    return (
        <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
                <label>Mã loại</label>
                <input
                    name="categoryCode"
                    className="form-control"
                    value={formData.categoryCode}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>Tên loại</label>
                <input
                    name="categoryName"
                    className="form-control"
                    value={formData.categoryName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="d-flex justify-content-end form-actions">
                <button type="submit" className="btn btn-primary">Thêm</button>
                <button type="button" className="btn btn-secondary ml-2" onClick={onClose}>Hủy</button>
            </div>
        </form>
    );
};

export default AddCategoryForm;