import { useState } from "react";
import "./ChatWidget.css";

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([
        { role: "assistant", content: "Hi! How can I help you today?" },
    ]);
    const [loading, setLoading] = useState(false);

    const send = async () => {
        const msg = input.trim();
        if (!msg || loading) return;

        const nextHistory = [...history, { role: "user", content: msg }];
        setHistory(nextHistory);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    userType: "customer",
                    sessionId: "customer-session",
                    history: nextHistory,
                }),
            });

            const data = await res.json();
            setHistory([
                ...nextHistory,
                { role: "assistant", content: data.reply || "No reply." },
            ]);
        } catch (err) {
            setHistory([
                ...nextHistory,
                { role: "assistant", content: "Sorry—something went wrong." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatwidget">
            {open && (
                <div className="chatbox">
                    <div className="chatbox-header">
                        <p>Customer Help</p>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="chatbox-messages">
                        {history.map((m, i) => (
                            <div key={i} className={`msg ${m.role}`}>
                                <div className="msg-role">{m.role}</div>
                                <div className="msg-text">{m.content}</div>
                            </div>
                        ))}
                        {loading && <div className="typing">Typing…</div>}
                    </div>

                    <div className="chatbox-input">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                            placeholder="Ask about menu, order, etc."
                        />
                        <button onClick={send}>Send</button>
                    </div>
                </div>
            )}

            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                {open ? "Close" : "Chat"}
            </button>
        </div>
    );
};

export default ChatWidget;
