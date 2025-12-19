import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const chatApiUrl = `${apiBaseUrl}/api/chat/kuddus`;

const initialMessages = [
    {
        role: "assistant",
        content: "Hi, I'm Kuddus. Ask me anything about Foodzie orders, menu items, or checkout steps!",
    },
];

const containsSupportKeyword = (text = "") => {
    const lowered = text.toLowerCase();
    return /(complaint|return\b|returns\b|refund|missing item)/i.test(lowered);
};

const buildAssistantMessage = (content, supportTriggered = false) => {
    const reply = content?.trim?.() || "I didn't catch that.";
    return {
        role: "assistant",
        content: reply,
        supportNotice: supportTriggered || containsSupportKeyword(reply),
    };
};

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(initialMessages);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const messageListRef = useRef(null);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage = { role: "user", content: trimmed, supportNotice: containsSupportKeyword(trimmed) };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch(chatApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Chat failed");
            }

            const reply = data.reply?.trim?.();
            setMessages([...updatedMessages, buildAssistantMessage(reply, userMessage.supportNotice)]);
        } catch (err) {
            setMessages([
                ...updatedMessages,
                buildAssistantMessage(
                    "Sorry, I'm having trouble responding right now. Please try again in a moment.",
                    userMessage.supportNotice,
                ),
            ]);
            setError(err?.message || "Unable to reach Kuddus.");
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatwidget">
            {open && (
                <div className="chatbox" role="dialog" aria-label="Chat with Kuddus" aria-modal="false">
                    <div className="chatbox-header">
                        <div className="chatbox-title">
                            <span className="kuddus-avatar" aria-hidden="true">
                                🍲
                            </span>
                            <div>
                                <p className="chatbox-name">Kuddus</p>
                                <p className="chatbox-helper">Here to help with your order</p>
                            </div>
                        </div>
                        <button className="ghost-button" onClick={() => setOpen(false)} aria-label="Close chat window">
                            ✕
                        </button>
                    </div>

                    <div className="chatbox-messages" ref={messageListRef}>
                        {messages.map((message, index) => {
                            const showSupportNotice =
                                message.role === "assistant" &&
                                (message.supportNotice || containsSupportKeyword(message.content));

                            return (
                                <div key={index} className={`msg ${message.role}`}>
                                    {message.role === "assistant" && (
                                        <span className="kuddus-avatar small" aria-hidden="true">
                                            🍲
                                        </span>
                                    )}
                                    <div className="bubble">
                                        {message.role === "assistant" && (
                                            <p className="bubble-label">Kuddus</p>
                                        )}
                                        <p className="bubble-text">{message.content}</p>
                                        {showSupportNotice && (
                                            <div className="support-notice" role="note">
                                                Need help with a complaint or return? Call{" "}
                                                <strong>+01871 XXXXXX</strong>
                                                {" "}or email <strong>foodzie@gmail.com</strong>.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="msg assistant">
                                <span className="kuddus-avatar small" aria-hidden="true">
                                    🍲
                                </span>
                                <div className="bubble typing-bubble" aria-live="polite">
                                    <p className="bubble-label">Kuddus</p>
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && <p className="chat-error">{error}</p>}
                    </div>

                    <div className="chatbox-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask about menu items, delivery, or payments"
                            rows={2}
                            aria-label="Type your message"
                        />
                        <button
                            className="primary-button"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            aria-label="Send message"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button
                className="chat-toggle"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-label={open ? "Hide chat with Kuddus" : "Open chat with Kuddus"}
            >
                {open ? "Hide" : "Chat with Kuddus"}
            </button>
        </div>
    );
};

export default ChatWidget;
