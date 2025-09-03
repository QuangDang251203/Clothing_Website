"use client"

// src/components/dashboard/Dashboard.jsx
import { useState, useEffect, useRef } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { DayPicker } from "react-day-picker"
import { useNavigate } from "react-router-dom"
import "react-day-picker/dist/style.css"
import "../../styles/dashboard.css" // Import CSS riêng cho dashboard

const Dashboard = () => {
    const navigate = useNavigate()

    // Chart data & trạng thái
    const [chartData, setChartData] = useState([])
    const [chartTitle, setChartTitle] = useState("")
    const [loadingChart, setLoadingChart] = useState(false)
    const [chartError, setChartError] = useState(null)
    const [totalAmount, setTotalAmount] = useState(0)

    // Thêm state để chọn giữa doanh thu và lợi nhuận
    const [chartType, setChartType] = useState("revenue") // 'revenue' hoặc 'profit'

    const [countPending, setCountPending] = useState(0)
    const [countProcessing, setCountProcessing] = useState(0)
    const [countCanceled, setCountCanceled] = useState(0)

    const [topStorage, setTopStorage] = useState([])
    const [totalStorageCount, setTotalStorageCount] = useState(0)

    // Thêm state cho top selling products
    const [topSelling, setTopSelling] = useState([])
    const [showAllTopSelling, setShowAllTopSelling] = useState(false)
    const [loadingTopSelling, setLoadingTopSelling] = useState(false)

    const [showPanel, setShowPanel] = useState(false)
    const [selectedOption, setSelectedOption] = useState("today")
    const [activeOption, setActiveOption] = useState(null)

    // Input cho custom
    const [selectedDate, setSelectedDate] = useState(undefined)
    const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined })
    const [selectedMonth, setSelectedMonth] = useState(null) // số 1-12
    const [selectedYearForMonth, setSelectedYearForMonth] = useState(null)
    const [selectedYearOnly, setSelectedYearOnly] = useState("")

    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8080"

    // Ref để detect click ngoài đóng panel
    const dropdownRef = useRef(null)
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowPanel(false)
                setActiveOption(null)
                setChartError(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Fetch chung với Authorization
    const fetchWithAuth = (url) => {
        const token = localStorage.getItem("TOKEN")
        const headers = { "Content-Type": "application/json" }
        if (token) headers["Authorization"] = `Bearer ${token}`
        return fetch(url, { headers })
    }

    const parseResponse = (json) => {
        if (!json) throw new Error("Không có response")
        if (json.code !== "00") throw new Error(json.message || "Server trả về lỗi")
        return json.data
    }

    // Thêm hàm fetch top selling products
    const fetchTopSelling = async () => {
        setLoadingTopSelling(true)
        try {
            const d = new Date()
            const past = new Date('2024-12-25');
            const start = formatDateStr(past)
            const end = formatDateStr(d)

            const url = `${apiBase}/statistic/top-selling?start=${start}&end=${end}`
            const res = await fetchWithAuth(url)
            const json = await res.json()
            const data = json.code === "00" ? json.data : []
            setTopSelling(data)
        } catch (err) {
            console.error("Error fetching top selling:", err)
            setTopSelling([])
        }
        setLoadingTopSelling(false)
    }

    const fetchOrderCounts = async () => {
        try {
            const token = localStorage.getItem("TOKEN")
            const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }

            const res1 = await fetch(`${apiBase}/statistic/countByStatus/1`, { headers })
            const pendingData = await res1.json()
            const pending = pendingData.code === "00" ? pendingData.data : 0
            setCountPending(pending)

            const res2 = await fetch(`${apiBase}/statistic/countByStatus/2`, { headers })
            const proc2Data = await res2.json()
            const proc2 = proc2Data.code === "00" ? proc2Data.data : 0
            const res3 = await fetch(`${apiBase}/statistic/countByStatus/3`, { headers })
            const proc3Data = await res3.json()
            const proc3 = proc3Data.code === "00" ? proc3Data.data : 0
            setCountProcessing(proc2 + proc3)

            const res99 = await fetch(`${apiBase}/statistic/countByStatus/99`, { headers })
            const canceledData = await res99.json()
            const canceled = canceledData.code === "00" ? canceledData.data : 0
            setCountCanceled(canceled)
        } catch (err) {
            console.error(err)
        }
    }

    // Fetch top storage
    const fetchTopStorage = async () => {
        try {
            const token = localStorage.getItem("TOKEN")
            const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }

            const res = await fetch(`${apiBase}/statistic/top-storage?topN=6`, { headers })
            const json = await res.json()
            const data = json.code === "00" ? json.data : []
            setTopStorage(data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchTotalStorage = async () => {
        try {
            const token = localStorage.getItem("TOKEN")
            const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            const res = await fetch(`${apiBase}/statistic/getTotalProductInStorage`, { headers })
            const json = await res.json()
            const data = json.code === "00" ? json.data : []
            setTotalStorageCount(data)
        } catch (err) {
            console.error(err)
        }
    }

    // Hàm chung fetch và map data chart - cập nhật để hỗ trợ cả revenue và profit
    const doFetch = async (url, title, mapper) => {
        setLoadingChart(true)
        setChartError(null)
        try {
            console.log("Fetch URL:", url)
            const res = await fetchWithAuth(url)
            if (!res.ok) {
                const txt = await res.text()
                console.error("Error response text:", txt)
                throw new Error(`HTTP error ${res.status}`)
            }
            const ct = res.headers.get("content-type") || ""
            if (!ct.includes("application/json")) {
                const txt = await res.text()
                console.error("Expected JSON but got:", txt)
                throw new Error("Server không trả JSON")
            }
            const json = await res.json()
            const arr = parseResponse(json)
            const data = arr.map(mapper)
            setChartData(data)
            setChartTitle(title)
            const total = data.map((d) => d.amount).reduce((acc, cur) => acc + cur, 0)
            setTotalAmount(total)
        } catch (err) {
            console.error(err)
            setChartError(err.message || "Lỗi khi tải dữ liệu")
        }
        setLoadingChart(false)
    }

    const formatDateStr = (d) => {
        const dt = new Date(d)
        const year = dt.getFullYear()
        const month = String(dt.getMonth() + 1).padStart(2, "0")
        const day = String(dt.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    // Hàm helper để tạo mapper cho revenue hoặc profit
    const createMapper = (type) => {
        const amountKey = type === "revenue" ? "revenue" : "revenue" // API trả về đều là 'revenue' field
        return (item) => {
            if (item.hour !== undefined) {
                // Hourly data
                const hour = item.hour
                const amount = Number(item[amountKey]) || 0
                return { label: `${hour.toString().padStart(2, "0")}:00`, amount }
            } else if (item.date) {
                // Daily data
                const dateStr = item.date
                const amount = Number(item[amountKey]) || 0
                const dObj = new Date(dateStr)
                return { label: dObj.toLocaleDateString("vi", { day: "2-digit" }), amount }
            } else if (item.month) {
                // Monthly data
                const monthNum = item.month
                const amount = Number(item[amountKey]) || 0
                const dObj = new Date(2023, monthNum - 1, 1) // year doesn't matter for month name
                return { label: dObj.toLocaleDateString("vi-VN", { month: "short" }), amount }
            }
            return { label: "Unknown", amount: 0 }
        }
    }

    // Revenue fetch functions
    const fetchRevenueToday = () => {
        const dt = new Date()
        const ds = formatDateStr(dt)
        const url = `${apiBase}/statistic/revenue/hourly?date=${ds}`
        const title = `Doanh thu theo giờ ngày ${ds}`
        doFetch(url, title, createMapper("revenue"))
    }

    const fetchRevenueYesterday = () => {
        const dt = new Date()
        dt.setDate(dt.getDate() - 1)
        const ds = formatDateStr(dt)
        const url = `${apiBase}/statistic/revenue/hourly?date=${ds}`
        const title = `Doanh thu theo giờ ngày ${ds}`
        doFetch(url, title, createMapper("revenue"))
    }

    const fetchRevenueLast7Days = () => {
        const d = new Date()
        const past = new Date()
        past.setDate(d.getDate() - 6)
        const start = formatDateStr(past)
        const end = formatDateStr(d)
        const url = `${apiBase}/statistic/revenue/daily?start=${start}&end=${end}`
        const title = `Doanh thu theo ngày từ ${start} đến ${end}`
        doFetch(url, title, (item) => {
            const dateStr = item.date
            const amount = Number(item.revenue) || 0
            const dObj = new Date(dateStr)
            return {
                label: dObj.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }),
                amount,
            }
        })
    }

    const fetchRevenueLast30Days = () => {
        const d = new Date()
        const past = new Date()
        past.setDate(d.getDate() - 29)
        const start = formatDateStr(past)
        const end = formatDateStr(d)
        const url = `${apiBase}/statistic/revenue/daily?start=${start}&end=${end}`
        const title = `Doanh thu theo ngày từ ${start} đến ${end}`
        doFetch(url, title, createMapper("revenue"))
    }

    // Profit fetch functions
    const fetchProfitToday = () => {
        const dt = new Date()
        const ds = formatDateStr(dt)
        const url = `${apiBase}/statistic/profit/hourly?date=${ds}`
        const title = `Lợi nhuận theo giờ ngày ${ds}`
        doFetch(url, title, createMapper("profit"))
    }

    const fetchProfitYesterday = () => {
        const dt = new Date()
        dt.setDate(dt.getDate() - 1)
        const ds = formatDateStr(dt)
        const url = `${apiBase}/statistic/profit/hourly?date=${ds}`
        const title = `Lợi nhuận theo giờ ngày ${ds}`
        doFetch(url, title, createMapper("profit"))
    }

    const fetchProfitLast7Days = () => {
        const d = new Date()
        const past = new Date()
        past.setDate(d.getDate() - 6)
        const start = formatDateStr(past)
        const end = formatDateStr(d)
        const url = `${apiBase}/statistic/profit/daily?start=${start}&end=${end}`
        const title = `Lợi nhuận theo ngày từ ${start} đến ${end}`
        doFetch(url, title, (item) => {
            const dateStr = item.date
            const amount = Number(item.revenue) || 0
            const dObj = new Date(dateStr)
            return {
                label: dObj.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }),
                amount,
            }
        })
    }

    const fetchProfitLast30Days = () => {
        const d = new Date()
        const past = new Date()
        past.setDate(d.getDate() - 29)
        const start = formatDateStr(past)
        const end = formatDateStr(d)
        const url = `${apiBase}/statistic/profit/daily?start=${start}&end=${end}`
        const title = `Lợi nhuận theo ngày từ ${start} đến ${end}`
        doFetch(url, title, createMapper("profit"))
    }

    // Generic fetch functions that work for both revenue and profit
    const fetchToday = () => {
        if (chartType === "revenue") {
            fetchRevenueToday()
        } else {
            fetchProfitToday()
        }
    }

    const fetchYesterday = () => {
        if (chartType === "revenue") {
            fetchRevenueYesterday()
        } else {
            fetchProfitYesterday()
        }
    }

    const fetchLast7Days = () => {
        if (chartType === "revenue") {
            fetchRevenueLast7Days()
        } else {
            fetchProfitLast7Days()
        }
    }

    const fetchLast30Days = () => {
        if (chartType === "revenue") {
            fetchRevenueLast30Days()
        } else {
            fetchProfitLast30Days()
        }
    }

    // Custom fetch functions
    const fetchBySelectedDate = () => {
        if (!selectedDate) {
            setChartError("Vui lòng chọn ngày")
            return
        }
        const ds = formatDateStr(selectedDate)
        const endpoint = chartType === "revenue" ? "revenue" : "profit"
        const url = `${apiBase}/statistic/${endpoint}/hourly?date=${ds}`
        const title = `${chartType === "revenue" ? "Doanh thu" : "Lợi nhuận"} theo giờ ngày ${ds}`
        doFetch(url, title, createMapper(chartType))
        setSelectedOption("date")
    }

    const fetchBySelectedWeek = () => {
        const { from, to } = selectedRange
        if (!from || !to) {
            setChartError("Vui lòng chọn ngày bắt đầu và kết thúc")
            return
        }
        if (new Date(from) > new Date(to)) {
            setChartError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc")
            return
        }
        const start = formatDateStr(from)
        const end = formatDateStr(to)
        const endpoint = chartType === "revenue" ? "revenue" : "profit"
        const url = `${apiBase}/statistic/${endpoint}/daily?start=${start}&end=${end}`
        const title = `${chartType === "revenue" ? "Doanh thu" : "Lợi nhuận"} theo ngày từ ${start} đến ${end}`
        doFetch(url, title, (item) => {
            const dateStr = item.date
            const amount = Number(item.revenue) || 0
            const dObj = new Date(dateStr)
            return {
                label: dObj.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }),
                amount,
            }
        })
        setSelectedOption("week")
    }

    const fetchBySelectedMonth = () => {
        if (!selectedMonth || !selectedYearForMonth) {
            setChartError("Vui lòng chọn năm và tháng")
            return
        }
        const m = selectedMonth,
            y = selectedYearForMonth
        const endpoint = chartType === "revenue" ? "revenue" : "profit"
        const url = `${apiBase}/statistic/${endpoint}/month?year=${y}&month=${m}`
        const title = `${chartType === "revenue" ? "Doanh thu" : "Lợi nhuận"} theo ngày trong tháng ${m}/${y}`
        doFetch(url, title, createMapper(chartType))
        setSelectedOption("month")
    }

    const fetchBySelectedYear = () => {
        if (!selectedYearOnly) {
            setChartError("Vui lòng chọn năm")
            return
        }
        const y = Number.parseInt(selectedYearOnly, 10)
        if (isNaN(y)) {
            setChartError("Năm không hợp lệ")
            return
        }
        const endpoint = chartType === "revenue" ? "revenue" : "profit"
        const url = `${apiBase}/statistic/${endpoint}/year?year=${y}`
        const title = `${chartType === "revenue" ? "Doanh thu" : "Lợi nhuận"} theo tháng trong năm ${y}`
        doFetch(url, title, createMapper(chartType))
        setSelectedOption("year")
    }

    // Khi click menu trái
    const handleMenuClick = (option) => {
        setChartError(null)
        setSelectedOption(option)
        // Reset input custom khi click group 2
        if (option === "date") {
            setSelectedDate(undefined)
        }
        if (option === "week") {
            setSelectedRange({ from: undefined, to: undefined })
        }
        if (option === "month") {
            setSelectedMonth(null)
            setSelectedYearForMonth(null)
        }
        if (option === "year") {
            setSelectedYearOnly("")
        }
        // Với nhóm 1, fetch ngay và đóng panel
        if (option === "today") {
            fetchToday()
            setShowPanel(false)
            setActiveOption(null)
        } else if (option === "yesterday") {
            fetchYesterday()
            setShowPanel(false)
            setActiveOption(null)
        } else if (option === "last7") {
            fetchLast7Days()
            setShowPanel(false)
            setActiveOption(null)
        } else if (option === "last30") {
            fetchLast30Days()
            setShowPanel(false)
            setActiveOption(null)
        } else {
            // Với nhóm custom, mở popover bên phải
            setActiveOption(option)
        }
    }

    // Khi thay đổi loại chart (revenue/profit)
    const handleChartTypeChange = (newType) => {
        setChartType(newType)
        // Refresh data với loại mới
        if (selectedOption === "today") {
            if (newType === "revenue") fetchRevenueToday()
            else fetchProfitToday()
        } else if (selectedOption === "yesterday") {
            if (newType === "revenue") fetchRevenueYesterday()
            else fetchProfitYesterday()
        } else if (selectedOption === "last7") {
            if (newType === "revenue") fetchRevenueLast7Days()
            else fetchProfitLast7Days()
        } else if (selectedOption === "last30") {
            if (newType === "revenue") fetchRevenueLast30Days()
            else fetchProfitLast30Days()
        }
        // Với custom options, user sẽ cần click "Xem" lại
    }

    // Render menu trái tách 2 nhóm
    const renderMenuLeft = () => (
        <div className="dashboard-timeframe-menu">
            {/* Nhóm 1 */}
            <ul className="dashboard-menu-group">
                <li className={selectedOption === "today" ? "active" : ""} onClick={() => handleMenuClick("today")}>
                    Hôm nay
                </li>
                <li className={selectedOption === "yesterday" ? "active" : ""} onClick={() => handleMenuClick("yesterday")}>
                    Hôm qua
                </li>
                <li className={selectedOption === "last7" ? "active" : ""} onClick={() => handleMenuClick("last7")}>
                    Trong 7 ngày qua
                </li>
                <li className={selectedOption === "last30" ? "active" : ""} onClick={() => handleMenuClick("last30")}>
                    Trong 30 ngày qua
                </li>
            </ul>
            {/* Nhóm 2 */}
            <ul className="dashboard-menu-group">
                <li className={selectedOption === "date" ? "active" : ""} onClick={() => handleMenuClick("date")}>
                    Theo ngày
                </li>
                <li className={selectedOption === "week" ? "active" : ""} onClick={() => handleMenuClick("week")}>
                    Theo tuần
                </li>
                <li className={selectedOption === "month" ? "active" : ""} onClick={() => handleMenuClick("month")}>
                    Theo tháng
                </li>
                <li className={selectedOption === "year" ? "active" : ""} onClick={() => handleMenuClick("year")}>
                    Theo năm
                </li>
            </ul>
        </div>
    )

    // Nội dung popover bên phải cho nhóm custom
    const renderContentRight = () => {
        switch (activeOption) {
            case "date":
                return (
                    <div className="dashboard-timeframe-content">
                        <p>Chọn ngày:</p>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(d) => {
                                setSelectedDate(d)
                                setChartError(null)
                            }}
                            disabled={{ after: new Date() }}
                        />
                        <button onClick={fetchBySelectedDate}>Xem</button>
                        {chartError && <div className="dashboard-timeframe-error">{chartError}</div>}
                    </div>
                )
            case "week":
                return (
                    <div className="dashboard-timeframe-content">
                        <p>Chọn khoảng tuần (từ – đến):</p>
                        <DayPicker
                            mode="range"
                            selected={selectedRange}
                            onSelect={(range) => {
                                setSelectedRange(range || { from: undefined, to: undefined })
                                setChartError(null)
                            }}
                            disabled={{ after: new Date() }}
                        />
                        <button onClick={fetchBySelectedWeek}>Xem</button>
                        {chartError && <div className="dashboard-timeframe-error">{chartError}</div>}
                    </div>
                )
            case "month":
                const now = new Date()
                const currentYear = now.getFullYear()
                const currentMonth = now.getMonth() + 1
                return (
                    <div className="dashboard-timeframe-content">
                        <p>Chọn năm:</p>
                        <div className="dashboard-year-select-container">
                            <select
                                value={selectedYearForMonth || ""}
                                onChange={(e) => {
                                    const y = Number.parseInt(e.target.value, 10)
                                    if (isNaN(y)) {
                                        setSelectedYearForMonth(null)
                                    } else {
                                        setSelectedYearForMonth(y)
                                    }
                                    setSelectedMonth(null)
                                    setChartError(null)
                                }}
                            >
                                <option value="">--Chọn năm--</option>
                                {Array.from({ length: 50 }, (_, i) => {
                                    const y = currentYear - 25 + i
                                    return (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                        {selectedYearForMonth && (
                            <>
                                <p>Chọn tháng:</p>
                                <div className="dashboard-month-grid">
                                    {Array.from({ length: 12 }, (_, idx) => {
                                        const m = idx + 1
                                        let disabled = false
                                        if (selectedYearForMonth > currentYear) {
                                            disabled = true
                                        } else if (selectedYearForMonth === currentYear && m > currentMonth) {
                                            disabled = true
                                        }
                                        const isSelected = selectedMonth === m && selectedYearForMonth
                                        return (
                                            <div
                                                key={m}
                                                className={`dashboard-month-button${isSelected ? " selected" : ""}${disabled ? " disabled" : ""}`}
                                                onClick={() => {
                                                    if (disabled) return
                                                    setSelectedMonth(m)
                                                    setChartError(null)
                                                }}
                                            >
                                                Tháng {m}
                                            </div>
                                        )
                                    })}
                                </div>
                                <button style={{ marginTop: "12px" }} onClick={fetchBySelectedMonth}>
                                    Xem
                                </button>
                                {chartError && <div className="dashboard-timeframe-error">{chartError}</div>}
                            </>
                        )}
                    </div>
                )
            case "year":
                const nowY = new Date().getFullYear()
                return (
                    <div className="dashboard-timeframe-content">
                        <p>Chọn năm:</p>
                        <select
                            value={selectedYearOnly}
                            onChange={(e) => {
                                setSelectedYearOnly(e.target.value)
                                setChartError(null)
                            }}
                        >
                            <option value="">--Chọn năm--</option>
                            {Array.from({ length: 50 }, (_, i) => {
                                const y = nowY - 25 + i
                                if (y > nowY) return null
                                return (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                )
                            })}
                        </select>
                        <button style={{ marginTop: "8px" }} onClick={fetchBySelectedYear}>
                            Xem
                        </button>
                        {chartError && <div className="dashboard-timeframe-error">{chartError}</div>}
                    </div>
                )
            default:
                return (
                    <div className="dashboard-timeframe-content">
                        <p>Chọn mục bên trái để thao tác.</p>
                    </div>
                )
        }
    }

    // Chart render
    const renderChart = () => {
        if (loadingChart) {
            return <div className="dashboard-loading-spinner">Đang tải dữ liệu...</div>
        }
        if (chartError && ["today", "yesterday", "last7", "last30"].includes(selectedOption)) {
            return <div className="dashboard-error-message">{chartError}</div>
        }
        if (!chartData || chartData.length === 0) {
            return <div className="dashboard-no-data-message">Chưa có dữ liệu để hiển thị.</div>
        }

        const amountLabel = chartType === "revenue" ? "doanh thu" : "lợi nhuận"
        const lineColor = chartType === "revenue" ? "#4f46e5" : "#f59e0b"

        return (
            <div className="dashboard-chart-container">
                <div className="dashboard-chart-header">
                    <h2>{chartTitle}</h2>
                    <div className="dashboard-chart-total">
                        <span className="dashboard-total-label">Tổng {amountLabel}:</span>
                        <span className="dashboard-total-value">{new Intl.NumberFormat("vi-VN").format(totalAmount)} VNĐ</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={{ stroke: "#e5e7eb" }} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={{ stroke: "#e5e7eb" }} />
                        <Tooltip
                            formatter={(value) => [new Intl.NumberFormat("vi-VN").format(value) + " VNĐ", amountLabel]}
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke={lineColor}
                            strokeWidth={3}
                            dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }

    // Render Top Selling Products
    const renderTopSelling = () => {
        const displayItems = showAllTopSelling ? topSelling : topSelling.slice(0, 5)

        return (
            <div className="dashboard-top-selling-section">
                <div className="dashboard-section-header">
                    <h3>🏆 Sản phẩm bán chạy</h3>
                    {topSelling.length > 5 && (
                        <button className="dashboard-view-more-btn" onClick={() => setShowAllTopSelling(!showAllTopSelling)}>
                            {showAllTopSelling ? "Thu gọn" : "Xem thêm"}
                        </button>
                    )}
                </div>

                {loadingTopSelling ? (
                    <div className="dashboard-loading-spinner">Đang tải...</div>
                ) : topSelling.length === 0 ? (
                    <div className="dashboard-no-data-message">Không có dữ liệu sản phẩm bán chạy</div>
                ) : (
                    <div className="dashboard-top-selling-list">
                        {displayItems.map((item, index) => (
                            <div key={item.productId || index} className="dashboard-top-selling-item">
                                <div className="dashboard-rank-badge">#{index + 1}</div>
                                <div className="dashboard-product-details">
                                    <p className="dashboard-product-sku">SKU: {item.skuCode}</p>
                                </div>
                                <div className="dashboard-sales-stats">
                                    <div className="dashboard-quantity-sold">
                                        <span className="dashboard-stat-value">{item.totalSold}</span>
                                        <span className="dashboard-stat-label">đã bán</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowPanel(false)
                setActiveOption(null)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    // Init fetch
    useEffect(() => {
        fetchOrderCounts()
        fetchTopStorage()
        fetchTotalStorage()
        fetchTopSelling() // Thêm fetch top selling
        fetchRevenueToday() // Mặc định load revenue hôm nay
    }, [])

    // Khi mount, fetch hôm nay mặc định
    useEffect(() => {
        fetchRevenueToday()
        setSelectedOption("today")
    }, [])

    const renderTables = () => (
        <div className="dashboard-tables">
            <div className="dashboard-orders-table">
                <div className="dashboard-table-header">
                    <h3>📋 Danh sách cần làm</h3>
                </div>
                <div className="dashboard-orders-status-container">
                    <div className="dashboard-order-status-block pending" onClick={() => navigate("/admin/orders")}>
                        <div className="dashboard-status-icon">⏳</div>
                        <div className="dashboard-status-info">
                            <div className="dashboard-status-count">{countPending}</div>
                            <div className="dashboard-status-label">Chờ xác nhận</div>
                        </div>
                    </div>
                    <div className="dashboard-order-status-block processing" onClick={() => navigate("/admin/orders")}>
                        <div className="dashboard-status-icon">⚡</div>
                        <div className="dashboard-status-info">
                            <div className="dashboard-status-count">{countProcessing}</div>
                            <div className="dashboard-status-label">Đang xử lý</div>
                        </div>
                    </div>
                    <div className="dashboard-order-status-block canceled" onClick={() => navigate("/admin/orders")}>
                        <div className="dashboard-status-icon">❌</div>
                        <div className="dashboard-status-info">
                            <div className="dashboard-status-count">{countCanceled}</div>
                            <div className="dashboard-status-label">Đã hủy</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dashboard-storage-table">
                <div className="dashboard-table-header">
                    <h3>📦 Tổng sản phẩm trong kho: {totalStorageCount}</h3>
                </div>
                <div className="dashboard-table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>SKU Code</th>
                            <th>Số lượng</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topStorage.map((item) => (
                            <tr key={item.skuCode}>
                                <td>{item.skuCode}</td>
                                <td>
                                    <span className="dashboard-quantity-badge">{item.quantity}</span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )

    return (
        <div className="dashboard-container">
            {/* Header với toggle buttons */}
            <div className="dashboard-header">
                <h1>📊 Dashboard Quản lý</h1>
                <div className="dashboard-chart-type-selector">
                    <button
                        className={`dashboard-chart-type-btn ${chartType === "revenue" ? "active" : ""}`}
                        onClick={() => handleChartTypeChange("revenue")}
                    >
                        💰 Doanh thu
                    </button>
                    <button
                        className={`dashboard-chart-type-btn ${chartType === "profit" ? "active" : ""}`}
                        onClick={() => handleChartTypeChange("profit")}
                    >
                        📈 Lợi nhuận
                    </button>
                </div>
            </div>

            {/* Time frame selector */}
            <div className="dashboard-timeframe-dropdown" ref={dropdownRef}>
                <div
                    className="dashboard-timeframe-button"
                    onClick={() => {
                        setShowPanel((prev) => !prev)
                        setChartError(null)
                    }}
                >
                    📅 Khung Thời Gian ▾
                </div>
                <div className={`dashboard-timeframe-panel ${showPanel ? "" : "hidden"}`}>
                    {renderMenuLeft()}
                    {renderContentRight()}
                </div>
            </div>

            {/* Main content area */}
            <div className="dashboard-main-content">
                {/* Chart section */}
                <div className="dashboard-chart-section">{renderChart()}</div>

                {/* Top selling section */}
                {renderTopSelling()}
            </div>

            {/* Tables section */}
            {renderTables()}
        </div>
    )
}

export default Dashboard
