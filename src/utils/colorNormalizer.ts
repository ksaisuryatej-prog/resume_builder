/**
 * ResumeCraft CSS Color Normalizer & Pre-Flight Validator
 *
 * Converts modern CSS Color Module Level 4/5 colors (oklch, oklab, lab, lch, color-mix, color())
 * into standard sRGB / RGBA colors compatible with canvas rasterization and PDF generation.
 */

export interface ColorValidationError {
  tagName: string;
  className: string;
  id: string;
  property: string;
  value: string;
}

export interface ValidationReport {
  valid: boolean;
  inspectedElementsCount: number;
  errors: ColorValidationError[];
}

// Math-based OKLCH to sRGB converter
export function oklchToRgb(l: number, c: number, h: number, alpha: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  return oklabToRgb(l, a, b, alpha);
}

// Math-based OKLab to sRGB converter
export function oklabToRgb(l: number, a: number, b: number, alpha: number = 1): string {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  const rLin = +4.0767434778 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const gLin = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const bLin = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.7076147010 * sCube;

  const toSrgb = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rLin) * 255);
  const g = Math.round(toSrgb(gLin) * 255);
  const bVal = Math.round(toSrgb(bLin) * 255);

  const safeR = Math.max(0, Math.min(255, isNaN(r) ? 0 : r));
  const safeG = Math.max(0, Math.min(255, isNaN(g) ? 0 : g));
  const safeB = Math.max(0, Math.min(255, isNaN(bVal) ? 0 : bVal));
  const safeAlpha = Math.max(0, Math.min(1, isNaN(alpha) ? 1 : alpha));

  if (safeAlpha < 1) {
    return `rgba(${safeR}, ${safeG}, ${safeB}, ${Number(safeAlpha.toFixed(3))})`;
  }
  return `rgb(${safeR}, ${safeG}, ${safeB})`;
}

// Math-based CIELAB to sRGB converter
export function labToRgb(l: number, a: number, b: number, alpha: number = 1): string {
  // D65 standard illuminant
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const xr = Math.pow(fx, 3) > epsilon ? Math.pow(fx, 3) : (116 * fx - 16) / kappa;
  const yr = l > kappa * epsilon ? Math.pow((l + 16) / 116, 3) : l / kappa;
  const zr = Math.pow(fz, 3) > epsilon ? Math.pow(fz, 3) : (116 * fz - 16) / kappa;

  const X = xr * 0.95047;
  const Y = yr * 1.0;
  const Z = zr * 1.08883;

  const rLin = +3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  const gLin = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
  const bLin = +0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;

  const toSrgb = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rLin) * 255);
  const g = Math.round(toSrgb(gLin) * 255);
  const bVal = Math.round(toSrgb(bLin) * 255);

  const safeR = Math.max(0, Math.min(255, isNaN(r) ? 0 : r));
  const safeG = Math.max(0, Math.min(255, isNaN(g) ? 0 : g));
  const safeB = Math.max(0, Math.min(255, isNaN(bVal) ? 0 : bVal));
  const safeAlpha = Math.max(0, Math.min(1, isNaN(alpha) ? 1 : alpha));

  if (safeAlpha < 1) {
    return `rgba(${safeR}, ${safeG}, ${safeB}, ${Number(safeAlpha.toFixed(3))})`;
  }
  return `rgb(${safeR}, ${safeG}, ${safeB})`;
}

// Convert via browser Canvas 2D context (fastest for color-mix, color(), etc.)
export function resolveColorViaCanvas(colorStr: string, win?: Window): string | null {
  try {
    const targetWin = win || (typeof window !== 'undefined' ? window : null);
    if (!targetWin || !targetWin.document) return null;

    const canvas = targetWin.document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#000000';
    ctx.fillStyle = colorStr;
    const resolved = ctx.fillStyle;

    if (
      resolved &&
      !resolved.includes('oklch') &&
      !resolved.includes('oklab') &&
      !resolved.includes('lab') &&
      !resolved.includes('color(')
    ) {
      return resolved;
    }
  } catch (_) {}
  return null;
}

/**
 * Converts any modern color function string into an export-safe rgb()/rgba() string.
 */
