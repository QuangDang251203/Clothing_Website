// src/components/CategoryItem.jsx
import React from 'react';
import '../../styles/CategoryList.css';

const CategoryItem = ({ category, onEdit, onStatusChange }) => {
    return (
        <tr>
            <td>{category.categoryCode}</td>
            <td>{category.categoryName}</td>
            <td>{category.status === 1 ? 'Active' : 'Inactive'}</td>
            <td>
                <button onClick={() => onEdit(category)} className="btn btn-info btn-sm mr-2">
                    Chỉnh sửa
                </button>
                <button onClick={() => onStatusChange(category.categoryCode)} className="btn btn-warning btn-sm">
                    Đổi trạng thái
                </button>
            </td>
        </tr>
    );
};

export default CategoryItem;