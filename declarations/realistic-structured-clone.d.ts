declare module 'intercept-stdout' {
    export type InterceptFunction = (data: string) => string|void;
    export type UnhookInterceptFunction = () => void;
    export default function (stdoutIntercept: InterceptFunction, stderrIntercept?: InterceptFunction|undefined): () => UnhookInterceptFunction;
}