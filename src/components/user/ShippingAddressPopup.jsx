"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import Popup from "../common/Popup"
import "../../styles/address.css"
import { AuthContext } from "../common/AuthContext"

export default function ShippingAddressPopup({ isOpen, onClose }) {
    const { user } = useContext(AuthContext)

    // ====== 1. CÁC STATE CHUNG ======
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Đang hiển thị view "Danh sách" hay "Form thêm" hay "Form sửa"
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)

    // ====== 2. CÀI ĐẶT CHO FORM THÊM ĐỊA CHỈ ======
    const [locations, setLocations] = useState([])
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [wardList, setWardList] = useState([])

    // Loading states for dropdowns
    const [loadingLocations, setLoadingLocations] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)

    const [selectedProvinceCode, setSelectedProvinceCode] = useState("")
    const [selectedDistrictCode, setSelectedDistrictCode] = useState("")
    const [selectedWardCode, setSelectedWardCode] = useState("")

    // Store selected names directly for reliable access
    const [selectedProvinceName, setSelectedProvinceName] = useState("")
    const [selectedDistrictName, setSelectedDistrictName] = useState("")
    const [selectedWardName, setSelectedWardName] = useState("")

    // Thông tin nhập thêm:
    const [streetDetail, setStreetDetail] = useState("")
    const [consigneeNameNew, setConsigneeNameNew] = useState("")
    const [mobileNew, setMobileNew] = useState("")
    const [adding, setAdding] = useState(false)

    // Preview address state
    const [previewAddress, setPreviewAddress] = useState("")

    // ====== 3. CÀI ĐẶT CHO CHỨC NĂNG SỬA ======
    const [selectedAddresses, setSelectedAddresses] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [updating, setUpdating] = useState(false)

    // ====== 4. HÀM CONSTRUCT ĐỊA CHỈ HOÀN CHỈNH ======
    const constructFullAddress = useCallback((streetDetail, wardName, districtName, provinceName) => {
        const addressParts = []

        if (streetDetail && streetDetail.trim()) {
            addressParts.push(streetDetail.trim())
        }
        if (wardName && wardName.trim()) {
            addressParts.push(wardName.trim())
        }
        if (districtName && districtName.trim()) {
            addressParts.push(districtName.trim())
        }
        if (provinceName && provinceName.trim()) {
            addressParts.push(provinceName.trim())
        }

        return addressParts.filter((part) => part && part.trim()).join(", ")
    }, [])

    // ====== 5. UPDATE PREVIEW ADDRESS ======
    useEffect(() => {
        const preview = constructFullAddress(streetDetail, selectedWardName, selectedDistrictName, selectedProvinceName)
        setPreviewAddress(preview)
    }, [streetDetail, selectedWardName, selectedDistrictName, selectedProvinceName, constructFullAddress])

    // ====== 6. HÀM LẤY DANH SÁCH ĐỊA CHỈ TỪ BACKEND ======
    const fetchAddresses = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`http://localhost:8080/shippingAddress/getByAccountId/${user.id}`)
            if (!res.ok) throw new Error("Không tải được danh sách địa chỉ.")
            const data = await res.json()
            setAddresses(data)
        } catch (err) {
            setError(err.message || "Lỗi hệ thống.")
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    // ====== 7. HÀM LẤY ĐỊA GIỚI HÀNH CHÍNH (API VIỆT NAM) ======
    const fetchLocations = useCallback(async () => {
        if (locations.length > 0) return // Already loaded

        setLoadingLocations(true)
        try {
            let res = await fetch("https://provinces.open-api.vn/api/p/?depth=3")
            if (!res.ok) {
                res = await fetch("https://provinces.open-api.vn/api/p/?depth=2")
            }
            if (!res.ok) throw new Error("Không lấy được danh sách địa phương.")

            const data = await res.json()
            setLocations(data)
            const provinces = data.map((p) => ({
                code: p.code,
                name: p.name,
            }))
            setProvinceList(provinces)
        } catch (err) {
            console.error("Fetch locations error:", err)
            setError("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại.")
        } finally {
            setLoadingLocations(false)
        }
    }, [locations.length])

    // ====== 8. HÀM XỬ LÝ THAY ĐỔI PROVINCE ======
    const handleProvinceChange = useCallback(
        async (provinceCode) => {
            setSelectedProvinceCode(provinceCode)
            setSelectedDistrictCode("")
            setSelectedWardCode("")
            setSelectedDistrictName("")
            setSelectedWardName("")
            setWardList([])
            setDistrictList([])

            if (!provinceCode) {
                setSelectedProvinceName("")
                return
            }

            const provCodeNum = Number(provinceCode)
            const selectedProv = provinceList.find((p) => p.code === provCodeNum)
            if (selectedProv) {
                setSelectedProvinceName(selectedProv.name)
            } else {
                setSelectedProvinceName("")
            }

            setLoadingDistricts(true)
            try {
                const provObj = locations.find((p) => p.code === provCodeNum)
                if (provObj && provObj.districts && provObj.districts.length > 0) {
                    const districts = provObj.districts.map((d) => ({
                        code: d.code,
                        name: d.name,
                    }))
                    setDistrictList(districts)
                } else {
                    const res = await fetch(`https://provinces.open-api.vn/api/p/${provCodeNum}?depth=2`)
                    if (!res.ok) throw new Error("Không lấy được danh sách quận/huyện.")
                    const data = await res.json()

                    if (data.districts && data.districts.length > 0) {
                        const districts = data.districts.map((d) => ({
                            code: d.code,
                            name: d.name,
                        }))
                        setDistrictList(districts)
                        setLocations((prev) => prev.map((p) => (p.code === provCodeNum ? { ...p, districts: data.districts } : p)))
                    } else {
                        setDistrictList([])
                        setError("Không tìm thấy quận/huyện cho tỉnh/thành phố này.")
                    }
                }
            } catch (err) {
                console.error("Fetch districts error:", err)
                setError("Không thể tải danh sách quận/huyện. Vui lòng thử lại.")
                setDistrictList([])
            } finally {
                setLoadingDistricts(false)
            }
        },
        [locations, provinceList],
    )

    // ====== 9. HÀM XỬ LÝ THAY ĐỔI DISTRICT ======
    const handleDistrictChange = useCallback(
        async (districtCode) => {
            setSelectedDistrictCode(districtCode)
            setSelectedWardCode("")
            setSelectedWardName("")
            setWardList([])

            if (!districtCode) {
                setSelectedDistrictName("")
                return
            }

            const distCodeNum = Number(districtCode)
            const selectedDist = districtList.find((d) => d.code === distCodeNum)
            if (selectedDist) {
                setSelectedDistrictName(selectedDist.name)
            } else {
                setSelectedDistrictName("")
            }

            const currentProvinceCode = selectedProvinceCode
            if (!currentProvinceCode) {
                return
            }

            setLoadingWards(true)
            try {
                const provCodeNum = Number(currentProvinceCode)
                const provObj = locations.find((p) => p.code === provCodeNum)
                if (provObj && provObj.districts) {
                    const distObj = provObj.districts.find((d) => d.code === distCodeNum)
                    if (distObj && distObj.wards && distObj.wards.length > 0) {
                        const wards = distObj.wards.map((w) => ({
                            code: w.code,
                            name: w.name,
                        }))
                        setWardList(wards)
                        setLoadingWards(false)
                        return
                    }
                }

                const res = await fetch(`https://provinces.open-api.vn/api/d/${distCodeNum}?depth=2`)
                if (!res.ok) throw new Error("Không lấy được danh sách xã/phường.")

                const data = await res.json()
                if (data.wards && data.wards.length > 0) {
                    const wards = data.wards.map((w) => ({
                        code: w.code,
                        name: w.name,
                    }))
                    setWardList(wards)

                    const provCodeNum = Number(currentProvinceCode)
                    setLocations((prev) =>
                        prev.map((p) =>
                            p.code === provCodeNum
                                ? {
                                    ...p,
                                    districts:
                                        p.districts?.map((d) => (d.code === distCodeNum ? { ...d, wards: data.wards } : d)) || [],
                                }
                                : p,
                        ),
                    )
                } else {
                    setWardList([])
                    setError("Không tìm thấy xã/phường cho quận/huyện này.")
                }
            } catch (err) {
                console.error("Fetch wards error:", err)
                setError("Không thể tải danh sách xã/phường. Vui lòng thử lại.")
                setWardList([])
            } finally {
                setLoadingWards(false)
            }
        },
        [locations, districtList, selectedProvinceCode],
    )

    // ====== 10. HÀM XỬ LÝ THAY ĐỔI WARD ======
    const handleWardChange = useCallback(
        (wardCode) => {
            setSelectedWardCode(wardCode)

            if (!wardCode) {
                setSelectedWardName("")
                return
            }

            const wardCodeNum = Number(wardCode)
            const selectedWard = wardList.find((w) => w.code === wardCodeNum)
            if (selectedWard) {
                setSelectedWardName(selectedWard.name)
            } else {
                setSelectedWardName("")
            }
        },
        [wardList],
    )

    // ====== 11. EFFECTS ======
    useEffect(() => {
        if (isOpen && user?.id) {
            fetchAddresses()
            fetchLocations()
            resetForm()
        }
    }, [isOpen, user?.id, fetchAddresses, fetchLocations])

    // ====== 12. HÀM RESET FORM ======
    const resetForm = () => {
        setShowAddForm(false)
        setShowEditForm(false)
        setSelectedProvinceCode("")
        setSelectedDistrictCode("")
        setSelectedWardCode("")
        setSelectedProvinceName("")
        setSelectedDistrictName("")
        setSelectedWardName("")
        setDistrictList([])
        setWardList([])
        setStreetDetail("")
        setConsigneeNameNew("")
        setMobileNew("")
        setPreviewAddress("")
        setError("")
        setSelectedAddresses([])
        setEditingId(null)
    }

    // ====== 13. VALIDATE ADDRESS COMPONENTS ======
    const validateAddressComponents = () => {
        const errors = []

        if (!selectedProvinceCode) {
            errors.push("Vui lòng chọn Tỉnh/Thành phố")
        }
        if (!selectedDistrictCode) {
            errors.push("Vui lòng chọn Quận/Huyện")
        }
        if (!selectedWardCode) {
            errors.push("Vui lòng chọn Xã/Phường")
        }
        if (!streetDetail || !streetDetail.trim()) {
            errors.push("Vui lòng nhập địa chỉ chi tiết")
        }
        if (!consigneeNameNew || !consigneeNameNew.trim()) {
            errors.push("Vui lòng nhập tên người nhận")
        }
        if (!mobileNew || !mobileNew.trim()) {
            errors.push("Vui lòng nhập số điện thoại")
        }
        const mobileRegex = /^[0-9]{10}$/
        if (mobileNew && !mobileRegex.test(mobileNew.trim())) {
            errors.push("Số điện thoại phải có đúng 10 chữ số")
        }

        return errors
    }

    // ====== 14. XỬ LÝ FORM THÊM MỚI ======
    const handleAddSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const validationErrors = validateAddressComponents()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(". "))
            return
        }

        setAdding(true)
        try {
            let provinceName = selectedProvinceName
            let districtName = selectedDistrictName
            let wardName = selectedWardName

            if (!provinceName && selectedProvinceCode) {
                const prov = provinceList.find((p) => p.code === Number(selectedProvinceCode))
                provinceName = prov ? prov.name : ""
            }
            if (!districtName && selectedDistrictCode) {
                const dist = districtList.find((d) => d.code === Number(selectedDistrictCode))
                districtName = dist ? dist.name : ""
            }
            if (!wardName && selectedWardCode) {
                const w = wardList.find((w) => w.code === Number(selectedWardCode))
                wardName = w ? w.name : ""
            }

            const fullAddress = constructFullAddress(streetDetail, wardName, districtName, provinceName)

            if (!fullAddress || fullAddress.trim().length === 0) {
                throw new Error("Không thể tạo địa chỉ hoàn chỉnh. Vui lòng kiểm tra lại thông tin.")
            }

            const payload = {
                accountId: user.id,
                address: fullAddress,
                mobile: mobileNew.trim(),
                consigneeName: consigneeNameNew.trim(),
            }

            const res = await fetch("http://localhost:8080/shippingAddress/addShippingAddress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || "Thêm địa chỉ thất bại.")
            }

            await fetchAddresses()
            resetForm()
        } catch (err) {
            console.error("Add address error:", err)
            setError(err.message || "Lỗi khi thêm địa chỉ.")
        } finally {
            setAdding(false)
        }
    }

    // ====== 15. XỬ LÝ FORM SỬA ======
    const handleUpdateSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const validationErrors = validateAddressComponents()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(". "))
            return
        }

        setUpdating(true)
        try {
            let provinceName = selectedProvinceName
            let districtName = selectedDistrictName
            let wardName = selectedWardName

            if (!provinceName && selectedProvinceCode) {
                const prov = provinceList.find((p) => p.code === Number(selectedProvinceCode))
                provinceName = prov ? prov.name : ""
            }
            if (!districtName && selectedDistrictCode) {
                const dist = districtList.find((d) => d.code === Number(selectedDistrictCode))
                districtName = dist ? dist.name : ""
            }
            if (!wardName && selectedWardCode) {
                const w = wardList.find((w) => w.code === Number(selectedWardCode))
                wardName = w ? w.name : ""
            }

            const fullAddress = constructFullAddress(streetDetail, wardName, districtName, provinceName)

            if (!fullAddress || fullAddress.trim().length === 0) {
                throw new Error("Không thể tạo địa chỉ hoàn chỉnh. Vui lòng kiểm tra lại thông tin.")
            }

            const payload = {
                accountId: user.id,
                address: fullAddress,
                mobile: mobileNew.trim(),
                consigneeName: consigneeNameNew.trim(),
            }

            const res = await fetch(`http://localhost:8080/shippingAddress/changeInfoShippingAddress/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || "Cập nhật thất bại.")
            }

            await fetchAddresses()
            resetForm()
        } catch (err) {
            console.error("Update address error:", err)
            setError(err.message || "Lỗi khi cập nhật địa chỉ.")
        } finally {
            setUpdating(false)
        }
    }

    // ====== 16. CHỨC NĂNG SỬA ĐỊA CHỈ ======
    const handleEditClick = () => {
        if (selectedAddresses.length === 0) {
            setError("Vui lòng chọn địa chỉ cần sửa.")
            return
        }
        if (selectedAddresses.length > 1) {
            setError("Chỉ có thể sửa một địa chỉ tại một thời điểm.")
            return
        }

        const addressToEdit = addresses.find((addr) => addr.id === selectedAddresses[0])
        if (addressToEdit) {
            setEditingId(addressToEdit.id)
            setConsigneeNameNew(addressToEdit.consigneeName || "")
            setMobileNew(addressToEdit.mobile || "")

            // Parse address to try to extract components (this is basic parsing)
            const addressParts = addressToEdit.address.split(", ")
            if (addressParts.length > 0) {
                setStreetDetail(addressParts[0] || "")
            }

            setShowEditForm(true)
            setError("")
        }
    }

    // ====== 17. XỬ LÝ CHECKBOX ======
    const handleAddressSelect = (addressId) => {
        setSelectedAddresses((prev) => {
            if (prev.includes(addressId)) {
                return prev.filter((id) => id !== addressId)
            } else {
                return [...prev, addressId]
            }
        })
    }

    // ====== 18. CHỨC NĂNG XÓA ======
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return
        setError("")
        try {
            const res = await fetch(`http://localhost:8080/shippingAddress/deleteShippingAddress/${id}`, { method: "DELETE" })
            if (!res.ok) {
                const txt = await res.text()
                throw new Error(txt || "Xóa thất bại.")
            }
            await fetchAddresses()
            setSelectedAddresses([])
        } catch (err) {
            console.error("Delete address error:", err)
            setError(err.message || "Lỗi khi xóa địa chỉ.")
        }
    }

    // ====== 19. RENDER FORM COMPONENT ======
    const renderAddressForm = (isEdit = false) => (
        <form className="address-form" onSubmit={isEdit ? handleUpdateSubmit : handleAddSubmit}>
            <h4>{isEdit ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h4>

            {/* Chọn Thành phố */}
            <div className="form-group">
                <label>Thành phố / Tỉnh *</label>
                <select
                    value={selectedProvinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={loadingLocations}
                    required
                >
                    <option value="">{loadingLocations ? "Đang tải..." : "-- Chọn thành phố --"}</option>
                    {provinceList.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                            {prov.name}
                        </option>
                    ))}
                </select>
                {selectedProvinceName && <span className="selected-info">Đã chọn: {selectedProvinceName}</span>}
            </div>

            {/* Chọn Quận/Huyện */}
            <div className="form-group">
                <label>Quận / Huyện *</label>
                <select
                    value={selectedDistrictCode}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!selectedProvinceCode || loadingDistricts}
                    required
                >
                    <option value="">
                        {loadingDistricts
                            ? "Đang tải..."
                            : !selectedProvinceCode
                                ? "-- Chọn thành phố trước --"
                                : districtList.length === 0
                                    ? "-- Không có quận/huyện --"
                                    : "-- Chọn quận --"}
                    </option>
                    {districtList.map((dist) => (
                        <option key={dist.code} value={dist.code}>
                            {dist.name}
                        </option>
                    ))}
                </select>
                {loadingDistricts && <span className="loading-text">Đang tải quận/huyện...</span>}
                {selectedDistrictName && <span className="selected-info">Đã chọn: {selectedDistrictName}</span>}
            </div>

            {/* Chọn Xã/Phường */}
            <div className="form-group">
                <label>Xã / Phường *</label>
                <select
                    value={selectedWardCode}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={!selectedDistrictCode || loadingWards}
                    required
                >
                    <option value="">
                        {loadingWards
                            ? "Đang tải..."
                            : !selectedDistrictCode
                                ? "-- Chọn quận trước --"
                                : wardList.length === 0
                                    ? "-- Không có xã/phường --"
                                    : "-- Chọn xã --"}
                    </option>
                    {wardList.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                            {ward.name}
                        </option>
                    ))}
                </select>
                {loadingWards && <span className="loading-text">Đang tải xã/phường...</span>}
                {selectedWardName && <span className="selected-info">Đã chọn: {selectedWardName}</span>}
            </div>

            {/* Nhập địa chỉ chi tiết */}
            <div className="form-group">
                <label>Địa chỉ chi tiết *</label>
                <input
                    type="text"
                    placeholder="Số nhà, tên đường..."
                    value={streetDetail}
                    onChange={(e) => setStreetDetail(e.target.value)}
                    required
                />
            </div>

            {/* Preview địa chỉ hoàn chỉnh */}
            {previewAddress && (
                <div className="address-preview">
                    <label>Địa chỉ hoàn chỉnh:</label>
                    <div className="preview-text">{previewAddress}</div>
                </div>
            )}

            {/* Tên người nhận */}
            <div className="form-group">
                <label>Tên người nhận *</label>
                <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={consigneeNameNew}
                    onChange={(e) => setConsigneeNameNew(e.target.value)}
                    required
                />
            </div>

            {/* SĐT */}
            <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                    type="tel"
                    placeholder="0987654321"
                    maxLength={10}
                    value={mobileNew}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        setMobileNew(value)
                    }}
                    required
                />
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    disabled={(isEdit ? updating : adding) || loadingDistricts || loadingWards}
                    className="btn-primary"
                >
                    {isEdit ? (updating ? "Đang cập nhật..." : "Cập nhật địa chỉ") : adding ? "Đang thêm..." : "Lưu địa chỉ"}
                </button>
                <button type="button" onClick={resetForm} disabled={isEdit ? updating : adding} className="btn-secondary">
                    Hủy
                </button>
            </div>
        </form>
    )

    // ====== 20. RENDER ======
    return (
        <Popup
            isOpen={isOpen}
            onClose={() => {
                onClose()
                resetForm()
            }}
            title="Địa chỉ giao hàng"
        >
            <div className="address-popup">
                {loading ? (
                    <div className="loading-container">
                        <p>Đang tải danh sách địa chỉ...</p>
                    </div>
                ) : (
                    <>
                        {error && <div className="error-message">{error}</div>}

                        {showAddForm ? (
                            renderAddressForm(false)
                        ) : showEditForm ? (
                            renderAddressForm(true)
                        ) : (
                            <div className="address-list-view">
                                <div className="action-header">
                                    <button
                                        className="btn-add-address"
                                        onClick={() => {
                                            setShowAddForm(true)
                                            setError("")
                                        }}
                                    >
                                        + Thêm địa chỉ
                                    </button>

                                    <button
                                        className="btn-edit-selected"
                                        onClick={handleEditClick}
                                        disabled={selectedAddresses.length === 0}
                                    >
                                        Sửa địa chỉ đã chọn
                                    </button>
                                </div>

                                {addresses.length === 0 ? (
                                    <div className="empty-state">
                                        <p>Chưa có địa chỉ nào.</p>
                                        <p>Thêm địa chỉ đầu tiên để bắt đầu mua sắm!</p>
                                    </div>
                                ) : (
                                    <ul className="address-list">
                                        {addresses.map((addr) => (
                                            <li key={addr.id} className="address-item">
                                                <div className="address-view">
                                                    <div className="address-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            id={`addr-${addr.id}`}
                                                            checked={selectedAddresses.includes(addr.id)}
                                                            onChange={() => handleAddressSelect(addr.id)}
                                                        />
                                                        <label htmlFor={`addr-${addr.id}`} className="checkbox-label"></label>
                                                    </div>

                                                    <div className="info">
                                                        <strong>{addr.consigneeName}</strong>
                                                        <p className="full-address">{addr.address}</p>
                                                        <span>SĐT: {addr.mobile}</span>
                                                    </div>

                                                    <div className="action-buttons">
                                                        <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="btn-delete">
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Popup>
    )
}
