import test from "node:test";
import assert from "node:assert/strict";
import { kuddusChat, setAiClient } from "../controllers/chatController.js";

const createMockResponse = () => {
    const res = {};
    res.statusCode = 200;
    res.jsonBody = null;
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (payload) => {
        res.jsonBody = payload;
        return res;
    };
    return res;
};

test("kuddusChat returns AI reply when messages are valid", async () => {
    let capturedMessages = [];
    const mockClient = {
        chat: {
            completions: {
                create: async ({ messages }) => {
                    capturedMessages = messages;
                    return {
                        choices: [{ message: { content: `Echo: ${messages.at(-1).content}` } }],
                    };
                },
            },
        },
    };

    setAiClient(mockClient);

    const req = {
        body: { messages: [{ role: "user", content: "  Hello Foodzie " }] },
        ip: "1.2.3.4",
    };
    const res = createMockResponse();

    await kuddusChat(req, res);

    assert.equal(res.statusCode, 200);
    assert.ok(res.jsonBody.reply.includes("Hello Foodzie"));
    assert.equal(capturedMessages[1].content, "Hello Foodzie");
});

test("kuddusChat rejects empty messages array", async () => {
    const mockClient = {
        chat: {
            completions: {
                create: async () => ({ choices: [{ message: { content: "Should not be called" } }] }),
            },
        },
    };

    setAiClient(mockClient);

    const req = { body: {}, ip: "5.6.7.8" };
    const res = createMockResponse();

    await kuddusChat(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.jsonBody.error, /messages cannot be empty/i);
});
