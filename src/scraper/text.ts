const LOWERCASE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'e', 'o', 'a', 'con', 'para', 'por']);

export function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i > 0 && LOWERCASE_WORDS.has(word) ? word : word.replace(/\p{L}/u, (c) => c.toUpperCase())))
    .join(' ');
}
