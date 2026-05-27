/**
 * Simple markdown → HTML for prose text slides.
 * Supports: **bold**, *italic*, > blockquote, \n → <br/>
 */
export function mdToHtml(md: string): string {
  return md
    .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}
