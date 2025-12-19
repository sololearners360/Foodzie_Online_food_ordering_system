import OpenAI from "openai";

const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: aiApiKey,
    baseURL: process.env.AI_BASE_URL || undefined,
});

const aiModel = process.env.AI_MODEL || "gpt-4o-mini";

const rateLimitWindowMs = 60 * 1000;
const rateLimitMaxRequests = 10;
const rateLimitBuckets = new Map();
const maxMessages = 15;
const maxPayloadSizeBytes = 10 * 1024; // 10 KB

// system prompts
function getInstructions(userType) {
    if (userType === "admin") {
        return `
You are the restaurant ADMIN assistant.
You help with: order management guidance, menu/inventory help, dashboard tips.
Rules:
- Do not reveal secrets (API keys, JWT secret, DB URLs).
- Do not claim you changed orders; provide steps and where to click.
- Avoid personal data. If asked for PII, refuse and suggest safe alternatives.
Keep answers short and actionable.
`;
    }

    return `
You are the CUSTOMER assistant for a food ordering website.
You help with: menu guidance, ordering help, allergy/ingredient advice, checkout and tracking instructions.
Rules:
- Never invent prices/order status. If missing info, ask the user to check the relevant page.
- Keep answers friendly and short.
`;
}

function checkRateLimit(ip) {
    const now = Date.now();
    const bucket = rateLimitBuckets.get(ip);

    if (!bucket || now - bucket.windowStart > rateLimitWindowMs) {
        rateLimitBuckets.set(ip, { count: 1, windowStart: now });
        return { allowed: true };
    }

    if (bucket.count >= rateLimitMaxRequests) {
        const retryAfter = Math.ceil((bucket.windowStart + rateLimitWindowMs - now) / 1000);
        return { allowed: false, retryAfter };
    }

    bucket.count += 1;
    return { allowed: true };
}

function validateMessages(messages) {
    if (!Array.isArray(messages)) {
        return { valid: false, reason: "messages (array) is required" };
    }

    if (messages.length === 0) {
        return { valid: false, reason: "messages cannot be empty" };
    }

    if (messages.length > maxMessages) {
        return {
            valid: false,
            reason: `messages cannot exceed ${maxMessages} items`,
        };
    }

    const sanitized = messages.map((msg, index) => {
        const role = typeof msg.role === "string" ? msg.role : null;
        const content = typeof msg.content === "string" ? msg.content.trim() : null;

        if (!role || !content) {
            throw new Error(`messages[${index}] must include role and content strings`);
        }

        return { role, content };
    });

    return { valid: true, sanitized };
}

export async function chat(req, res) {
    try {
        const { message, userType = "customer", sessionId, history = [] } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "message (string) is required" });
        }

        if (!aiApiKey) {
            return res.status(500).json({ error: "AI_API_KEY is not configured" });
        }

        // Keep only last few turns (cheap + safe for beginners)
        const trimmedHistory = Array.isArray(history) ? history.slice(-8) : [];

        const convoText = [
            ...trimmedHistory.map((m) => `${m.role?.toUpperCase()}: ${m.content}`),
            `USER: ${message}`,
        ].join("\n");

        const response = await client.responses.create({
            model: aiModel,
            instructions: getInstructions(userType),
            input: convoText,
        });

        return res.json({ reply: response.output_text });
    } catch (e) {
        console.error("Chat error:", e);
        return res.status(500).json({ error: "Chat failed" });
    }
}

export async function kuddusChat(req, res) {
    try {
        const payloadSize = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
        if (payloadSize > maxPayloadSizeBytes) {
            return res.status(413).json({ error: "Request too large" });
        }

        const rateLimit = checkRateLimit(req.ip || "global");
        if (!rateLimit.allowed) {
            return res
                .status(429)
                .json({ error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter });
        }

        const { messages = [] } = req.body || {};
        const validation = validateMessages(messages);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.reason });
        }

        if (!aiApiKey) {
            return res.status(500).json({ error: "AI_API_KEY is not configured" });
        }

        const systemMessage =
            "You are Kuddus, the calm, practical support guide for the Foodzie ordering app. " +
            "Speak warmly and concisely with step-by-step help when useful. " +
            "If a request is abusive, illegal, or asks for sensitive data, politely refuse and say you will escalate to a human support lead.";

        const trimmedMessages = validation.sanitized.slice(-maxMessages);
        const chatMessages = [{ role: "system", content: systemMessage }, ...trimmedMessages];

        const response = await client.chat.completions.create({
            model: aiModel,
            messages: chatMessages,
        });

        const reply = response.choices?.[0]?.message?.content?.trim?.();
        return res.json({ reply: reply || "" });
    } catch (e) {
        console.error("Kuddus chat error:", e);
        if (e?.message?.includes("must include role and content")) {
            return res.status(400).json({ error: e.message });
        }
        return res.status(500).json({ error: "Chat failed" });
    }
}
