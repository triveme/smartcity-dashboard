import sanitizeHtml from 'sanitize-html';
import * as csstree from 'css-tree';

const isCssSafe = (css: string): boolean => {
  try {
    const ast = csstree.parse(css, {
      parseValue: true,
      parseRulePrelude: true,
    });

    let safe = true;

    csstree.walk(ast, (node) => {
      if (!safe) return;
      if (node.type === 'PseudoElementSelector') {
        if (node.name === 'before' || node.name === 'after') {
          safe = false;
          return;
        }
      }

      if (node.type === 'Declaration' && node.property === 'content') {
        safe = false;
        return;
      }
    });

    return safe;
  } catch {
    return false;
  }
};
const stripUnsafeStyleBlocks = (html: string): string => {
  return html.replace(
    /<style([^>]*)>([\s\S]*?)<\/style>/gi,
    (match, attrs, cssContent) => {
      const css = cssContent.trim();

      if (!css) {
        return '';
      }

      if (!isCssSafe(css)) {
        return '';
      }

      return `<style${attrs}>${cssContent}</style>`;
    },
  );
};

const sanitizeCSSInjection = (userInput: string): string => {
  const clean = sanitizeHtml(userInput, {
    allowedTags: ['style', 'link'],
    allowedAttributes: {
      link: ['rel', 'href'],
    },
    allowedSchemes: ['https'],
    allowVulnerableTags: true,
    exclusiveFilter(frame) {
      // Nur CSS/Font-Links im Head erlauben
      if (frame.tag === 'link' && frame.attribs.rel !== 'stylesheet') {
        return true; // link entfernen
      }
      return false;
    },
    disallowedTagsMode: 'discard',

    textFilter(text, tagName) {
      if (tagName === 'style') {
        console.log(text);

        return text;
      }

      return '';
    },
  });

  const htmlWithoutUnsafeCss = stripUnsafeStyleBlocks(clean);

  return htmlWithoutUnsafeCss.trim();
  // return clean;
};

export default sanitizeCSSInjection;
