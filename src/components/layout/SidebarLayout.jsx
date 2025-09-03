// src/components/layout/SidebarLayout.jsx
import React, { useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import '../../styles/SidebarLayout.css';
import { AuthContext } from '../common/AuthContext';

// Các trang admin
import ProductList from '../products/ProductList';
import AccountManagement from '../accounts/AccountManagement';
import CategoryList from '../categories/CategoryList';
import MessageManagement from '../message/MessageManagement';
import VariantList from '../variants/VariantList';
import VoucherManagement from "../vouchers/VoucherManagement";
import EditVoucherPage from "../vouchers/EditVoucherPage";
import CreateVoucherPage from "../vouchers/CreateVoucherPage";
import StoreSystemManagement from "../storeSystem/StoreSystemManagement";
import EditProductPage from "../products/EditProductPage";
import AddProductPage from "../products/AddProductPage";
import OrderManagement from "../orders/OrderManagement";
import Statistics from "../statistics/Statistics";
import NewsManagement from "../news/NewsManagement";
import ShowcaseList from '../showcase/ShowcaseList';

export default function SidebarLayout() {
    const { user } = useContext(AuthContext);
    if (!user) return <Navigate to="/login" replace />;
    const isStaff = user?.role === 'STAFF';

    // Menu items based on role
    const menuItems = isStaff
        ? [
            { to: '/admin/variants', icon: 'storefront', label: 'Kho' },
            { to: '/admin/message', icon: 'message', label: 'Tin nhắn' },
            { to: '/admin/news', icon: 'newspaper', label: 'Bảng tin' },
        ]
        : [
            { to: '/admin/statistics', icon: 'bar_chart', label: 'Thống kê' },
            { to: '/admin/products/add', icon: 'post_add', label: 'Thêm sản phẩm' },
            { to: '/admin/products', icon: 'inventory_2', label: 'Tất cả sản phẩm' },
            { to: '/admin/staff', icon: 'person', label: 'Nhân viên' },
            { to: '/admin/categories', icon: 'category', label: 'Loại hàng hóa' },
            { to: '/admin/message', icon: 'message', label: 'Tin nhắn' },
            { to: '/admin/variants', icon: 'storefront', label: 'Kho' },
            { to: '/admin/voucher', icon: 'local_offer', label: 'Mã giảm giá' },
            { to: '/admin/storeSystems', icon: 'store', label: 'Cửa hàng' },
            { to: '/admin/orders', icon: 'shopping_cart', label: 'Đơn hàng' },
            { to: '/admin/news', icon: 'article', label: 'Bảng tin' },
            { to: '/admin/showcase', icon: 'view_list', label: 'Showcase' },
        ];

    if (!user) {
        // Nếu chưa login
        return <Navigate to="/login" replace />;
    }

    // Nếu staff thử vào link admin khác thì redirect
    if (isStaff) {
        return (
            <div className="layout-wrapper">
                <Sidebar menuItems={menuItems} />
                <MainContent isStaff />
            </div>
        );
    }

    // Admin đầy đủ quyền
    return (
        <div className="layout-wrapper">
            <Sidebar menuItems={menuItems} />
            <MainContent />
        </div>
    );
}

function Sidebar({ menuItems }) {
    return (
        <div className="menu">
            <ul className="menu-content">
                {menuItems.map(item => (
                    <li key={item.to}>
                        <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
                <li>
                    <a href="/logout">
                        <span className="material-symbols-outlined">logout</span>
                        <span>Đăng xuất</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}

function MainContent({ isStaff }) {
    return (

        <div className="main-content">
            <Routes>
                {isStaff ? (
                    <>
                        <Route path="variants" element={<VariantList />} />
                        <Route path="message" element={<MessageManagement />} />
                        <Route path="news" element={<NewsManagement />} />
                        <Route path="*" element={<Navigate to="variants" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="products" element={<ProductList />} />
                        <Route path="products/add" element={<AddProductPage />} />
                        <Route path="products/edit/:productCode" element={<EditProductPage />} />
                        <Route path="staff" element={<AccountManagement />} />
                        <Route path="categories" element={<CategoryList />} />
                        <Route path="message" element={<MessageManagement />} />
                        <Route path="variants" element={<VariantList />} />
                        <Route path="voucher" element={<VoucherManagement />} />
                        <Route path="voucher/createVoucher" element={<CreateVoucherPage />} />
                        <Route path="voucher/editVoucher/:voucherCode" element={<EditVoucherPage />} />
                        <Route path="storeSystems" element={<StoreSystemManagement />} />
                        <Route path="orders" element={<OrderManagement />} />
                        <Route path="news" element={<NewsManagement />} />
                        <Route path="statistics" element={<Statistics />} />
                        <Route path="showcase" element={<ShowcaseList />} />
                        <Route path="" element={<Navigate to="products" replace />} />
                        <Route path="*" element={<Navigate to="products" replace />} />
                    </>
                )}
            </Routes>
        </div>

    );
}
