// src/services/storeSystemService.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/storeSystem';

const storeSystemService = {
    // Lấy tất cả cửa hàng
    getAllStore: async () => {
        const response = await axios.get(`${API_URL}/getAllStore`);
        // ResponseToData<T> có cấu trúc { success, data, message }, mình trả về data
        return response.data.data;
    },

    // Lấy thông tin cửa hàng theo id
    getStoreById: async (id) => {
        const response = await axios.get(`${API_URL}/getStore/${id}`);
        return response.data.data;
    },

    // Tạo mới cửa hàng
    createStore: async (newStore) => {
        const response = await axios.post(`${API_URL}/createStore`, newStore);
        return response.data.data;
    },

    // Cập nhật cửa hàng theo id
    updateStore: async (id, updatedStore) => {
        const response = await axios.put(`${API_URL}/updateStore/${id}`, updatedStore);
        return response.data.data;
    },

    // Thay đổi trạng thái cửa hàng (deactivate)
    changeStatusStore: async (id) => {
        // endpoint trả về CommonResponse, ta chỉ cần biết có thành công hay không
        const response = await axios.put(`${API_URL}/changeStatusStore/${id}`);
        return response.data;
    }
};

export default storeSystemService;
