// src/services/CategoryService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const CategoryService = {
    // Lấy tất cả category
    getAllCategories: () =>
        axios.get(`${API_BASE}/category/getAllCategory`)
            .then(res => res.data),

    // Tạo mới category
    createCategory: (categoryDTO) =>
        axios.post(`${API_BASE}/category/createCategory`, categoryDTO)
            .then(res => res.data),

    // Cập nhật thông tin category, dùng PathVariable
    changeInfoCategory: (categoryCode, categoryDTO) =>
        axios.put(`${API_BASE}/category/changeInfoCategory/${categoryCode}`, categoryDTO)
            .then(res => res.data),

    // Đổi trạng thái category
    changeStatusCategory: (categoryCode) =>
        axios.put(`${API_BASE}/category/changeStatusCategory/${categoryCode}`)
            .then(res => res.data),
};

export default CategoryService;
