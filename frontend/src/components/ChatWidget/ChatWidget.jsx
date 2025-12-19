import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

const initialMessages = [
    {
        role: "assistant",
        content: "Hi, I'm Kuddus. Ask me anything about Foodzie orders, menu items, or checkout steps!",
    },
];

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

        const userMessage = { role: "user", content: trimmed };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/chat/kuddus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Chat failed");
            }

            const reply = data.reply?.trim?.();
            setMessages([...updatedMessages, { role: "assistant", content: reply || "I didn't catch that." }]);
        } catch (err) {
            setMessages([
                ...updatedMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble responding right now. Please try again in a moment.",
                },
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
                <div className="chatbox" role="dialog" aria-label="Chat with Kuddus">
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
                        <button className="ghost-button" onClick={() => setOpen(false)} aria-label="Close chat">
                            ✕
                        </button>
                    </div>

                    <div className="chatbox-messages" ref={messageListRef}>
                        {messages.map((message, index) => (
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
                                </div>
                            </div>
                        ))}

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
                        />
                        <button className="primary-button" onClick={sendMessage} disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </div>
                </div>
            )}

            <button className="chat-toggle" onClick={() => setOpen((prev) => !prev)} aria-expanded={open}>
                {open ? "Hide" : "Chat with Kuddus"}
            </button>
        </div>
    );
};

export default ChatWidget;
