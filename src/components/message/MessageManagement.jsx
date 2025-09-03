"use client"

import { useState, useContext } from "react"
import ConversationsList from "../chat/ConversationsList"
import ChatWindow from "../chat/ChatWindow"
import { AuthContext } from "../common/AuthContext"
import "../../styles/MessageManagement.css"

export default function MessageManagement() {
    const [selectedConv, setSelectedConv] = useState(null)
    const { user, loading: authLoading } = useContext(AuthContext)

    if (authLoading) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Đang xác thực...</p>
            </div>
        )
    }

    const isStaffOrAdmin = user?.roles?.includes("ROLE_STAFF") || user?.roles?.includes("ROLE_ADMIN")

    if (!isStaffOrAdmin) {
        return (
            <div className="access-denied">
                <div className="access-denied-content">
                    <div className="access-denied-icon">🔒</div>
                    <h2>Không có quyền truy cập</h2>
                    <p>Bạn không có quyền truy cập vào trang quản lý tin nhắn.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="message-management">
            <div className="message-management-header">
                <h1>Quản lý tin nhắn</h1>
                <div className="header-actions">
                    <button className="refresh-btn" onClick={() => window.location.reload()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.5008 19.9657 6.09909 18.3259"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path d="M3 18V12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Làm mới
                    </button>
                </div>
            </div>
            <div className="message-management-content">
                <div className="conversations-sidebar">
                    <ConversationsList mode="all" onSelect={setSelectedConv} selectedConvId={selectedConv} />
                </div>
                <div className="chat-main-area">
                    {selectedConv ? (
                        <ChatWindow convId={selectedConv} />
                    ) : (
                        <div className="no-conversation-selected">
                            <div className="no-conversation-content">
                                <div className="no-conversation-icon">💬</div>
                                <h3>Chọn cuộc trò chuyện</h3>
                                <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu trả lời khách hàng.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
