export type TemplateName = "hello" | "mvc";
export interface TemplateContext {
    readonly projectName: string;
    readonly packageName: string;
}
export declare function createTemplateFiles(template: TemplateName, context: TemplateContext): Map<string, string>;
