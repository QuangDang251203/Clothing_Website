// src/components/common/Footer.jsx
import React from 'react';
import '../../styles/footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="atino-footer">
            <div className="container footer-content">
                <div className="col">
                    <h4>Hỗ trợ khách hàng</h4>
                    <ul>
                        <li>
                            <Link to="/huong-dan-dat-hang">Hướng dẫn đặt hàng</Link>
                        </li>
                        <li>
                            <Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
                        </li>
                        <li>
                            <Link to="/chinh-sach-bao-hanh">Chính sách bảo hành</Link>
                        </li>
                    </ul>
                </div>
                <div className="col">
                    <h4>Về chúng tôi</h4>
                    <ul>
                        <li>
                            <Link to="/gioi-thieu-atino">Giới thiệu Atino</Link>
                        </li>
                        <li>
                            <Link to="/tin-tuc">Tin tức</Link>
                        </li>
                    </ul>
                </div>
                <div className="col">
                    <h4>Hệ thống cửa hàng</h4>
                    <ul>
                        <li>
                            <Link to="/tim-cua-hang">Tìm cửa hàng</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="copyright">
                ©2025 Louis Vuitton. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
