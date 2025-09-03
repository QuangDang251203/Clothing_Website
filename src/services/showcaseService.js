// src/services/showcaseService.js
import axios from 'axios';

// Base URL for the backend API: adjust if different
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const API_URL = `${BASE_URL}/showcase`;

function getConfig(token, isMultipart = false) {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (isMultipart) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    return { headers };
}

export const getAllShowcases = (token) => {
    return axios.get(API_URL, getConfig(token));
};

export const getShowcaseById = (id, token) => {
    return axios.get(`${API_URL}/${id}`, getConfig(token));
};

/**
 * data: { label: string, link: string, imageFile: File }
 */
export const createShowcase = (data, token) => {
    const formData = new FormData();
    formData.append('label', data.label);
    formData.append('link', data.link);
    if (data.imageFile) {
        formData.append('imageUrl', data.imageFile);
    }
    return axios.post(API_URL, formData, getConfig(token, true));
};

/**
 * data: { label?: string, link?: string, imageFile?: File }
 */
export const updateShowcase = (id, data, token) => {
    const formData = new FormData();
    if (data.label !== undefined) {
        formData.append('label', data.label);
    }
    if (data.link !== undefined) {
        formData.append('link', data.link);
    }
    if (data.imageFile) {
        formData.append('imageUrl', data.imageFile);
    }
    return axios.put(`${API_URL}/${id}`, formData, getConfig(token, true));
};

export const deleteShowcase = (id, token) => {
    return axios.delete(`${API_URL}/${id}`, getConfig(token));
};