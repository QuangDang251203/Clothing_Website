"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import ProductService from "../../services/ProductService"
import ProductItem from "./ProductItem"
import "../../styles/ProductList.css"

const ProductList = () => {
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState("table") // 'table' or 'grid'
    const [isLoading, setIsLoading] = useState(false)

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalProducts, setTotalProducts] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const navigate = useNavigate()

    const fetchProducts = async (page = 1) => {
        setIsLoading(true)
        try {
            const pageConfig = { page: page, row: pageSize }
            const res = await ProductService.getAllProducts(pageConfig)

            setProducts(res.data)

            // Tính toán tổng số trang dựa trên tổng số sản phẩm
            // Lưu ý: Backend cần trả về tổng số sản phẩm trong response
            if (res.totalElements) {
                const total = res.totalElements
                setTotalProducts(total)
                setTotalPages(Math.ceil(total / pageSize))
            }

            setCurrentPage(page)
        } catch (err) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", err)
        } finally {
            setIsLoading(false)
        }
    }

    // Lấy tổng số sản phẩm khi component mount
    const fetchTotalProducts = async () => {
        try {
            const res = await ProductService.getAllProductsFull()
            if (res.data && res.data.data) {
                const total = res.data.data.length
                setTotalProducts(total)
                setTotalPages(Math.ceil(total / pageSize))
            }
        } catch (err) {
            console.error("Lỗi khi lấy tổng số sản phẩm:", err)
        }
    }

    useEffect(() => {
        fetchTotalProducts()
        fetchProducts(1)
    }, [pageSize])

    const handleSearch = async (e) => {
        e.preventDefault()
        const code = searchTerm.trim()
        setIsLoading(true)

        try {
            if (code === "") {
                await fetchProducts(1)
            } else {
                const res = await ProductService.getProductByCode(code)
                const dto = res.data.data
                setProducts(dto ? [dto] : [])
                setTotalProducts(dto ? 1 : 0)
                setTotalPages(1)
                setCurrentPage(1)
            }
        } catch (err) {
            console.error("Search error:", err)
            setProducts([])
            setTotalProducts(0)
            setTotalPages(1)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (product) => {
        navigate(`/admin/products/edit/${product.productCode}`, { state: { product } })
    }

    const handleAdd = () => {
        navigate("/admin/products/add")
    }

    const handleStatusChange = async (productCode) => {
        try {
            await ProductService.changeStatusProduct(productCode)
            // Refresh lại danh sách sản phẩm hiện tại
            if (searchTerm.trim() === "") {
                await fetchProducts(currentPage)
            } else {
                await handleSearch({ preventDefault: () => {} })
            }
        } catch (err) {
            console.error("Lỗi khi đổi trạng thái:", err)
            alert("Đổi trạng thái không thành công!")
        }
    }

    // Hàm chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage)
        }
    }

    // Hàm thay đổi số sản phẩm trên mỗi trang
    const handlePageSizeChange = (e) => {
        const newSize = Number.parseInt(e.target.value)
        setPageSize(newSize)
        setCurrentPage(1) // Reset về trang 1 khi thay đổi số sản phẩm/trang
    }

    return (
        <div className="product-management">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="page-title">Quản lý sản phẩm</h1>
                        <p className="page-subtitle">Quản lý danh sách sản phẩm của cửa hàng ({totalProducts} sản phẩm)</p>
                    </div>
                    <button className="btn-primary add-product-btn" onClick={handleAdd}>
                        <Plus size={20} />
                        Thêm sản phẩm mới
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-section">
                <div className="search-container">
                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="search"
                                placeholder="Tìm kiếm theo mã sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button type="submit" className="btn-secondary search-btn">
                            Tìm kiếm
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setSearchTerm("")
                                fetchProducts(1)
                            }}
                        >
                            Hiển thị tất cả
                        </button>
                    </form>
                </div>

                <div className="view-controls">
                    <div className="page-size-selector">
                        <label>Hiển thị:</label>
                        <select value={pageSize} onChange={handlePageSizeChange} className="page-size-select">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="view-toggle">
                        <button className={`view-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>
                            <List size={18} />
                        </button>
                        <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                            <Grid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="products-section">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>Không có sản phẩm nào</h3>
                        <p>Hãy thêm sản phẩm đầu tiên của bạn</p>
                        <button className="btn-primary" onClick={handleAdd}>
                            <Plus size={20} />
                            Thêm sản phẩm mới
                        </button>
                    </div>
                ) : (
                    <div className="products-container">
                        {viewMode === "table" ? (
                            <div className="table-responsive">
                                <div className="table-container">
                                    <table className="products-table">
                                        <thead>
                                        <tr>
                                            <th>Mã sản phẩm</th>
                                            <th>Ảnh</th>
                                            <th>Tên sản phẩm</th>
                                            <th>Loại</th>
                                            <th>Lượt bán</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {products.map((product) => (
                                            <ProductItem
                                                key={product.productCode}
                                                product={product}
                                                onEdit={handleEdit}
                                                onStatusChanged={() => handleStatusChange(product.productCode)}
                                                viewMode="table"
                                            />
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {products.map((product) => (
                                    <ProductItem
                                        key={product.productCode}
                                        product={product}
                                        onEdit={handleEdit}
                                        onStatusChanged={() => handleStatusChange(product.productCode)}
                                        viewMode="grid"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft size={16} />
                                        Trước
                                    </button>

                                    <div className="pagination-numbers">
                                        {/* Hiển thị số trang */}
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            // Logic để hiển thị 5 trang xung quanh trang hiện tại
                                            let pageNum
                                            if (totalPages <= 5) {
                                                // Nếu tổng số trang <= 5, hiển thị tất cả
                                                pageNum = i + 1
                                            } else if (currentPage <= 3) {
                                                // Nếu đang ở đầu, hiển thị 1-5
                                                pageNum = i + 1
                                            } else if (currentPage >= totalPages - 2) {
                                                // Nếu đang ở cuối, hiển thị totalPages-4 đến totalPages
                                                pageNum = totalPages - 4 + i
                                            } else {
                                                // Ở giữa, hiển thị currentPage-2 đến currentPage+2
                                                pageNum = currentPage - 2 + i
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`pagination-number ${currentPage === pageNum ? "active" : ""}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        Sau
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="pagination-info">
                                    Trang {currentPage} / {totalPages} • Hiển thị {products.length} / {totalProducts} sản phẩm
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductList
