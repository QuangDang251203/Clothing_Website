"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import "../../styles/popup.css"

export default function Popup({ isOpen, onClose, title, children }) {
    const [isAnimating, setIsAnimating] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)

    // Khi isOpen thay đổi, update state để kích hoạt animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            // Delay nhỏ để CSS transition có thể trigger
            setTimeout(() => setIsAnimating(true), 10)
        } else {
            setIsAnimating(false)
            // Phải đợi đủ thời gian transition (0.4s) trước khi unmount
            setTimeout(() => setShouldRender(false), 400)
        }
    }, [isOpen])

    const handleClose = () => {
        setIsAnimating(false)
        setTimeout(() => onClose(), 400)
    }

    // Đóng popup khi nhấn ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    if (!shouldRender) return null

    return (
        <div className={`popup-overlay ${isAnimating ? "popup-overlay-open" : ""}`} onClick={handleClose}>
            <div
                className={`popup-container ${isAnimating ? "popup-slide-in" : "popup-slide-out"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="popup-header">
                    {title && <h2 className="popup-title">{title}</h2>}
                    <button className="popup-close-btn" onClick={handleClose} aria-label="Đóng popup">
                        <X size={24} />
                    </button>
                </div>
                <div className="popup-content">{children}</div>
            </div>
        </div>
    )
}
