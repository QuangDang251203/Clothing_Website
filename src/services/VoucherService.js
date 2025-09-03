// src/services/VoucherService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/voucher';

const VoucherService = {
    getAll: () =>
        axios.get(`${API_BASE}/getAllVouchers`).then((res) => res.data.data),

    getByCode: (code) =>
        axios.get(`${API_BASE}/getVoucherByCode/${code}`).then((res) => res.data.data),

    create: (dto) =>
        axios.post(`${API_BASE}/createVoucher`, dto).then((res) => res.data.data),

    update: (code, dto) =>
        axios.put(`${API_BASE}/updateVoucher/${code}`, dto).then((res) => res.data.data),

    changeStatus: (code) => axios.put(`${API_BASE}/changeStatus/${code}`),

    // =====================
    // Hàm getValidForCart (chuyển array thành productIds=..&productIds=..)
    // =====================
    getValidForCart: (cartTotal, productIds) => {
        // Tạo chuỗi "productIds=27&productIds=33" từ mảng [27, 33]
        const productIdsQuery = productIds
            .map((id) => `productIds=${encodeURIComponent(id)}`)
            .join('&');

        // Lấy string cartTotal và ghép thêm param productIds
        const url = `${API_BASE}/getValidForCart?cartTotal=${encodeURIComponent(
            cartTotal
        )}&${productIdsQuery}`;

        return axios.get(url).then((res) => res.data.data);
    },
};

export default VoucherService;
