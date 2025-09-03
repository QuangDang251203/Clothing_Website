"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "../../styles/auth-form.css"
import { AuthContext } from "./AuthContext"

const AuthForm = ({ initialMode }) => {
    const GOOGLE_CLIENT_ID = "482894447090-ankg3lek3omga75bt9b22na2ce5jcpfu.apps.googleusercontent.com"
    const { login } = useContext(AuthContext)
    const [isLogin, setIsLogin] = useState(initialMode === "login")
    const [successMessage, setSuccessMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        confirmPassword: "",
        fullName: "",
    })
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (location.pathname === "/login") setIsLogin(true)
        if (location.pathname === "/signup") setIsLogin(false)
    }, [location.pathname])

    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
        setServerError("")
        setSuccessMessage("")
    }

    const validateForm = () => {
        const newErrors = {}
        const phoneRegex = /^[0-9]{10}$/

        if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc"
        else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ (10 số)"

        if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc"
        else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"

        if (!isLogin) {
            if (!formData.fullName) newErrors.fullName = "Họ tên là bắt buộc"
            if (!formData.confirmPassword) newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc"
            else if (formData.password !== formData.confirmPassword)
                newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const from = location.state?.from?.pathname || "/"

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("handleSubmit bắt đầu", formData)
        if (!validateForm()) {
            console.log("validateForm failed", errors)
            return
        }

        setLoading(true)
        setServerError("")
        setSuccessMessage("")

        try {
            const url = isLogin ? "/api/auth/login" : "/api/auth/register"
            const payload = isLogin
                ? { phone: formData.phone, pass: formData.password }
                : {
                    phone: formData.phone,
                    pass: formData.password,
                    username: formData.fullName,
                }
            console.log("Gửi fetch tới:", url, "payload:", payload)
            const res = await fetch("http://localhost:8080" + url, {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            console.log("Fetch xong, status:", res.status)

            const text = await res.text()
            console.log("Response text:", text)
            let data
            try {
                data = JSON.parse(text)
            } catch {
                data = { message: text }
                console.warn("Không parse JSON được, dùng raw text")
            }

            if (!res.ok) {
                console.error("res.ok=false, message:", data.message)
                setServerError(data.message || "Có lỗi xảy ra")
            } else {
                console.log("Đăng nhập thành công, data:", data)
                if (isLogin) {
                    setSuccessMessage("Đăng nhập thành công!")
                    await login(data.token)
                    navigate(from, { replace: true })
                } else {
                    setSuccessMessage("Đăng ký thành công! Vui lòng đăng nhập.")
                    setTimeout(() => navigate("/login"), 2000)
                }
            }
        } catch (err) {
            console.error("❌ Fetch error:", err)
            setServerError(err.message || "Không thể kết nối đến server")
        } finally {
            setLoading(false)
        }
    }

    // Sửa lại hàm handleCredentialResponse
    const handleCredentialResponse = async (response) => {
        const idToken = response.credential
        setLoading(true)
        setServerError("")

        try {
            // Gửi Google ID token đến backend để verify và tạo JWT token
            const res = await fetch("http://localhost:8080/api/auth/google", {
                method: "POST",
                mode: "cors",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            })

            const text = await res.text()
            let data
            try {
                data = JSON.parse(text)
            } catch {
                data = { message: text }
            }

            if (!res.ok) {
                console.error("Google login failed:", data.message)
                setServerError(data.message || "Đăng nhập Google thất bại")
            } else {
                console.log("Google login successful:", data)
                setSuccessMessage("Đăng nhập Google thành công!")

                // Sử dụng JWT token từ backend thay vì Google ID token
                await login(data.token)
                navigate(from, { replace: true })
            }
        } catch (err) {
            console.error("Google sign-in failed:", err)
            setServerError("Đăng nhập Google thất bại: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider) => {
        window.location.href =
            `http://localhost:8080/oauth2/authorize/${provider.toLowerCase()}` +
            `?redirect_uri=http://localhost:3000/oauth2/redirect`
    }

    useEffect(() => {
        if (!window.google) {
            const script = document.createElement("script")
            script.src = "https://accounts.google.com/gsi/client"
            script.async = true
            script.defer = true
            script.onload = initializeGoogleButton
            document.body.appendChild(script)
        } else {
            initializeGoogleButton()
        }

        function initializeGoogleButton() {
            if (!window.google || !document.getElementById("gsi-google-button")) return

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                ux_mode: "popup",
            })

            window.google.accounts.id.renderButton(document.getElementById("gsi-google-button"), {
                theme: "outline",
                size: "large",
                width: 240,
            })
        }
    }, [])

    return (
        <>
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2 className="auth-title">{isLogin ? "Đăng Nhập" : "Đăng Ký"}</h2>
                        <p className="auth-subtitle">{isLogin ? "Chào mừng bạn quay trở lại!" : "Tạo tài khoản mới để bắt đầu"}</p>
                    </div>
                    <div className="tabs">
                        <div className="tabs-list">
                            <button
                                className={`tab-trigger ${isLogin ? "active" : ""}`}
                                onClick={() => {
                                    setIsLogin(true)
                                    navigate("/login")
                                }}
                            >
                                Đăng nhập
                            </button>
                            <button
                                className={`tab-trigger ${!isLogin ? "active" : ""}`}
                                onClick={() => {
                                    setIsLogin(false)
                                    navigate("/signup")
                                }}
                            >
                                Đăng ký
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="fullName" className="form-label">
                                        Họ và tên
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.fullName ? "error" : ""}`}
                                        placeholder="Nguyễn Văn A"
                                        disabled={loading}
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">
                                    Số điện thoại
                                </label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`form-input with-icon ${errors.phone ? "error" : ""}`}
                                        placeholder="0123456789"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu
                                </label>
                                <div className="input-wrapper">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <circle cx="12" cy="16" r="1" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className={`form-input with-icon with-action ${errors.password ? "error" : ""}`}
                                        placeholder="Nhập mật khẩu"
                                        disabled={loading}
                                    />
                                    <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            {!isLogin && (
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="input-wrapper">
                                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <circle cx="12" cy="16" r="1" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`form-input with-icon with-action ${errors.confirmPassword ? "error" : ""}`}
                                            placeholder="Nhập lại mật khẩu"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            className="input-action"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>
                            )}

                            {isLogin && (
                                <div className="forgot-password">
                                    <a href="/forgot-password" className="forgot-link">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                            )}
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
                            </button>
                        </form>
                    </div>
                    <div className="divider">
                        <span>Hoặc tiếp tục với</span>
                    </div>
                    <div className="social-buttons">
                        <div id="gsi-google-button"></div>
                    </div>
                    <div className="auth-footer">
                        <p>
                            Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
                            <a href="#">Chính sách bảo mật</a>
                        </p>
                    </div>
                </div>
            </div>
            {(serverError || successMessage) && (
                <div className="popup-overlay">
                    <div className={`popup ${serverError ? "error" : "success"}`}>
                        <span>{serverError || successMessage}</span>
                        <button
                            className="popup-close"
                            onClick={() => {
                                setServerError("")
                                setSuccessMessage("")
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default AuthForm
