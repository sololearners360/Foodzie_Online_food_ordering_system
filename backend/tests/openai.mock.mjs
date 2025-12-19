export default class OpenAI {
    constructor() {
        this.responses = {
            create: async () => ({ output_text: "Mock response" }),
        };

        this.chat = {
            completions: {
                create: async ({ messages }) => ({
                    choices: [
                        {
                            message: {
                                content: `Mock reply: ${messages?.at?.(-1)?.content ?? ""}`,
                            },
                        },
                    ],
                }),
            },
        };
    }
}
