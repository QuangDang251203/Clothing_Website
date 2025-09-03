import axios from "axios"

const API_BASE = "http://localhost:8080"

const ProductService = {
    // Phương thức lấy sản phẩm theo trang
    getAllProducts: async (pageConfig) => {
        const response = await axios.post(`${API_BASE}/product/getAllProducts`, pageConfig)

        let totalElements = localStorage.getItem("totalProducts")

        if (!totalElements) {
            try {
                const fullResponse = await ProductService.getAllProductsFull()
                if (fullResponse.data && fullResponse.data.data) {
                    totalElements = fullResponse.data.data.length
                    localStorage.setItem("totalProducts", totalElements)
                }
            } catch (error) {
                console.error("Error fetching total products:", error)
            }
        }

        // Thêm thông tin phân trang vào response
        response.totalElements = Number.parseInt(totalElements) || 0
        response.totalPages = Math.ceil(response.totalElements / pageConfig.row)

        return response
    },

    getAllProductsFull: () => axios.get(`${API_BASE}/product/getAllProductsFull`),

    createProduct: (productDTO) => axios.post(`${API_BASE}/product/createProduct`, productDTO),

    changeStatusProduct: (productCode) => axios.put(`${API_BASE}/product/changeStatusProduct/${productCode}`),

    changeInfoProduct: (productDTO) => axios.put(`${API_BASE}/product/changeInfoProduct`, productDTO),

    getProductByCode: (productCode) => axios.get(`${API_BASE}/product/getProductByCode/${productCode}`),

    // Phương thức để xóa cache khi có thay đổi dữ liệu
    clearCache: () => {
        localStorage.removeItem("totalProducts")
    },
}

export default ProductService
