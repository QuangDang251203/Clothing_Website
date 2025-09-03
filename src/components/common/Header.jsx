// src/components/common/Header.jsx
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Header.css';
import logo from '../../styles/images/logo.png';
import { ReactComponent as CartIcon } from '../../styles/icons/icon_cart.svg';
import { AuthContext } from './AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import AccountPopup from '../user/AccountPopup';
import ShippingAddressPopup from '../user/ShippingAddressPopup';
import CartPopup from '../user/CartPopup';

const Header = () => {
    const [catsAo, setCatsAo] = useState([]);
    const [catsQuan, setCatsQuan] = useState([]);
    const [catsPK, setCatsPK] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef(null);
    const [isAddressOpen, setIsAddressOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);

    // Lấy từ AuthContext: cart chỉ có skuCode + quantity
    const { isAuthenticated, cart, cartLoading, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // State để quản lý popup giỏ hàng và chi tiết mỗi item
    const [showCartPopup, setShowCartPopup] = useState(false);
    const cartRef = useRef(null);

    // State lưu chi tiết đã fetch (tên, ảnh, giá, số lượng)
    const [cartDetails, setCartDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);

    const [showCartModal, setShowCartModal] = useState(false);
    const handleOpenCartModal = () => setShowCartModal(true);
    const handleCloseCartModal = () => setShowCartModal(false);

    // Fetch categories (giữ nguyên)
    useEffect(() => {
        fetch('http://localhost:8080/category/byType/t-shirt')
            .then((res) => res.json())
            .then(setCatsAo)
            .catch(console.error);
        fetch('http://localhost:8080/category/byType/pants')
            .then((res) => res.json())
            .then(setCatsQuan)
            .catch(console.error);
        fetch('http://localhost:8080/category/byType/accessory')
            .then((res) => res.json())
            .then(setCatsPK)
            .catch(console.error);
    }, []);

    // Đóng user dropdown và cart popup khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
            if (cartRef.current && !cartRef.current.contains(e.target)) {
                setShowCartPopup(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleUserIconClick = () => {
        setShowUserMenu((prev) => !prev);
    };

    const handleCartMouseEnter = () => {
        setShowCartPopup(true);
    };
    const handleCartMouseLeave = () => {
        setShowCartPopup(false);
    };

    const handleOpenAccount = () => setIsAccountOpen(true);
    const handleCloseAccount = () => setIsAccountOpen(false);

    const menuItems = [
        { label: 'Trang chủ', to: '/' },
        { label: 'Áo', to: '/t-shirt', sub: catsAo },
        { label: 'Quần', to: '/pants', sub: catsQuan },
        { label: 'Phụ kiện', to: '/accessory', sub: catsPK },
        { label: 'Tìm cửa hàng', to: '/tim-cua-hang' },
        { label: 'Thông tin', to: '/thong-tin' },
    ];

    // Khi showCartPopup = true, fetch chi tiết cho từng item trong cart
    const fetchCartDetails = useCallback(async () => {
        if (!cart || !cart.items) return;
        setDetailsLoading(true);
        setDetailsError(null);

        try {
            // Dùng Promise.all để fetch song song
            const promises = cart.items.map(async (item) => {
                const sku = item.skuCode;

                // 1. Lấy variant để có price
                const variantRes = await fetch(`http://localhost:8080/storage/getSku/${sku}`);
                if (!variantRes.ok) throw new Error(`Không lấy được variant cho ${sku}`);
                const variantBody = await variantRes.json();
                const variant = variantBody.data; // ProductVariantDTO có productId, price, quantity...

                // 2. Lấy product để có productName, imageURLs (giả sử ProductDTO có imageURLs)
                const productRes = await fetch(`http://localhost:8080/storage/getProductBySkuCode/${sku}`);
                if (!productRes.ok) throw new Error(`Không lấy được product cho ${sku}`);
                const productBody = await productRes.json();
                const product = productBody.data; // ProductDTO có productName, imageURLs, ...

                return {
                    skuCode: sku,
                    quantity: item.quantity,
                    price: variant.price,
                    productName: product.productName,
                    imageURL: product.imageURLs && product.imageURLs.length > 0
                        ? product.imageURLs[0].url
                        : null,
                };
            });

            const results = await Promise.all(promises);
            setCartDetails(results);
        } catch (err) {
            console.error(err);
            setDetailsError(err.message || 'Lỗi khi tải chi tiết cart');
        } finally {
            setDetailsLoading(false);
        }
    }, [cart]);

    // Khi showCartPopup được bật lên, gọi fetchCartDetails
    useEffect(() => {
        if (showCartPopup && cart && cart.items && cart.items.length > 0) {
            fetchCartDetails();
        } else {
            // Nếu đóng popup hoặc cart empty, reset
            setCartDetails([]);
            setDetailsError(null);
            setDetailsLoading(false);
        }
    }, [showCartPopup, cart, fetchCartDetails]);

    return (
        <header className="atino-header">
            <div className="header-container header-top">
                <div className="contact-info">
                    Hotline: <a href="tel:0984548938">0984548938</a>
                </div>
                <div className="right-section">
                    {isAuthenticated ? (
                        <>
                            {/* === GIỎ HÀNG === */}
                            <div
                                className="cart-link"
                                ref={cartRef}
                                onMouseEnter={handleCartMouseEnter}
                                onMouseLeave={handleCartMouseLeave}
                            >
                                <CartIcon className="cart-icon" />

                                {showCartPopup && (
                                    <div className="cart-popup">
                                        <h4>Giỏ hàng của bạn</h4>

                                        {cartLoading || detailsLoading ? (
                                            <p className="empty-cart-text">Đang tải...</p>
                                        ) : detailsError ? (
                                            <p className="empty-cart-text">Lỗi: {detailsError}</p>
                                        ) : cartDetails.length > 0 ? (
                                            <ul className="cart-popup-list">
                                                {cartDetails.map((item, idx) => (
                                                    <li key={idx} className="cart-popup-item">
                                                        <div className="item-image">
                                                            {item.imageURL ? (
                                                                <img src={item.imageURL} alt={item.productName} />
                                                            ) : (
                                                                <div className="no-image">No Image</div>
                                                            )}
                                                        </div>
                                                        <div className="item-info">
                                                            <p className="item-name">{item.productName}</p>
                                                            <p className="item-sku">SKU: {item.skuCode}</p>
                                                            <p className="item-price">
                                                                {item.price.toLocaleString()} ₫ × {item.quantity}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                                <li className="cart-popup-footer">
                                                    <button
                                                        className="view-cart-btn"
                                                        onClick={() => {
                                                            setShowCartPopup(false);
                                                            handleOpenCartModal();
                                                        }}
                                                    >
                                                        XEM GIỎ HÀNG
                                                    </button>
                                                </li>
                                            </ul>
                                        ) : (
                                            <p className="empty-cart-text">Giỏ hàng trống.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* === USER ICON === */}
                            <div className="user-menu-container" ref={menuRef}>
                                <FaUserCircle
                                    className="user-icon"
                                    size={24}
                                    onClick={handleUserIconClick}
                                />
                                {showUserMenu && (
                                    <ul className="user-dropdown">
                                        <li
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleOpenAccount();
                                            }}
                                        >
                                            Tài khoản của tôi
                                        </li>
                                        {isAccountOpen && (
                                            <AccountPopup isOpen={isAccountOpen} onClose={handleCloseAccount} />
                                        )}
                                        <li
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                setIsAddressOpen(true);
                                            }}
                                        >
                                            Địa chỉ giao hàng
                                        </li>
                                        {isAddressOpen && (
                                            <ShippingAddressPopup
                                                isOpen={isAddressOpen}
                                                onClose={() => setIsAddressOpen(false)}
                                            />
                                        )}
                                        <li
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                navigate('/my-orders');
                                            }}
                                        >
                                            Đơn hàng
                                        </li>
                                        <li
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                handleLogout();
                                            }}
                                        >
                                            Đăng xuất
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/login">Đăng nhập</Link>
                    )}
                </div>
            </div>

            <nav className="main-nav header-container">
                <div className="logo">
                    <Link to="/">
                        <img src={logo} alt="Atino Logo" className="logo-img" />
                    </Link>
                </div>

                <ul className="nav-list">
                    {menuItems.map(({ label, to, sub }) => (
                        <li key={label} className="nav-item">
                            <Link to={to}>{label}</Link>
                            {sub && sub.length > 0 && (
                                <ul className="dropdown-menu">
                                    {sub.map(cat => (
                                        <li key={cat.categoryCode}>
                                            <Link to={`${to}/${cat.categoryCode}`}>{cat.categoryName}</Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="search-bar">
                    <input type="text" placeholder="Tìm kiếm..." />
                    <button>🔍</button>
                </div>
            </nav>
            <CartPopup isOpen={showCartModal} onClose={handleCloseCartModal} />
            <AccountPopup isOpen={isAccountOpen} onClose={handleCloseAccount} />
        </header>
    );
};

export default Header;
