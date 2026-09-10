/**
 * Server-side HTML sanitizer for note content.
 * 
 * Uses an allowlist approach — only known-safe tags, attributes, and protocols
 * are permitted. Everything else is stripped.
 * 
 * Supports all rich text features:
 * - Font family, font size (pt/px), text color, highlight
 * - Tables, headings, lists, checklists, blockquotes, code
 * - Images (uploaded base64 and safe HTTP URLs)
 * - Page breaks and custom layout attributes
 */

const ALLOWED_TAGS = new Set([
  // Block elements
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'hr', 'br', 'div',
  // Inline elements
  'a', 'strong', 'em', 'u', 's', 'mark', 'span', 'sub', 'sup',
  // Media & interactive
  'img', 'label', 'input',
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  '*': new Set(['class', 'style', 'data-type', 'data-checked', 'data-placeholder', 'data-color', 'data-align', 'data-wrap', 'data-rotation', 'data-aspect-ratio', 'id']),
  'a': new Set(['href', 'target', 'rel', 'title']),
  'img': new Set(['src', 'alt', 'title', 'width', 'height', 'data-align', 'data-wrap', 'data-rotation', 'data-aspect-ratio']),
  'td': new Set(['colspan', 'rowspan', 'colwidth']),
  'th': new Set(['colspan', 'rowspan', 'colwidth']),
  'input': new Set(['type', 'checked', 'disabled']),
  'ol': new Set(['start', 'type']),
};

const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);


const ALLOWED_STYLE_PROPERTIES = new Set([
  'color',
  'background-color',
  'text-align',
  'text-decoration',
  'font-weight',
  'font-style',
  'font-family',
  'font-size',
  'min-width',
  'width',
  'max-width',
  'height',
  'display',
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'float',
  'clear',
  'position',
  'z-index',
  'opacity',
  'transform',
  'transform-origin',
  'vertical-align',
  'object-fit',
]);

// Match HTML tags
const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g;
const ATTR_REGEX = /([a-zA-Z][a-zA-Z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

/**
 * Sanitize an HTML string by removing disallowed tags, attributes, and protocols.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove dangerous executable tags entirely (including content)
  let sanitized = html.replace(
    /<(script|iframe|object|embed|form|applet|base|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi,
    ''
  );
  // Also remove self-closing versions
  sanitized = sanitized.replace(
    /<(script|iframe|object|embed|form|applet|base|link|meta)\b[^>]*\/?>/gi,
    ''
  );

  // Remove any on* event handlers from remaining tags
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Process each tag
  sanitized = sanitized.replace(TAG_REGEX, (match, tagName, attrs) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return ''; // Strip disallowed tags
    }

    if (!attrs || !attrs.trim()) {
      // Self-closing or no attributes
      if (match.endsWith('/>') || tag === 'img' || tag === 'br' || tag === 'hr') {
        return `<${tag} />`;
      }
      if (match.startsWith('</')) return `</${tag}>`;
      return `<${tag}>`;
    }

    // Filter attributes
    const allowedAttrs: string[] = [];
    const globalAllowed = ALLOWED_ATTRIBUTES['*'] || new Set();
    const tagAllowed = ALLOWED_ATTRIBUTES[tag] || new Set();

    let attrMatch;
    ATTR_REGEX.lastIndex = 0;
    while ((attrMatch = ATTR_REGEX.exec(attrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Skip event handlers
      if (attrName.startsWith('on')) continue;

      // Check if attribute is allowed
      if (!globalAllowed.has(attrName) && !tagAllowed.has(attrName)) continue;

      // Sanitize href
      if (attrName === 'href') {
        const trimmed = attrValue.trim();
        try {
          const url = new URL(trimmed, 'https://placeholder.com');
          if (ALLOWED_LINK_PROTOCOLS.has(url.protocol)) {
            allowedAttrs.push(`href="${escapeAttrValue(trimmed)}"`);
          }
        } catch {
          // Disallow malformed href
        }
        continue;
      }

      // Sanitize src (images)
      if (attrName === 'src') {
        const trimmed = attrValue.trim();
        if (tag === 'img') {
          if (trimmed.startsWith('data:image/')) {
            const match = trimmed.match(/^data:(image\/[a-zA-Z0-9\-\+\.]+);base64,/i);
            if (match && ALLOWED_IMAGE_MIMES.has(match[1].toLowerCase())) {
              allowedAttrs.push(`src="${trimmed}"`);
            }
            continue;
          }
          try {
            const url = new URL(trimmed, 'https://placeholder.com');
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              allowedAttrs.push(`src="${escapeAttrValue(trimmed)}"`);
            }
          } catch {
            // Disallow malformed src
          }
          continue;
        }
        continue;
      }

      // Sanitize style
      if (attrName === 'style') {
        const cleanStyle = sanitizeStyle(attrValue);
        if (cleanStyle) {
          allowedAttrs.push(`style="${cleanStyle}"`);
        }
        continue;
      }

      // Add noopener noreferrer for target="_blank"
      if (attrName === 'target' && attrValue === '_blank') {
        allowedAttrs.push(`target="_blank"`);
        allowedAttrs.push(`rel="noopener noreferrer"`);
        continue;
      }

      if (attrName === 'rel' && tag === 'a') {
        // Handled automatically or preserved safely
        allowedAttrs.push(`rel="noopener noreferrer"`);
        continue;
      }

      allowedAttrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
    }


    const isClosing = match.startsWith('</');
    const isSelfClosing = match.endsWith('/>') || tag === 'img' || tag === 'br' || tag === 'hr';

    if (isClosing) return `</${tag}>`;

    const attrStr = allowedAttrs.length > 0 ? ' ' + allowedAttrs.join(' ') : '';
    return `<${tag}${attrStr}${isSelfClosing ? ' /' : ''}>`;
  });

  return sanitized;
}

function sanitizeStyle(style: string): string {
  const declarations = style.split(';').filter(Boolean);
  const safe: string[] = [];

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;

    const prop = decl.substring(0, colonIdx).trim().toLowerCase();
    const value = decl.substring(colonIdx + 1).trim();

    if (ALLOWED_STYLE_PROPERTIES.has(prop)) {
      // Reject values containing expression() or javascript
      if (/expression\s*\(|javascript:/i.test(value)) continue;
      safe.push(`${prop}: ${value}`);
    }
  }

  return safe.join('; ');
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
