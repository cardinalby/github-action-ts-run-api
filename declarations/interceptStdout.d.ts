declare module 'intercept-stdout' {
    export type InterceptFunction = (data: string) => string|void;
    export type UnhookInterceptFunction = () => void;
    // noinspection JSUnusedGlobalSymbols
    export default function (stdoutIntercept: InterceptFunction, stderrIntercept?: InterceptFunction): () => UnhookInterceptFunction;
}