// src/components/CategoryList.jsx
import React, { useEffect, useState } from 'react';
import CategoryService from '../../services/CategoryService';
import '../../styles/CategoryList.css';

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [adding, setAdding] = useState(false);
    const [newCat, setNewCat] = useState({ categoryCode: '', categoryName: '' });

    // editingIndex = index của row đang edit, -1 nếu không
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editCat, setEditCat] = useState({ categoryName: '' });

    const fetchData = () => {
        CategoryService.getAllCategories()
            .then(data => setCategories(data))
            .catch(err => console.error(err));
    };

    useEffect(fetchData, []);

    // ========== ADD ==========
    const startAdd = () => {
        setAdding(true);
        setNewCat({ categoryCode: '', categoryName: '' });
    };
    const cancelAdd = () => setAdding(false);

    const confirmAdd = () => {
        if (!newCat.categoryCode || !newCat.categoryName) {
            return alert('Phải điền đủ mã và tên loại');
        }
        if (window.confirm('Bạn có chắc chắn muốn thêm?')) {
            CategoryService.createCategory(newCat)
                .then(() => {
                    fetchData();
                    setAdding(false);
                })
                .catch(err => alert('Lỗi: ' + err));
        }
    };

    // ========== EDIT ==========
    const startEdit = (idx) => {
        setEditingIndex(idx);
        setEditCat({ categoryName: categories[idx].categoryName });
    };
    const cancelEdit = () => setEditingIndex(-1);

    const confirmEdit = (idx) => {
        const code = categories[idx].categoryCode;
        if (!editCat.categoryName) {
            return alert('Tên loại không được rỗng');
        }
        if (window.confirm('Bạn có chắc chắn muốn lưu thay đổi?')) {
            CategoryService.changeInfoCategory(code, editCat)
                .then(() => {
                    fetchData();
                    setEditingIndex(-1);
                })
                .catch(err => alert('Lỗi: ' + err));
        }
    };

    // ========== STATUS ==========
    const toggleStatus = (code) => {
        if (window.confirm('Bạn có chắc chắn muốn đổi trạng thái?')) {
            CategoryService.changeStatusCategory(code)
                .then(fetchData)
                .catch(err => alert('Lỗi: ' + err));
        }
    };

    return (
        <div className="category-list-container">
            <h2>Quản lý loại sản phẩm</h2>
            <button className="btn btn-primary mb-3" onClick={startAdd} disabled={adding || editingIndex !== -1}>
                Thêm loại mới
            </button>
            <table className="table">
                <thead>
                <tr>
                    <th>Mã loại</th>
                    <th>Tên loại</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {adding && (
                    <tr className="table-warning">
                        <td>
                            <input
                                className="form-control"
                                value={newCat.categoryCode}
                                onChange={e => setNewCat(n => ({ ...n, categoryCode: e.target.value }))}
                            />
                        </td>
                        <td>
                            <input
                                className="form-control"
                                value={newCat.categoryName}
                                onChange={e => setNewCat(n => ({ ...n, categoryName: e.target.value }))}
                            />
                        </td>
                        <td>—</td>
                        <td>
                            <button className="btn btn-success btn-sm mr-2" onClick={confirmAdd}>
                                Thêm
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={cancelAdd}>
                                Hủy
                            </button>
                        </td>
                    </tr>
                )}

                {categories.map((cat, idx) => (
                    <tr key={cat.categoryCode}>
                        <td>{cat.categoryCode}</td>
                        <td>
                            {editingIndex === idx ? (
                                <input
                                    className="form-control"
                                    value={editCat.categoryName}
                                    onChange={e => setEditCat({ categoryName: e.target.value })}
                                />
                            ) : (
                                cat.categoryName
                            )}
                        </td>
                        <td>{cat.status === 1 ? 'Active' : 'Inactive'}</td>
                        <td>
                            {editingIndex === idx ? (
                                <>
                                    <button className="btn btn-success btn-sm mr-2" onClick={() => confirmEdit(idx)}>
                                        Lưu
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-info btn-sm mr-2"
                                        onClick={() => startEdit(idx)}
                                        disabled={adding}
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => toggleStatus(cat.categoryCode)}
                                        disabled={adding}
                                    >
                                        Đổi trạng thái
                                    </button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