export function convertColorToRgb(colorStr: string, win?: Window): string {
  if (!colorStr) return colorStr;
  const trimmed = colorStr.trim();

  // Already safe formats
  if (
    trimmed.startsWith('rgb(') ||
    trimmed.startsWith('rgba(') ||
    trimmed.startsWith('#') ||
    trimmed === 'transparent' ||
    trimmed === 'inherit' ||
    trimmed === 'currentColor' ||
    trimmed === 'none'
  ) {
    return trimmed;
  }

  // 1. Try Canvas 2D resolution first
  const canvasRes = resolveColorViaCanvas(trimmed, win);
  if (canvasRes) return canvasRes;

  // 2. Mathematical OKLCH parser: oklch(L C H [/ alpha])
  const oklchMatch = trimmed.match(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+(?:deg|rad|turn)?)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
  );
  if (oklchMatch) {
    let l = parseFloat(oklchMatch[1]);
    if (oklchMatch[1].endsWith('%')) l = l / 100;
    const c = parseFloat(oklchMatch[2]);
    let h = parseFloat(oklchMatch[3]);
    if (oklchMatch[3].endsWith('turn')) h = parseFloat(oklchMatch[3]) * 360;
    else if (oklchMatch[3].endsWith('rad')) h = (parseFloat(oklchMatch[3]) * 180) / Math.PI;

    let alpha = 1;
    if (oklchMatch[4]) {
      alpha = parseFloat(oklchMatch[4]);
      if (oklchMatch[4].endsWith('%')) alpha = alpha / 100;
    }
    return oklchToRgb(l, c, h, alpha);
  }

  // 3. Mathematical OKLab parser: oklab(L a b [/ alpha])
  const oklabMatch = trimmed.match(
    /oklab\(\s*([\d.]+%?)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
  );
  if (oklabMatch) {
    let l = parseFloat(oklabMatch[1]);
    if (oklabMatch[1].endsWith('%')) l = l / 100;
    const a = parseFloat(oklabMatch[2]);
    const b = parseFloat(oklabMatch[3]);

    let alpha = 1;
    if (oklabMatch[4]) {
      alpha = parseFloat(oklabMatch[4]);
      if (oklabMatch[4].endsWith('%')) alpha = alpha / 100;
    }
    return oklabToRgb(l, a, b, alpha);
  }

  // 4. Mathematical CIELAB parser: lab(L a b [/ alpha])
  const labMatch = trimmed.match(
    /lab\(\s*([\d.]+%?)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i
  );
  if (labMatch) {
    let l = parseFloat(labMatch[1]);
    if (labMatch[1].endsWith('%')) l = l / 100;
    const a = parseFloat(labMatch[2]);
    const b = parseFloat(labMatch[3]);

    let alpha = 1;
    if (labMatch[4]) {
      alpha = parseFloat(labMatch[4]);
      if (labMatch[4].endsWith('%')) alpha = alpha / 100;
    }
    return labToRgb(l, a, b, alpha);
  }

  // Fallback for named CSS colors or complex expressions
  return trimmed;
}

/**
 * Replaces any unsupported color function occurrences inside CSS strings
 * such as gradients, box-shadows, borders, etc.
 */
export function sanitizeCssValue(value: string, win?: Window): string {
  if (!value) return value;

  // Replace oklch(...)
  let sanitized = value.replace(
    /oklch\([^)]+\)/gi,
    (match) => convertColorToRgb(match, win)
  );

  // Replace oklab(...)
  sanitized = sanitized.replace(
    /oklab\([^)]+\)/gi,
    (match) => convertColorToRgb(match, win)
  );

  // Replace lab(...)
  sanitized = sanitized.replace(
    /lab\([^)]+\)/gi,
    (match) => convertColorToRgb(match, win)
  );

  // Replace lch(...)
  sanitized = sanitized.replace(
    /lch\([^)]+\)/gi,
    (match) => convertColorToRgb(match, win)
  );

  // Replace color(...) e.g. color(display-p3 ...)
  sanitized = sanitized.replace(
    /color\([^)]+\)/gi,
    (match) => convertColorToRgb(match, win)
  );

  // Remove unsupported gradient color interpolation tags like "in oklab" or "in oklch"
  sanitized = sanitized.replace(/\s+in\s+oklab/gi, '');
  sanitized = sanitized.replace(/\s+in\s+oklch/gi, '');
  sanitized = sanitized.replace(/\s+in\s+srgb/gi, '');

  return sanitized;
}

