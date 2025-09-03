// src/services/ProductVariantService.js
import axios from 'axios';
const API_BASE = 'http://localhost:8080';

const ProductVariantService = {
    getAllVariants: (pageConfig) =>
        axios.post(`${API_BASE}/storage/getAllVariant`, pageConfig),
    getByProduct: (productId) =>
        axios.get(`${API_BASE}/storage/getVariantOfProduct/${productId}`),
    createVariant: (dto) =>
        axios.post(`${API_BASE}/storage/createProductVariant`, dto),
    changePriceVariant: (skuCode, payload) =>
        axios.put(
            `${API_BASE}/storage/changePriceVariant/${skuCode}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } }
        ),
};

export default ProductVariantService;
