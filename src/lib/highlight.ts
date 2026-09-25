import "server-only";
import { createHighlighter, type HighlighterGeneric, type ThemeRegistration } from "shiki";
import { syntax } from "./syntax-colors";

export { syntax };

const portalTheme: ThemeRegistration = {
  name: "portal-dark",
  type: "dark",
  colors: { "editor.background": "#00000000", "editor.foreground": syntax.ink },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: syntax.muted, fontStyle: "italic" } },
    { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: syntax.string } },
    { scope: ["constant.numeric"], settings: { foreground: syntax.number } },
    { scope: ["constant.language", "constant.language.boolean", "constant.language.null"], settings: { foreground: syntax.constant } },
    { scope: ["support.type.property-name", "meta.object-literal.key", "variable.other.property"], settings: { foreground: syntax.key } },
    { scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new"], settings: { foreground: syntax.keyword } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: syntax.func } },
    { scope: ["variable.other.env", "variable.other.normal.shell", "punctuation.definition.variable.shell"], settings: { foreground: syntax.number } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: syntax.punct } },
    { scope: ["variable.parameter", "string.unquoted.argument.shell", "constant.other.option"], settings: { foreground: syntax.ink } },
  ],
};

let highlighter: Promise<HighlighterGeneric<string, string>> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: [portalTheme],
    langs: ["bash", "javascript", "python", "json", "xml"],
  }) as Promise<HighlighterGeneric<string, string>>;
  return highlighter;
}

/** Returns highlighted HTML (a <pre> with inline token colours). */
export async function highlight(code: string, lang: string): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(code, { lang, theme: "portal-dark" });
}
