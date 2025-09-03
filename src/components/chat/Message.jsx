import "../../styles/Message.css"

export default function Message({ message, currentUser }) {
    const isMine = message.senderId === currentUser

    return (
        <div className={`message-wrapper ${isMine ? "mine" : "theirs"}`}>
            <div className="message-bubble">
                <div className="message-content">{message.content}</div>
                <div className="message-meta">
                    <span className="sender-name">{message.senderName}</span>
                    <span className="message-time">
            {new Date(message.sentAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            })}
          </span>
                </div>
            </div>
        </div>
    )
}
