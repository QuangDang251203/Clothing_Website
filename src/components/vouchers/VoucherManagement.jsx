// src/components/VoucherManagement.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Tag } from 'lucide-react'; // Icon Voucher + dấu cộng
import VoucherService from '../../services/VoucherService';
import '../../styles/Voucher.css';

export default function VoucherManagement() {
    const [vouchers, setVouchers] = useState([]);

    // Tab filter: 'all' | 'ongoing' | 'upcoming' | 'ended'
    const [filterTab, setFilterTab] = useState('all');

    // Search
    const [searchBy, setSearchBy] = useState('voucherCode');
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    // Fetch toàn bộ vouchers từ backend
    const fetchAll = () => {
        VoucherService.getAll()
            .then((list) => setVouchers(list))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchAll();
    }, []);

    // Điều hướng sang trang tạo voucher
    const handleCreateClick = () => {
        navigate('/admin/voucher/createVoucher');
    };

    // Điều hướng sang trang chỉnh sửa voucher
    const handleEditClick = (voucherCode) => {
        navigate(`/admin/voucher/editVoucher/${voucherCode}`);
    };

    // Đổi trạng thái Active/Inactive
    const handleToggleStatus = (code) => {
        if (window.confirm(`Bạn có chắc chắn muốn đổi trạng thái voucher ${code}?`)) {
            VoucherService.changeStatus(code)
                .then(() => fetchAll())
                .catch((err) => alert('Lỗi: ' + err));
        }
    };

    // Tìm kiếm trên client
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            fetchAll();
            return;
        }
        const term = searchTerm.trim().toLowerCase();
        const filtered = vouchers.filter((v) => {
            if (searchBy === 'voucherCode') {
                return v.voucherCode.toLowerCase().includes(term);
            } else {
                return v.des?.toLowerCase().includes(term);
            }
        });
        setVouchers(filtered);
    };

    // Lọc voucher theo tab (dựa vào ngày hiện tại so với startDate & expiryDate)
    const getFilteredByTab = () => {
        const now = new Date();
        return vouchers.filter((v) => {
            if (!v.startDate || !v.expiryDate) return false;

            const start = new Date(v.startDate);
            const end = new Date(v.expiryDate);

            switch (filterTab) {
                case 'ongoing': // Đang diễn ra: now nằm giữa start và end
                    return now >= start && now <= end;
                case 'upcoming': // Sắp diễn ra: now < start
                    return now < start;
                case 'ended': // Đã kết thúc: now > end
                    return now > end;
                default: // 'all'
                    return true;
            }
        });
    };

    const displayedVouchers = getFilteredByTab();

    return (
        <div className="voucher-mgmt-container">
            <h2>Quản lý Voucher</h2>

            {/* ====== Nút Tạo Voucher ====== */}
            <div className="top-bar">
                <button className="btn-create" onClick={handleCreateClick}>
                    {/* Icon Voucher + Icon Dấu cộng */}
                    <Tag size={16} style={{ marginRight: '4px' }} />
                    <PlusCircle size={16} style={{ marginRight: '4px' }} />
                    Tạo Voucher
                </button>
            </div>

            {/* ====== Tabs lọc theo ngày ====== */}
            <div className="filter-tabs">
                <button
                    className={`tab-button ${filterTab === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterTab('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`tab-button ${filterTab === 'ongoing' ? 'active' : ''}`}
                    onClick={() => setFilterTab('ongoing')}
                >
                    Đang diễn ra
                </button>
                <button
                    className={`tab-button ${filterTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setFilterTab('upcoming')}
                >
                    Sắp diễn ra
                </button>
                <button
                    className={`tab-button ${filterTab === 'ended' ? 'active' : ''}`}
                    onClick={() => setFilterTab('ended')}
                >
                    Đã kết thúc
                </button>
            </div>

            {/* ====== Search ====== */}
            <div className="search-group">
                <label>Tìm kiếm:</label>
                <select
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                    className="form-select"
                >
                    <option value="voucherCode">Mã Voucher</option>
                    <option value="des">Tên/ Mô tả</option>
                </select>
                <input
                    type="text"
                    placeholder="Nhập từ khoá..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="btn-search" onClick={handleSearch}>
                    Tìm
                </button>
            </div>

            {/* ====== Bảng Voucher ====== */}
            <table className="voucher-table">
                <thead>
                <tr>
                    <th>Mã Voucher</th>
                    <th>Tên/ Mô tả</th>
                    <th>Giá trị giảm</th>
                    <th>Giảm tối đa</th>
                    <th>Tối đa (Lượt)</th>
                    <th>Đã dùng</th>
                    <th>Thời gian hiệu lực</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {displayedVouchers.length === 0 && (
                    <tr>
                        <td colSpan="8">Không tìm thấy Voucher phù hợp</td>
                    </tr>
                )}
                {displayedVouchers.map((v) => (
                    <tr key={v.voucherCode}>
                        <td>{v.voucherCode}</td>
                        <td>{v.des || '-'}</td>
                        <td>
                            {v.isPercentage ? `${v.voucherValue}%` : `${v.voucherValue}đ`}
                        </td>
                        <td>{v.maxDiscountAmount}</td>
                        <td>{v.maxRedemptions || '-'}</td>
                        <td>{v.timesRedeemed || 0}</td>
                        <td>
                            {v.startDate
                                ? `${new Date(v.startDate).toLocaleDateString()} - ${new Date(
                                    v.expiryDate
                                ).toLocaleDateString()}`
                                : '-'}
                        </td>
                        <td>{v.status === 1 ? 'Active' : 'Inactive'}</td>
                        <td>
                            <button
                                className="btn btn-edit"
                                onClick={() => handleEditClick(v.voucherCode)}
                            >
                                Chỉnh sửa
                            </button>
                            <button
                                className="btn btn-toggle"
                                onClick={() => handleToggleStatus(v.voucherCode)}
                            >
                                Đổi trạng thái
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
