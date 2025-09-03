// src/pages/EditVoucherPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VoucherForm from './VoucherForm';
import VoucherService from '../../services/VoucherService';

export default function EditVoucherPage() {
    const { voucherCode } = useParams(); // param từ URL
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Khi mount, fetch dữ liệu voucher
        VoucherService.getByCode(voucherCode)
            .then(data => {
                setInitialData(data);
            })
            .catch(err => {
                console.error('Không tìm thấy voucher: ', err);
                alert('Không tìm thấy voucher với mã ' + voucherCode);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [voucherCode]);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Đang tải dữ liệu...</div>;
    }

    if (!initialData) {
        return <div style={{ padding: '2rem', color: 'red' }}>
            Lỗi: không có dữ liệu Voucher để chỉnh sửa.
        </div>;
    }

    return <VoucherForm mode="edit" initialData={initialData} />;
}
