"use client"

import { useState, useEffect, useContext, useRef } from "react"
import axios from "axios"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { AuthContext } from "../common/AuthContext"
import Message from "./Message"
import EmojiPicker from "./EmojiPicker"
import "../../styles/ChatWindow.css"

const SOCKET_URL = "ws://localhost:8080/ws-chat/websocket"

export default function ChatWindow({ convId }) {
    const { user } = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [content, setContent] = useState("")
    const [isConnected, setIsConnected] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const messagesEndRef = useRef(null)
    const stompClientRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem("TOKEN")

        axios
            .get(`http://localhost:8080/api/chat/conversations/${convId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setMessages(res.data)
                scrollToBottom()
            })
            .catch((err) => console.error("Error loading messages", err))

        const client = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8080/ws-chat?token=${token}`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (str) => console.log("[STOMP]", str),
            onConnect: (frame) => {
                console.log("STOMP connected", frame)
                setIsConnected(true)

                client.subscribe(
                    `/topic/conversations/${convId}`,
                    (msg) => {
                        console.log("Received WS message:", msg.body)
                        const parsed = JSON.parse(msg.body)
                        setMessages((prev) => [...prev, parsed])
                        scrollToBottom()
                    },
                    {
                        Authorization: `Bearer ${token}`,
                    },
                )
            },
            onStompError: (frame) => console.error("STOMP error", frame),
            onWebSocketClose: (evt) => {
                console.warn("WS closed", evt)
                setIsConnected(false)
            },
            onWebSocketError: (evt) => {
                console.error("WS error", evt)
                setIsConnected(false)
            },
        })

        client.activate()
        stompClientRef.current = client

        return () => {
            client.deactivate()
        }
    }, [convId])

    const sendMessage = () => {
        if (!content.trim() || !stompClientRef.current || !isConnected) {
            console.warn("Chưa kết nối hoặc nội dung trống")
            return
        }

        const token = localStorage.getItem("TOKEN")
        console.log(`Publishing to /app/chat/${convId}/send:`, content)
        stompClientRef.current.publish({
            destination: `/app/chat/${convId}/send`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        })
        setContent("")
    }

    const handleEmojiSelect = (emoji) => {
        const newContent = content + emoji
        setContent(newContent)
        inputRef.current?.focus()
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="chat-window">
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💬</div>
                        <p>Chưa có tin nhắn nào</p>
                        <span>Hãy bắt đầu cuộc trò chuyện!</span>
                    </div>
                ) : (
                    messages.map((m) => <Message key={m.id} message={m} currentUser={user.id} />)
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="compact-input-container">
                <button className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={!isConnected}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={!isConnected}
                    className="message-input"
                />
                <button onClick={sendMessage} disabled={!isConnected || !content.trim()} className="send-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
            <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
            />
        </div>
    )
}
