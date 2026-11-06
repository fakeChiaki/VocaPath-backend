const LOWERCASE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'e', 'o', 'a', 'con', 'para', 'por']);

export function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && LOWERCASE_WORDS.has(word) ? word : word.replace(/\p{L}/u, (c) => c.toUpperCase())))
    .join(' ');
}

export function summarize(text: string | null | undefined, max = 400) {
  const clean = (text ?? '').replace(/\s+/g, ' ').replace(/\.(?=\p{Lu})/gu, '. ').trim();
  if (!clean) return null;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const end = cut.lastIndexOf('. ');
  return end > 120 ? cut.slice(0, end + 1) : `${cut.trimEnd()}…`;
}
