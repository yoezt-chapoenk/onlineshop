/**
 * Lightweight Markdown → HTML converter (zero dependencies).
 * Supports: headings, bold, italic, inline code, code blocks,
 * blockquotes, ordered/unordered lists, horizontal rules, paragraphs,
 * and auto-linked URLs.
 */
export function parseMarkdown(md: string): string {
  let html = md;

  // Normalise line endings
  html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // --- Fenced code blocks ---
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => {
    const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code>${escaped}</code></pre>`;
  });

  // --- Headings ---
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // --- Blockquotes ---
  html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");

  // --- Horizontal rule ---
  html = html.replace(/^---+$/gm, "<hr />");

  // --- Bold & italic ---
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // --- Inline code ---
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // --- Links ---
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  // --- Auto-links ---
  html = html.replace(/(^|[\s])((https?:\/\/)[^\s]+)/g, '$1<a href="$2" rel="noopener noreferrer">$2</a>');

  // --- Unordered lists ---
  html = html.replace(/((?:^[-*+]\s+.+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^[-*+]\s+/, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // --- Ordered lists ---
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\.\s+/, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // --- Paragraphs (wrap blocks of text not already inside a tag) ---
  html = html.replace(/(^(?!<[a-z])[^\n]+)(\n(?!<[a-z])[^\n]+)*/gm, (block) => {
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/.test(block.trim())) return block;
    return `<p>${block.trim()}</p>`;
  });

  // Clean up extra newlines between block elements
  html = html.replace(/\n{2,}/g, "\n");

  return html;
}
