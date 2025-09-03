"use client"

import { useState } from "react"
import "../../styles/EmojiPicker.css"

const EMOJI_CATEGORIES = {
    smileys: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "😋",
        "😛",
        "😝",
        "😜",
        "🤪",
        "🤨",
        "🧐",
        "🤓",
        "😎",
        "🤩",
        "🥳",
    ],
    gestures: [
        "👍",
        "👎",
        "👌",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "🖕",
        "👇",
        "☝️",
        "👋",
        "🤚",
        "🖐️",
        "✋",
        "🖖",
        "👏",
        "🙌",
        "🤲",
        "🤝",
        "🙏",
    ],
    hearts: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
    ],
    objects: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⭐", "🌟", "💫", "✨", "🔥", "💯", "💢", "💥", "💦", "💨"],
}

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }) {
    const [activeCategory, setActiveCategory] = useState("smileys")

    if (!isOpen) return null

    return (
        <div className="emoji-picker-overlay" onClick={onClose}>
            <div className="emoji-picker" onClick={(e) => e.stopPropagation()}>
                <div className="emoji-categories">
                    <button
                        className={`category-btn ${activeCategory === "smileys" ? "active" : ""}`}
                        onClick={() => setActiveCategory("smileys")}
                    >
                        😀
                    </button>
                    <button
                        className={`category-btn ${activeCategory === "gestures" ? "active" : ""}`}
                        onClick={() => setActiveCategory("gestures")}
                    >
                        👍
                    </button>
                    <button
                        className={`category-btn ${activeCategory === "hearts" ? "active" : ""}`}
                        onClick={() => setActiveCategory("hearts")}
                    >
                        ❤️
                    </button>
                    <button
                        className={`category-btn ${activeCategory === "objects" ? "active" : ""}`}
                        onClick={() => setActiveCategory("objects")}
                    >
                        🎉
                    </button>
                </div>
                <div className="emoji-grid">
                    {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                        <button
                            key={index}
                            className="emoji-btn"
                            onClick={() => {
                                onEmojiSelect(emoji)
                                onClose()
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
