export function countOccurrences(text: string, token: string): number {
  if (!token) return 0;
  return text.split(token).length - 1;
}
