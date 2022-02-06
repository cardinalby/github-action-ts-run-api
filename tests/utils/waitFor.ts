export async function waitFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}