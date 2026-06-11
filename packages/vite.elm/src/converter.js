import fs from 'node:fs';
import path from 'node:path';

export const SHADCN_COMPONENTS = [
  'Button',
  'Card',
  'Input',
  'Dialog',
  'DropdownMenu',
  'Form',
  'Table',
  'Badge',
  'Avatar',
  'Tabs',
];

const componentAliases = new Map([
  ['Button', { tag: 'button', className: 'shadcn-button' }],
  ['Card', { tag: 'div', className: 'shadcn-card' }],
  ['CardHeader', { tag: 'div', className: 'shadcn-card-header' }],
  ['CardTitle', { tag: 'h3', className: 'shadcn-card-title' }],
  ['CardDescription', { tag: 'p', className: 'shadcn-card-description' }],
  ['CardAction', { tag: 'div', className: 'shadcn-card-action' }],
  ['CardContent', { tag: 'div', className: 'shadcn-card-content' }],
  ['CardFooter', { tag: 'div', className: 'shadcn-card-footer' }],
  ['Input', { tag: 'input', className: 'shadcn-input' }],
  ['Dialog', { tag: 'div', className: 'shadcn-dialog' }],
  ['DialogTrigger', { tag: 'button', className: 'shadcn-dialog-trigger' }],
  ['DialogContent', { tag: 'div', className: 'shadcn-dialog-content', role: 'dialog' }],
  ['DialogHeader', { tag: 'div', className: 'shadcn-dialog-header' }],
  ['DialogFooter', { tag: 'div', className: 'shadcn-dialog-footer' }],
  ['DialogTitle', { tag: 'h2', className: 'shadcn-dialog-title' }],
  ['DialogDescription', { tag: 'p', className: 'shadcn-dialog-description' }],
  ['DialogClose', { tag: 'button', className: 'shadcn-dialog-close' }],
  ['DropdownMenu', { tag: 'div', className: 'shadcn-dropdown-menu' }],
  ['DropdownMenuTrigger', { tag: 'button', className: 'shadcn-dropdown-menu-trigger' }],
  ['DropdownMenuContent', { tag: 'div', className: 'shadcn-dropdown-menu-content', role: 'menu' }],
  ['DropdownMenuGroup', { tag: 'div', className: 'shadcn-dropdown-menu-group' }],
  ['DropdownMenuLabel', { tag: 'div', className: 'shadcn-dropdown-menu-label' }],
  ['DropdownMenuItem', { tag: 'button', className: 'shadcn-dropdown-menu-item', role: 'menuitem' }],
  ['DropdownMenuCheckboxItem', { tag: 'button', className: 'shadcn-dropdown-menu-checkbox-item', role: 'menuitemcheckbox' }],
  ['DropdownMenuRadioGroup', { tag: 'div', className: 'shadcn-dropdown-menu-radio-group', role: 'radiogroup' }],
  ['DropdownMenuRadioItem', { tag: 'button', className: 'shadcn-dropdown-menu-radio-item', role: 'menuitemradio' }],
  ['DropdownMenuSeparator', { tag: 'hr', className: 'shadcn-dropdown-menu-separator' }],
  ['Form', { tag: 'form', className: 'shadcn-form' }],
  ['FormField', { tag: 'div', className: 'shadcn-form-field' }],
  ['FormItem', { tag: 'div', className: 'shadcn-form-item' }],
  ['FormLabel', { tag: 'label', className: 'shadcn-form-label' }],
  ['FormControl', { tag: 'div', className: 'shadcn-form-control' }],
  ['FormDescription', { tag: 'p', className: 'shadcn-form-description' }],
  ['FormMessage', { tag: 'p', className: 'shadcn-form-message' }],
  ['Table', { tag: 'table', className: 'shadcn-table' }],
  ['TableHeader', { tag: 'thead', className: 'shadcn-table-header' }],
  ['TableBody', { tag: 'tbody', className: 'shadcn-table-body' }],
  ['TableFooter', { tag: 'tfoot', className: 'shadcn-table-footer' }],
  ['TableHead', { tag: 'th', className: 'shadcn-table-head' }],
  ['TableRow', { tag: 'tr', className: 'shadcn-table-row' }],
  ['TableCell', { tag: 'td', className: 'shadcn-table-cell' }],
  ['TableCaption', { tag: 'caption', className: 'shadcn-table-caption' }],
  ['Badge', { tag: 'span', className: 'shadcn-badge' }],
  ['Avatar', { tag: 'div', className: 'shadcn-avatar' }],
  ['AvatarImage', { tag: 'img', className: 'shadcn-avatar-image' }],
  ['AvatarFallback', { tag: 'span', className: 'shadcn-avatar-fallback' }],
  ['Tabs', { tag: 'div', className: 'shadcn-tabs' }],
  ['TabsList', { tag: 'div', className: 'shadcn-tabs-list', role: 'tablist' }],
  ['TabsTrigger', { tag: 'button', className: 'shadcn-tabs-trigger', role: 'tab' }],
  ['TabsContent', { tag: 'div', className: 'shadcn-tabs-content', role: 'tabpanel' }],
]);

