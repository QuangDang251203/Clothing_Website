// src/components/EditCategoryForm.jsx
import React, { useState, useEffect } from 'react';
import CategoryService from '../../services/CategoryService';
import '../../styles/CategoryList.css';

const EditCategoryForm = ({ category, onClose }) => {
    const [formData, setFormData] = useState({ categoryName: '' });

    useEffect(() => {
        if (category) setFormData({ categoryName: category.categoryName });
    }, [category]);

    const handleChange = e => setFormData({ categoryName: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        CategoryService.changeInfoCategory(category.categoryCode, formData)
            .then(() => onClose())
            .catch(err => alert('Lỗi cập nhật loại: ' + err));
    };

    return (
        <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
                <label>Mã loại</label>
                <input
                    className="form-control"
                    value={category.categoryCode}
                    readOnly
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
                <button type="submit" className="btn btn-success">Lưu</button>
                <button type="button" className="btn btn-secondary ml-2" onClick={onClose}>Hủy</button>
            </div>
        </form>
    );
};

export default EditCategoryForm;
