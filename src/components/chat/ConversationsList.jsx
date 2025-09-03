"use client"

import { useEffect, useState, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../common/AuthContext"
import "../../styles/ConversationsList.css"

export default function ConversationsList({ mode = "mine", onSelect, selectedConvId }) {
    const { user } = useContext(AuthContext)
    const [convs, setConvs] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem("TOKEN")

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true)
                const url =
                    mode === "all"
                        ? "http://localhost:8080/api/chat/conversations/all"
                        : "http://localhost:8080/api/chat/conversations"
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                // Fetch latest messages for each conversation
                const conversationsWithMessages = await Promise.all(
                    (res.data || []).map(async (conv) => {
                        try {
                            const messagesRes = await axios.get(`http://localhost:8080/api/chat/conversations/${conv.id}/messages`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                            const messages = messagesRes.data || []
                            const latestMessage = messages[messages.length - 1]

                            // Check if there are unread messages from customer
                            const unreadCount = messages.filter(
                                (msg) =>
                                    (!msg.isRead && msg.senderId !== user.id && user.roles.includes("ROLE_STAFF")) ||
                                    user.roles.includes("ROLE_ADMIN"),
                            ).length

                            return {
                                ...conv,
                                latestMessage,
                                unreadCount,
                                hasUnread: unreadCount > 0,
                            }
                        } catch (err) {
                            console.error(`Error fetching messages for conversation ${conv.id}`, err)
                            return { ...conv, latestMessage: null, unreadCount: 0, hasUnread: false }
                        }
                    }),
                )

                // Sort by latest message time
                conversationsWithMessages.sort((a, b) => {
                    const timeA = a.latestMessage ? new Date(a.latestMessage.sentAt) : new Date(a.updatedAt)
                    const timeB = b.latestMessage ? new Date(b.latestMessage.sentAt) : new Date(b.updatedAt)
                    return timeB - timeA
                })

                setConvs(conversationsWithMessages)
            } catch (err) {
                console.error("Error loading conversations", err)
            } finally {
                setLoading(false)
            }
        }
        fetchConversations()
    }, [mode, token, user])

    if (loading) {
        return (
            <div className="conversations-list">
                <div className="conversations-header">
                    <h3>Cuộc trò chuyện</h3>
                </div>
                <div className="loading-conversations">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="conversations-list">
            <div className="conversations-header">
                <h3>{mode === "all" ? "Tất cả cuộc trò chuyện" : "Cuộc trò chuyện của bạn"}</h3>
                <span className="conversation-count">{convs.length}</span>
            </div>
            <div className="conversations-content">
                {convs.length === 0 ? (
                    <div className="empty-conversations">
                        <div className="empty-icon">💬</div>
                        <p>Chưa có cuộc trò chuyện nào</p>
                    </div>
                ) : (
                    <ul className="conversations-list-items">
                        {convs.map((c) => {
                            const customerName = c.customerName || "Khách hàng"
                            const isSelected = selectedConvId === c.id
                            const latestMessage = c.latestMessage
                            const messagePreview = latestMessage
                                ? latestMessage.content.length > 50
                                    ? latestMessage.content.substring(0, 50) + "..."
                                    : latestMessage.content
                                : "Chưa có tin nhắn"

                            return (
                                <li
                                    key={c.id}
                                    className={`conversation-item ${isSelected ? "selected" : ""} ${c.hasUnread ? "has-unread" : ""}`}
                                    onClick={() => onSelect(c.id)}
                                >
                                    <div className="conversation-avatar">
                                        {customerName.charAt(0).toUpperCase()}
                                        {c.hasUnread && <div className="unread-badge">{c.unreadCount}</div>}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-header">
                                            <div className="conversation-name">{customerName}</div>
                                            <div className="conversation-time">
                                                {latestMessage
                                                    ? new Date(latestMessage.sentAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : new Date(c.updatedAt).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                            </div>
                                        </div>
                                        <div className="conversation-preview">
                                            <span className={`message-preview ${c.hasUnread ? "unread" : ""}`}>{messagePreview}</span>
                                        </div>
                                    </div>
                                    <div className="conversation-indicators">
                                        {c.hasUnread && (
                                            <div className="new-message-indicator">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" fill="#ef4444" />
                                                    <path
                                                        d="M9 12l2 2 4-4"
                                                        stroke="white"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
