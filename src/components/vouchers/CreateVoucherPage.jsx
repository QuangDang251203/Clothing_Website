// src/pages/CreateVoucherPage.jsx
import React from 'react';
import VoucherForm from './VoucherForm';

export default function CreateVoucherPage() {
    // Mode: 'create', initialData: empty object
    return <VoucherForm mode="create" initialData={{}} />;
}
