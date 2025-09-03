"use client"

import { useState, useEffect, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../common/AuthContext"
import ChatWindow from "./ChatWindow"
import "../../styles/ChatPopup.css"

export default function ChatPopup({ onClose }) {
    const { user, isAuthenticated } = useContext(AuthContext)
    const [convId, setConvId] = useState(null)

    useEffect(() => {
        if (!isAuthenticated) return
        async function openConv() {
            try {
                const token = localStorage.getItem("TOKEN")
                const res = await axios.post(`http://localhost:8080/api/chat/conversations/1`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setConvId(res.data.id)
            } catch (err) {
                console.error("Lỗi khi mở cuộc trò chuyện", err)
            }
        }
        openConv()
    }, [isAuthenticated])

    return (
        <div className="chat-popup-overlay" onClick={onClose}>
            <div className="chat-popup" onClick={(e) => e.stopPropagation()}>
                <div className="chat-popup-header">
                    <div className="header-content">
                        <div className="header-info">
                            <h3>Hỗ trợ trực tuyến</h3>
                            <span className="status-indicator">
                <span className="status-dot"></span>
                Đang hoạt động
              </span>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="chat-popup-body">
                    {convId ? (
                        <ChatWindow convId={convId} />
                    ) : (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Đang kết nối...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