/**
 * Sanitizes all <style> elements inside a document (e.g. cloned document).
 * Replaces any instances of oklch(), oklab(), etc., in raw CSS text with sRGB equivalents.
 */
export function sanitizeDocumentStylesheets(doc: Document, win?: Window): void {
  try {
    const styleTags = doc.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && /oklch|oklab|lab\(|lch\(/i.test(styleTag.textContent)) {
        styleTag.textContent = sanitizeCssValue(styleTag.textContent, win);
      }
    });
  } catch (err) {
    console.warn('Stylesheet sanitization warning:', err);
  }
}

/**
 * Recursively normalizes all colors in a DOM subtree to standard sRGB / RGBA.
 * Overrides computed styles with inline !important styles on the elements,
 * ensuring canvas rasterizers receive 100% compliant CSS color strings.
 */
export function normalizeDomColors(rootElement: HTMLElement, win: Window = window): void {
  const elements = [rootElement, ...Array.from(rootElement.querySelectorAll('*'))] as HTMLElement[];

  for (const el of elements) {
    if (!el || !el.style) continue;

    let computed: CSSStyleDeclaration;
    try {
      computed = win.getComputedStyle(el);
    } catch (_) {
      continue;
    }

    // 1. Text Color
    if (computed.color) {
      const safeColor = sanitizeCssValue(computed.color, win);
      if (safeColor !== computed.color) {
        el.style.setProperty('color', safeColor, 'important');
      }
    }

    // 2. Background Color
    if (
      computed.backgroundColor &&
      computed.backgroundColor !== 'transparent' &&
      computed.backgroundColor !== 'rgba(0, 0, 0, 0)'
    ) {
      const safeBg = sanitizeCssValue(computed.backgroundColor, win);
      if (safeBg !== computed.backgroundColor) {
        el.style.setProperty('background-color', safeBg, 'important');
      }
    }

    // 3. Border Colors
    const borderTop = computed.borderTopColor;
    const borderRight = computed.borderRightColor;
    const borderBottom = computed.borderBottomColor;
    const borderLeft = computed.borderLeftColor;

    if (borderTop && borderTop !== 'transparent') {
      const safe = sanitizeCssValue(borderTop, win);
      if (safe !== borderTop) el.style.setProperty('border-top-color', safe, 'important');
    }
    if (borderRight && borderRight !== 'transparent') {
      const safe = sanitizeCssValue(borderRight, win);
      if (safe !== borderRight) el.style.setProperty('border-right-color', safe, 'important');
    }
    if (borderBottom && borderBottom !== 'transparent') {
      const safe = sanitizeCssValue(borderBottom, win);
      if (safe !== borderBottom) el.style.setProperty('border-bottom-color', safe, 'important');
    }
    if (borderLeft && borderLeft !== 'transparent') {
      const safe = sanitizeCssValue(borderLeft, win);
      if (safe !== borderLeft) el.style.setProperty('border-left-color', safe, 'important');
    }

    // 4. Outline Color
    if (computed.outlineColor && computed.outlineColor !== 'transparent') {
      const safe = sanitizeCssValue(computed.outlineColor, win);
      if (safe !== computed.outlineColor) {
        el.style.setProperty('outline-color', safe, 'important');
      }
    }

    // 5. Box Shadow
    if (computed.boxShadow && computed.boxShadow !== 'none') {
      const safe = sanitizeCssValue(computed.boxShadow, win);
      if (safe !== computed.boxShadow) {
        el.style.setProperty('box-shadow', safe, 'important');
      }
    }

    // 6. Text Shadow
    if (computed.textShadow && computed.textShadow !== 'none') {
      const safe = sanitizeCssValue(computed.textShadow, win);
      if (safe !== computed.textShadow) {
        el.style.setProperty('text-shadow', safe, 'important');
      }
    }

    // 7. Background Image (Gradients)
    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
      const safe = sanitizeCssValue(computed.backgroundImage, win);
      if (safe !== computed.backgroundImage) {
        el.style.setProperty('background-image', safe, 'important');
      }
    }

    // 8. Text Decoration Color
    if (computed.textDecorationColor && computed.textDecorationColor !== 'transparent') {
      const safe = sanitizeCssValue(computed.textDecorationColor, win);
      if (safe !== computed.textDecorationColor) {
        el.style.setProperty('text-decoration-color', safe, 'important');
      }
    }

    // 9. SVG Elements (Lucide React Icons, paths, shapes)
    const tagName = el.tagName.toLowerCase();
    if (
      tagName === 'svg' ||
      tagName === 'path' ||
      tagName === 'circle' ||
      tagName === 'rect' ||
      tagName === 'line' ||
      tagName === 'polyline' ||
      tagName === 'polygon'
    ) {
      // Stroke
      const strokeVal = computed.stroke || el.getAttribute('stroke');
      if (strokeVal && strokeVal !== 'none') {
        const resolvedStroke =
          strokeVal === 'currentColor'
            ? sanitizeCssValue(computed.color, win)
            : sanitizeCssValue(strokeVal, win);
        el.style.setProperty('stroke', resolvedStroke, 'important');
        el.setAttribute('stroke', resolvedStroke);
      }

      // Fill
      const fillVal = computed.fill || el.getAttribute('fill');
      if (fillVal && fillVal !== 'none') {
        const resolvedFill =
          fillVal === 'currentColor'
            ? sanitizeCssValue(computed.color, win)
            : sanitizeCssValue(fillVal, win);
        el.style.setProperty('fill', resolvedFill, 'important');
        el.setAttribute('fill', resolvedFill);
      }
    }
  }
}

