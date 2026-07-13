/**
 * Strip a leading/trailing markdown code fence from an LLM response.
 * Handles plain ``` and ```<lang> fences; tolerates trailing whitespace
 * before the closer (Anthropic occasionally emits this).
 *
 * The optional `lang` argument widens the accepted opener tags. When
 * omitted, only ``` and ```json are accepted (the historical behaviour).
 * Pass a regex-fragment like `tsx|jsx|ts|js` to accept additional
 * languages without forking the helper.
 */
export function stripCodeFences(text: string, lang: string = 'json'): string {
  const s = text.trim();
  if (!s.startsWith('```')) return s;
  const opener = new RegExp(`^\`\`\`(?:${lang})?\\n?`);
  return s.replace(opener, '').replace(/\n?```\s*$/, '');
}

/** @deprecated Use `stripCodeFences(text)` directly. */
export function stripJSONFences(text: string): string {
  return stripCodeFences(text);
}
