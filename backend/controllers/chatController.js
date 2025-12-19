import OpenAI from "openai";

const aiApiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: aiApiKey,
    baseURL: process.env.AI_BASE_URL || undefined,
});

const aiModel = process.env.AI_MODEL || "gpt-4o-mini";

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
