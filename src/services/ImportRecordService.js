// src/services/ImportRecordService.js
import axios from 'axios';
const API = 'http://localhost:8080';

export default {
    importGoods: dto => axios.post(`${API}/importRecord/importGoods`, dto),
    getHistory: params => axios.get(`${API}/importRecord/searchImport`, { params }), // productId, skuCode, from, to
};
