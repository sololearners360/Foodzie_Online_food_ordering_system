export async function resolve(specifier, context, nextResolve) {
    if (specifier === "openai") {
        return {
            url: new URL("./openai.mock.mjs", import.meta.url).href,
            shortCircuit: true,
        };
    }

    return nextResolve(specifier, context);
}
