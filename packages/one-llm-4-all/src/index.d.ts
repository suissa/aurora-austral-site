export interface LLMOptions {
    system?: string;
    model?: string;
    apiKey?: string;
    json?: boolean;
    provider?: string;
    temperature?: number;
    response_format?: any;
}
declare class LLMResponse {
    private content;
    constructor(content: string);
    getText(): string;
    getJSONResponse(): any;
}
export declare function sendPrompt(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
export {};
//# sourceMappingURL=index.d.ts.map