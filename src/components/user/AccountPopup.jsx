"use client"

import { useState, useEffect, useContext } from "react"
import Popup from "../common/Popup"
import { AuthContext } from "../common/AuthContext"
import "../../styles/account-popup.css"
export default function AccountPopup({ isOpen, onClose }) {
    const { user, login } = useContext(AuthContext)

    // State cho form profile
    const [profileData, setProfileData] = useState({
        phone: "",
        username: "",
        email: "",
        gender: "",
        birthday: "",
    })
    const [loadingProfile, setLoadingProfile] = useState(false)

    // State cho form đổi mật khẩu
    const [showChangePass, setShowChangePass] = useState(false)
    const [passwordData, setPasswordData] = useState({
        oldPass: "",
        newPass: "",
        confirmNewPass: "",
        emailForPass: "",
    })
    const [loadingPass, setLoadingPass] = useState(false)

    const [serverError, setServerError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // Khi popup mở, bind data user
    useEffect(() => {
        if (isOpen && user) {
            setProfileData({
                phone: user.phone || "",
                username: user.username || "",
                email: user.email || "",
                gender: user.gender || "",
                birthday: user.birthday || "",
            })
            setServerError("")
            setSuccessMessage("")
            setShowChangePass(false)
            setPasswordData({
                oldPass: "",
                newPass: "",
                confirmNewPass: "",
                emailForPass: "",
            })
        }
    }, [isOpen, user])

    // Handle change profile fields
    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfileData((prev) => ({ ...prev, [name]: value }))
        setServerError("")
        setSuccessMessage("")
    }

    // Handle change password fields
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
        setServerError("")
        setSuccessMessage("")
    }

    // Validate profile (kiểm tra email nếu có)
    const validateProfileForm = () => {
        const newErrors = {}
        if (profileData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(profileData.email)) {
                newErrors.email = "Email không hợp lệ"
            }
        }
        return newErrors
    }

    // Xử lý submit profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        const errors = validateProfileForm()
        if (Object.keys(errors).length > 0) {
            setServerError(Object.values(errors)[0])
            return
        }

        setLoadingProfile(true)
        setServerError("")
        setSuccessMessage("")

        try {
            const token = localStorage.getItem("TOKEN")
            if (!token) {
                setServerError("Bạn chưa đăng nhập")
                setLoadingProfile(false)
                return
            }

            const payload = {
                pass: "", // không gửi mật khẩu ở đây
                username: profileData.username,
                email: profileData.email,
                gender: profileData.gender,
                birthday: profileData.birthday,
            }

            const res = await fetch("http://localhost:8080/api/auth/changeInfoAccount", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            const body = await res.json()
            if (!res.ok) {
                setServerError(body.message || "Cập nhật thất bại")
            } else {
                setSuccessMessage("Cập nhật thông tin thành công!")
                await login(token) // fetch lại profile mới
                setTimeout(() => {
                    setSuccessMessage("")
                    onClose()
                }, 1000)
            }
        } catch (err) {
            console.error("Fetch error:", err)
            setServerError("Không thể kết nối đến server")
        } finally {
            setLoadingProfile(false)
        }
    }

    // Validate password form
    const validatePasswordForm = () => {
        const newErrors = {}
        if (!passwordData.oldPass) {
            newErrors.oldPass = "Mật khẩu cũ là bắt buộc"
        }
        if (!passwordData.newPass || passwordData.newPass.length < 6) {
            newErrors.newPass = "Mật khẩu mới phải có ít nhất 6 ký tự"
        }
        if (passwordData.newPass !== passwordData.confirmNewPass) {
            newErrors.confirmNewPass = "Mật khẩu mới và xác nhận không khớp"
        }
        if (!passwordData.emailForPass) {
            newErrors.emailForPass = "Email là bắt buộc"
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(passwordData.emailForPass)) {
                newErrors.emailForPass = "Email không hợp lệ"
            }
        }
        return newErrors
    }

    // Xử lý submit password form
    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        const errors = validatePasswordForm()
        if (Object.keys(errors).length > 0) {
            setServerError(Object.values(errors)[0])
            return
        }

        setLoadingPass(true)
        setServerError("")
        setSuccessMessage("")

        try {
            const token = localStorage.getItem("TOKEN")
            if (!token) {
                setServerError("Bạn chưa đăng nhập")
                setLoadingPass(false)
                return
            }

            const payload = {
                oldPassword: passwordData.oldPass,
                newPassword: passwordData.newPass,
                email: passwordData.emailForPass,
            }

            const res = await fetch("http://localhost:8080/api/auth/changePassword", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            const body = await res.json()
            if (!res.ok) {
                setServerError(body.message || "Đổi mật khẩu thất bại")
            } else {
                setSuccessMessage("Đổi mật khẩu thành công!")
                setTimeout(() => {
                    setSuccessMessage("")
                    onClose()
                }, 1000)
            }
        } catch (err) {
            console.error("Fetch error:", err)
            setServerError("Không thể kết nối đến server")
        } finally {
            setLoadingPass(false)
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Tài khoản của tôi">
            {!showChangePass ? (
                <form className="account-form" onSubmit={handleProfileSubmit}>
                    {/* PHẦN PROFILE */}
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            readOnly
                            className="form-input read-only"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Họ và tên</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={profileData.username}
                            onChange={handleProfileChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Giới tính</label>
                        <select
                            id="gender"
                            name="gender"
                            value={profileData.gender}
                            onChange={handleProfileChange}
                            className="form-input"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="birthday">Ngày sinh</label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={profileData.birthday}
                            onChange={handleProfileChange}
                            className="form-input"
                        />
                    </div>

                    {serverError && <div className="form-error">{serverError}</div>}
                    {successMessage && <div className="form-success">{successMessage}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loadingProfile}>
                            {loadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setServerError("")
                                setSuccessMessage("")
                                setShowChangePass(true)
                            }}
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </form>
            ) : (
                <form className="account-form" onSubmit={handlePasswordSubmit}>
                    {/* PHẦN ĐỔI MẬT KHẨU */}
                    <div className="form-group">
                        <label htmlFor="oldPass">Mật khẩu cũ</label>
                        <input
                            type="password"
                            id="oldPass"
                            name="oldPass"
                            value={passwordData.oldPass}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPass">Mật khẩu mới</label>
                        <input
                            type="password"
                            id="newPass"
                            name="newPass"
                            value={passwordData.newPass}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmNewPass">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            id="confirmNewPass"
                            name="confirmNewPass"
                            value={passwordData.confirmNewPass}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emailForPass">Email (để xác thực)</label>
                        <input
                            type="email"
                            id="emailForPass"
                            name="emailForPass"
                            value={passwordData.emailForPass}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                        />
                    </div>

                    {serverError && <div className="form-error">{serverError}</div>}
                    {successMessage && <div className="form-success">{successMessage}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loadingPass}>
                            {loadingPass ? "Đang gửi..." : "Xác nhận đổi mật khẩu"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setServerError("")
                                setSuccessMessage("")
                                setShowChangePass(false)
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            )}
        </Popup>
    )
}