const htmlTagAliases = new Map([
  ['div', 'div'], ['span', 'span'], ['p', 'p'], ['a', 'a'], ['button', 'button'], ['input', 'input'],
  ['img', 'img'], ['form', 'form'], ['label', 'label'], ['section', 'section'], ['article', 'article'],
  ['header', 'header'], ['footer', 'footer'], ['main', 'main_'], ['nav', 'nav'], ['aside', 'aside'],
  ['ul', 'ul'], ['ol', 'ol'], ['li', 'li'], ['h1', 'h1'], ['h2', 'h2'], ['h3', 'h3'],
  ['h4', 'h4'], ['h5', 'h5'], ['h6', 'h6'], ['pre', 'pre'], ['code', 'code'], ['table', 'table'],
  ['thead', 'thead'], ['tbody', 'tbody'], ['tfoot', 'tfoot'], ['tr', 'tr'], ['th', 'th'], ['td', 'td'],
  ['caption', 'caption'], ['hr', 'hr'], ['br', 'br'], ['textarea', 'textarea'], ['select', 'select'], ['option', 'option'],
]);

const selfClosingTags = new Set(['input', 'img', 'br', 'hr']);
const ignoredWrapperComponents = new Set(['React.Fragment', 'Fragment']);

function elmModuleName(filePath) {
  const base = path.basename(filePath).replace(/\.(tsx|jsx|ts|js)$/, '');
  const clean = base.replace(/[^A-Za-z0-9_]/g, '') || 'Converted';
  return clean[0].toUpperCase() + clean.slice(1);
}

function extractComponentName(source, fallback) {
  const patterns = [
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/,
    /export\s+function\s+([A-Z][A-Za-z0-9_]*)/,
    /function\s+([A-Z][A-Za-z0-9_]*)/,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/,
    /const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[1];
  }
  return fallback;
}

