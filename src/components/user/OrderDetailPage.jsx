// src/components/OrderDetailPage.jsx
"use client"

import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../common/AuthContext" // Import AuthContext
import "../../styles/order-detail.css"

export default function OrderDetailPage() {
    // Destructure 'user' và 'loading' (trạng thái loading từ AuthContext)
    const { user, loading: authLoading } = useContext(AuthContext) // Đổi tên 'loading' thành 'authLoading' để dễ phân biệt
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [shippingInfo, setShippingInfo] = useState(null)
    const [productNames, setProductNames] = useState({})
    const [pageLoading, setPageLoading] = useState(true) // Loading cục bộ cho trang này (chi tiết đơn hàng)
    const [error, setError] = useState("")

    // Fetch order detail
    useEffect(() => {
        // Bước 1: Chờ AuthContext hoàn thành việc tải trạng thái xác thực
        if (authLoading) {
            setPageLoading(true); // Giữ loading cục bộ là true trong khi Auth đang loading
            return; // Dừng lại, chưa làm gì nếu Auth đang xử lý
        }

        // Bước 2: Sau khi AuthContext đã tải xong, kiểm tra xem user có tồn tại không
        if (!user || !user.id) {
            setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem chi tiết đơn hàng.");
            setPageLoading(false); // Đặt loading cục bộ là false vì không thể fetch được
            // Tùy chọn: chuyển hướng về trang đăng nhập nếu muốn
            // navigate("/login");
            return;
        }

        // Nếu user đã được xác thực, tiến hành fetch chi tiết đơn hàng
        setPageLoading(true); // Bắt đầu loading cho dữ liệu đơn hàng
        fetch(`http://localhost:8080/orders/getDetailOrder/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("TOKEN")}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text();
                    // Nếu lỗi do xác thực (ví dụ 401 Unauthorized), xử lý đặc biệt
                    if (res.status === 401 || res.status === 403) {
                        // Nên có hàm logout từ AuthContext hoặc thông báo người dùng đăng nhập lại
                        localStorage.removeItem("TOKEN"); // Xóa token cũ
                        // setError có thể được set trong AuthContext nếu nó xử lý lỗi
                        setError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
                        // throw new Error("Auth failed during order fetch."); // Ném lỗi để dừng promise chain
                        return; // Dừng xử lý tiếp
                    }
                    throw new Error(txt || "Không lấy được chi tiết đơn hàng.");
                }
                return res.json();
            })
            .then((body) => {
                setOrder(body.data);
            })
            .catch((err) => {
                console.error("Lỗi khi fetch chi tiết đơn hàng:", err);
                // Chỉ cập nhật lỗi nếu nó chưa được set bởi lỗi xác thực trước đó
                if (!error.includes("Phiên đăng nhập")) {
                    setError(err.message || "Lỗi khi lấy chi tiết đơn hàng.");
                }
            })
            .finally(() => {
                setPageLoading(false); // Kết thúc loading cho dữ liệu đơn hàng
            });
    }, [id, user, authLoading]); // Thêm 'authLoading' vào dependency array

    // Fetch shipping info and product names
    useEffect(() => {
        if (!order) return; // Chỉ chạy khi dữ liệu order đã có

        const token = localStorage.getItem("TOKEN");
        if (!token) {
            console.warn("Không có token để lấy thông tin liên quan đến đơn hàng.");
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        // Fetch shipping address
        const fetchShippingAddress = async () => {
            try {
                const res = await fetch(`http://localhost:8080/shippingAddress/getShippingAddressById?id=${order.shippingAddressId}`, { headers });
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || "Không lấy được địa chỉ giao hàng.");
                }
                const body = await res.json();
                setShippingInfo(body.data);
            } catch (err) {
                console.error("Lỗi khi fetch địa chỉ giao hàng:", err);
                setError((prev) => (prev ? prev + "\n" : "") + (err.message || "Lỗi lấy địa chỉ."));
            }
        };

        // Fetch product names
        const fetchProductNames = async () => {
            const details = order.details || [];
            const namesMap = {};
            await Promise.all(
                details.map(async (item) => {
                    try {
                        const res = await fetch(`http://localhost:8080/storage/getProductBySkuCode/${encodeURIComponent(item.skuCode)}`, { headers });
                        if (!res.ok) {
                            const txt = await res.text();
                            throw new Error(`Không lấy được sản phẩm cho SKU ${item.skuCode}: ${txt}`);
                        }
                        const body = await res.json();
                        const product = body.data;
                        namesMap[item.skuCode] = product.productName;
                    } catch (err) {
                        console.error(`Lỗi khi fetch sản phẩm cho SKU ${item.skuCode}:`, err);
                        namesMap[item.skuCode] = "(Không xác định)"; // Gán tên tạm thời nếu không lấy được
                    }
                }),
            );
            setProductNames(namesMap);
        };

        fetchShippingAddress();
        fetchProductNames();

    }, [order]); // Phụ thuộc vào order

    const handleBack = () => {
        navigate("/"); // Sử dụng navigate để chuyển trang mà không tải lại toàn bộ trang
    };

    // Hiển thị trạng thái loading riêng cho quá trình xác thực trước tiên
    if (authLoading) {
        return (
            <div className="order-detail-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang kiểm tra trạng thái đăng nhập...</p>
                </div>
            </div>
        );
    }

    // Sau đó, hiển thị loading/error cho chi tiết đơn hàng
    if (pageLoading) {
        return (
            <div className="order-detail-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-detail-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <p className="error-text">Lỗi: {error}</p>
                    <button className="back-button" onClick={handleBack}>
                        ← Quay lại
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-detail-container">
                <div className="error-container">
                    <div className="error-icon">📦</div>
                    <p>Không tìm thấy thông tin đơn hàng.</p>
                    <button className="back-button" onClick={handleBack}>
                        ← Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const { details, totalPrice } = order;

    return (
        <div className="order-detail-container">
            <div className="header-section">
                <button className="back-button" onClick={handleBack}>
                    ← Tiếp tục mua sắm
                </button>
                <h1 className="page-title">Chi Tiết Đơn Hàng</h1>
                <div className="order-id">Mã đơn hàng: #{id}</div>
            </div>

            <div className="content-wrapper">
                {/* Shipping Information */}
                {shippingInfo ? (
                    <div className="info-card shipping-card">
                        <div className="card-header">
                            <div className="card-icon shipping-icon">🚚</div>
                            <h2 className="card-title">Thông Tin Địa Chỉ Giao Hàng</h2>
                        </div>
                        <div className="card-content">
                            <div className="info-row">
                                <span className="info-label">Người nhận:</span>
                                <span className="info-value">{shippingInfo.consigneeName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Điện thoại:</span>
                                <span className="info-value">{shippingInfo.mobile}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Địa chỉ:</span>
                                <span className="info-value">{shippingInfo.address}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="info-card">
                        <div className="loading-text">Đang tải địa chỉ giao hàng...</div>
                    </div>
                )}

                {/* Products */}
                <div className="info-card products-card">
                    <div className="card-header">
                        <div className="card-icon products-icon">📦</div>
                        <h2 className="card-title">Sản Phẩm</h2>
                    </div>
                    <div className="card-content">
                        <div className="products-table">
                            <div className="table-header">
                                <div className="table-cell header-cell">Tên sản phẩm</div>
                                <div className="table-cell header-cell">Mã SKU</div>
                                <div className="table-cell header-cell">Số lượng</div>
                            </div>
                            {details.map((item, idx) => {
                                const name = productNames[item.skuCode] || "Đang tải...";
                                return (
                                    <div key={idx} className="table-row">
                                        <div className="table-cell product-name">{name}</div>
                                        <div className="table-cell sku-code">{item.skuCode}</div>
                                        <div className="table-cell quantity">
                                            <span className="quantity-badge">{item.quantity}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="info-card summary-card">
                    <div className="card-header">
                        <div className="card-icon summary-icon">💰</div>
                        <h2 className="card-title">Tổng Tiền</h2>
                    </div>
                    <div className="card-content">
                        <div className="summary-row">
                            <span className="summary-label">Tổng số sản phẩm:</span>
                            <span className="summary-value">{details.reduce((sum, item) => sum + item.quantity, 0)} món</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="total-row">
                            <span className="total-label">Tổng tiền thanh toán:</span>
                            <span className="total-price">{Number(totalPrice).toLocaleString()} ₫</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}