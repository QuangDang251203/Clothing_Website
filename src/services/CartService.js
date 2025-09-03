import axios from "axios";

const API_BASE = "http://localhost:8080/cart";

const CartService = {
    getCart: (accountId) =>
        axios
            .get(`${API_BASE}/getCart/${accountId}`)
            .then((res) => res.data.data),

    removeItem: (accountId, skuCode) =>
        axios
            .put(`${API_BASE}/removeItem/${accountId}?skuCode=${encodeURIComponent(skuCode)}`)
            .then((res) => res.data.data),

    updateItem: (cartRequest) =>
        axios
            .post(`${API_BASE}/updateItem`, cartRequest)
            .then((res) => res.data.data),

    clearCart: (accountId) =>
        axios.post(`${API_BASE}/clearCart/${accountId}`),
};

export default CartService;
