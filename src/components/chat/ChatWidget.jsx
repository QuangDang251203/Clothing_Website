"use client"

import { useState, useContext } from "react"
import { AuthContext } from "../common/AuthContext"
import ChatPopup from "./ChatPopup"
import "../../styles/ChatWidget.css"
import { useNavigate } from "react-router-dom"

export default function ChatWidget() {
    const [open, setOpen] = useState(false)
    const { isAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()

    const toggleOpen = () => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }
        setOpen((o) => !o)
    }

    return (
        <>
            <button className="chat-widget-btn" onClick={toggleOpen}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                        fill="currentColor"
                    />
                    <circle cx="7" cy="9" r="1" fill="currentColor" />
                    <circle cx="12" cy="9" r="1" fill="currentColor" />
                    <circle cx="17" cy="9" r="1" fill="currentColor" />
                </svg>
            </button>
            {open && <ChatPopup onClose={() => setOpen(false)} />}
        </>
    )
}