/**
 * Pre-Flight Color Validation Check
 * Walks the entire DOM export tree. Verifies that NO unsupported modern color format remains.
 * If unsupported colors are detected on any element or property, reports them precisely
 * and auto-sanitizes them as a defensive self-healing measure.
 */
export function validateExportDomColors(
  rootElement: HTMLElement,
  win: Window = window
): ValidationReport {
  const errors: ColorValidationError[] = [];
  const elements = [rootElement, ...Array.from(rootElement.querySelectorAll('*'))] as HTMLElement[];
  const unsupportedRegex = /\b(oklch|oklab|lab|lch|color-mix)\s*\(/i;

  const propertiesToCheck = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'boxShadow',
    'textShadow',
    'backgroundImage',
    'textDecorationColor',
    'fill',
    'stroke'
  ];

  for (const el of elements) {
    if (!el || !el.style) continue;

    // Check inline style attribute
    const inlineStyle = el.getAttribute('style') || '';
    if (unsupportedRegex.test(inlineStyle)) {
      errors.push({
        tagName: el.tagName.toLowerCase(),
        className: el.className ? String(el.className) : '',
        id: el.id || '',
        property: 'inline style attribute',
        value: inlineStyle
      });
      // Self-heal inline style
      el.setAttribute('style', sanitizeCssValue(inlineStyle, win));
    }

    // Check computed styles
    try {
      const computed = win.getComputedStyle(el);
      for (const prop of propertiesToCheck) {
        const val = (computed as any)[prop];
        if (typeof val === 'string' && unsupportedRegex.test(val)) {
          errors.push({
            tagName: el.tagName.toLowerCase(),
            className: el.className ? String(el.className) : '',
            id: el.id || '',
            property: prop,
            value: val
          });
          // Self-heal computed style property
          const safeVal = sanitizeCssValue(val, win);
          const cssPropName = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          el.style.setProperty(cssPropName, safeVal, 'important');
        }
      }
    } catch (_) {}
  }

  if (errors.length > 0) {
    console.warn(
      `[Pre-Flight Color Validator] Detected and auto-healed ${errors.length} modern color instances:`,
      errors
    );
  }

  return {
    valid: errors.length === 0,
    inspectedElementsCount: elements.length,
    errors
  };
}