function stripTypeScriptNoise(source) {
  return source
    .replace(/^\s*['"]use client['"];?\s*/m, '')
    .replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+/g, '');
}

function extractJsx(source) {
  const cleaned = stripTypeScriptNoise(source);
  const returnIndex = cleaned.search(/return\s*[\(\n\s]*[<]/m);
  if (returnIndex >= 0) {
    const start = cleaned.indexOf('<', returnIndex);
    return balancedJsx(cleaned, start);
  }

  const arrowIndex = cleaned.search(/=>\s*[\(\n\s]*[<]/m);
  if (arrowIndex >= 0) {
    const start = cleaned.indexOf('<', arrowIndex);
    return balancedJsx(cleaned, start);
  }

  const firstTag = cleaned.search(/<[A-Z][A-Za-z0-9.]*|<[a-z][a-z0-9-]*/m);
  return firstTag >= 0 ? balancedJsx(cleaned, firstTag) : '';
}

function balancedJsx(source, start) {
  let depth = 0;
  let seenTag = false;
  const tagRegex = /<\/?([A-Za-z][A-Za-z0-9.:-]*)(?:\s[^<>]*)?\/?\s*>/g;
  tagRegex.lastIndex = start;

  for (const match of source.matchAll(tagRegex)) {
    const raw = match[0];
    const name = match[1];
    const closing = raw.startsWith('</');
    const selfClosing = raw.endsWith('/>') || selfClosingTags.has(name);
    if (ignoredWrapperComponents.has(name) || raw === '<>' || raw === '</>') continue;
    seenTag = true;
    if (closing) depth -= 1;
    else if (!selfClosing) depth += 1;
    if (seenTag && depth === 0) return source.slice(start, match.index + raw.length);
  }

  return source.slice(start).trim();
}

function parseAttributes(attributeSource) {
  const attrs = [];
  const attrRegex = /([A-Za-z_:][-A-Za-z0-9_:]*)\s*=\s*("([^"]*)"|'([^']*)'|\{([^}]*)\})|([A-Za-z_:][-A-Za-z0-9_:]*)|\{\.\.\.([^}]*)\}/g;
  for (const match of attributeSource.matchAll(attrRegex)) {
    if (match[8]) {
      attrs.push({ name: 'spread', value: match[8].trim(), expression: true });
      continue;
    }
    const name = match[1] ?? match[6];
    if (!name) continue;
    const value = match[3] ?? match[4] ?? match[5] ?? 'true';
    attrs.push({ name, value: value.trim(), expression: match[5] !== undefined || match[6] !== undefined });
  }
  return attrs;
}

function parseTag(raw) {
  const match = raw.match(/^<\/?\s*([A-Za-z][A-Za-z0-9.:-]*)([\s\S]*?)\/?\s*>$/);
  if (!match) return null;
  return {
    name: match[1],
    attrs: parseAttributes(match[2] ?? ''),
    closing: raw.startsWith('</'),
    selfClosing: raw.endsWith('/>') || selfClosingTags.has(match[1]),
  };
}

function parseJsx(jsx) {
  const root = { type: 'element', name: 'Fragment', attrs: [], children: [] };
  const stack = [root];
  const tokenRegex = /<>|<\/>|<\/?[A-Za-z][A-Za-z0-9.:-]*(?:\s+(?:"[^"]*"|'[^']*'|\{[^{}]*\}|[^'"{}<>])*)?\/?\s*>|\{\/\*[\s\S]*?\*\/\}|\{[^{}]*\}|[^<{]+/g;

  for (const tokenMatch of jsx.matchAll(tokenRegex)) {
    const token = tokenMatch[0];
    if (!token || token.startsWith('{/*')) continue;
    if (token === '<>' || token === '</>') continue;

    if (token.startsWith('</')) {
      if (stack.length > 1) stack.pop();
      continue;
    }

    if (token.startsWith('<')) {
      const tag = parseTag(token);
      if (!tag) continue;
      const node = { type: 'element', name: tag.name, attrs: tag.attrs, children: [] };
      stack[stack.length - 1].children.push(node);
      if (!tag.selfClosing) stack.push(node);
      continue;
    }

    if (token.startsWith('{')) {
      const expression = token.slice(1, -1).trim();
      if (expression) stack[stack.length - 1].children.push({ type: 'text', value: `{${expression}}` });
      continue;
    }

    const compactText = token.replace(/\s+/g, ' ').trim();
    if (compactText) stack[stack.length - 1].children.push({ type: 'text', value: compactText });
  }

  return root.children.length === 1 ? root.children[0] : root;
}

function stringLiteral(value) {
  return JSON.stringify(value ?? '');
}

function extractClassExpression(value) {
  const literals = [];
  for (const match of value.matchAll(/['"]([^'"]+)['"]/g)) literals.push(match[1]);
  if (literals.length > 0) return literals.join(' ');
  return value.includes('className') ? '' : `{${value}}`;
}

function shadcnVariantClass(componentName, attrs) {
  const variant = attrs.find((attr) => attr.name === 'variant')?.value;
  const size = attrs.find((attr) => attr.name === 'size')?.value;
  const pieces = [];
  if (variant && !variant.includes('variant')) pieces.push(`shadcn-${componentName.toLowerCase()}-${variant.replace(/['"]/g, '')}`);
  if (size && !size.includes('size')) pieces.push(`shadcn-${componentName.toLowerCase()}-${size.replace(/['"]/g, '')}`);
  return pieces.join(' ');
}

function resolveTag(node) {
  if (ignoredWrapperComponents.has(node.name) || node.name === 'Fragment') {
    return { tag: 'div', className: 'converted-fragment' };
  }
  if (componentAliases.has(node.name)) return componentAliases.get(node.name);
  if (htmlTagAliases.has(node.name)) return { tag: htmlTagAliases.get(node.name), className: '' };
  return { tag: 'div', className: `converted-${node.name.replace(/[^A-Za-z0-9_-]/g, '-').toLowerCase()}` };
}

function elmAttribute(attr) {
  const name = attr.name === 'className' ? 'class' : attr.name === 'htmlFor' ? 'for' : attr.name;
  if (name === 'spread' || name === 'asChild' || name === 'render' || name === 'variant' || name === 'size') return null;
  if (name.startsWith('on')) return `Attr.attribute "data-react-${name.toLowerCase()}" ${stringLiteral('TODO: map event to Elm Msg')}`;
  if (name === 'class') return null;
  if (name === 'disabled') return 'Attr.disabled True';
  if (name === 'checked') return 'Attr.checked True';
  if (name === 'type') return `Attr.type_ ${stringLiteral(attr.value)}`;
  if (name === 'for') return `Attr.for ${stringLiteral(attr.value)}`;
  if (name === 'value') return `Attr.value ${stringLiteral(attr.expression ? `{${attr.value}}` : attr.value)}`;
  if (['id', 'placeholder', 'href', 'src', 'alt', 'title', 'target', 'rel', 'name'].includes(name)) return `Attr.${name} ${stringLiteral(attr.expression ? `{${attr.value}}` : attr.value)}`;
  if (name.startsWith('aria-') || name.startsWith('data-') || name === 'role') return `Attr.attribute ${stringLiteral(name)} ${stringLiteral(attr.expression ? `{${attr.value}}` : attr.value)}`;
  return `Attr.attribute ${stringLiteral(name)} ${stringLiteral(attr.expression ? `{${attr.value}}` : attr.value)}`;
}

function elmAttributes(node, alias) {
  const attrLines = [];
  const classAttrs = node.attrs.filter((attr) => attr.name === 'className' || attr.name === 'class');
  const classes = [alias.className, shadcnVariantClass(node.name, node.attrs)];
  for (const attr of classAttrs) classes.push(attr.expression ? extractClassExpression(attr.value) : attr.value);
  const className = classes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (className) attrLines.push(`Attr.class ${stringLiteral(className)}`);
  if (alias.role) attrLines.push(`Attr.attribute "role" ${stringLiteral(alias.role)}`);

  for (const attr of node.attrs) {
    const converted = elmAttribute(attr);
    if (converted) attrLines.push(converted);
  }

  return `[ ${attrLines.join(', ')} ]`;
}

function indent(text, depth) {
  return text
    .split('\n')
    .map((line) => `${'    '.repeat(depth)}${line}`)
    .join('\n');
}

function renderChildren(children, depth) {
  if (children.length === 0) return '[]';
  const rendered = children.map((child) => renderNode(child, depth + 1));
  return `[ ${rendered.map((child, index) => (index === 0 ? child : `, ${child}`)).join('\n')}\n${'    '.repeat(depth)}]`;
}

function renderNode(node, depth = 0) {
  if (node.type === 'text') return `Html.text ${stringLiteral(node.value)}`;
  const alias = resolveTag(node);
  const attrs = elmAttributes(node, alias);
  const children = renderChildren(node.children, depth + 1);
  return `Html.${alias.tag} ${attrs} ${children}`;
}

function unsupportedSketch(source) {
  const sketch = source.trim() || 'Text-only component: no JSX return was detected.';
  return `Html.div [ Attr.class "converted-react-component converted-react-component--unsupported" ]\n        [ Html.pre [] [ Html.text ${stringLiteral(sketch)} ] ]`;
}

export function convertReactComponent(source, options = {}) {
  const fallback = options.moduleName ?? 'Converted';
  const componentName = extractComponentName(source, fallback);
  const jsx = extractJsx(source);
  const tree = jsx ? parseJsx(jsx) : null;
  const body = tree ? renderNode(tree, 1) : unsupportedSketch(source);

  return `module ${componentName} exposing (view)\n\nimport Html exposing (Html)\nimport Html.Attributes as Attr\n\n{-| Generated by vite.elm's React TS/TSX-to-Elm converter.\n    shadcn/ui mappings covered in this converter: ${SHADCN_COMPONENTS.join(', ')}.\n    React event handlers are preserved as data-react-* TODO attributes so the generated Elm stays compilable.\n-}\nview : Html msg\nview =\n    ${indent(body, 1).trimStart()}\n`;
}

export function convertReactProject(inputDir, outputDir) {
  const converted = [];
  fs.mkdirSync(outputDir, { recursive: true });
  const stack = [inputDir];

  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'elm-stuff', 'dist'].includes(entry.name)) stack.push(fullPath);
        continue;
      }
      if (!/\.(tsx|jsx|ts|js)$/.test(entry.name)) continue;
      const source = fs.readFileSync(fullPath, 'utf8');
      if (!extractJsx(source)) continue;
      const moduleName = elmModuleName(fullPath);
      const elmSource = convertReactComponent(source, { moduleName });
      const outFile = path.join(outputDir, `${moduleName}.elm`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, elmSource);
      converted.push({ input: fullPath, output: outFile });
    }
  }

  return converted;
}
