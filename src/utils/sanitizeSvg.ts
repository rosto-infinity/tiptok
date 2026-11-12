const ALLOWED_SVG_TAGS = new Set([
  'svg',
  'g',
  'rect',
  'path',
  'circle',
  'polygon',
  'polyline',
  'line',
  'title',
  'desc',
])

const ALLOWED_SVG_ATTRS = new Set([
  'xmlns',
  'version',
  'width',
  'height',
  'viewbox',
  'x',
  'y',
  'cx',
  'cy',
  'r',
  'x1',
  'y1',
  'x2',
  'y2',
  'points',
  'd',
  'fill',
  'fill-rule',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'transform',
  'opacity',
])

const SVG_NS = 'http://www.w3.org/2000/svg'

function sanitizeNode(source: Element, doc: Document): Element | null {
  const tagName = source.localName.toLowerCase()
  if (!ALLOWED_SVG_TAGS.has(tagName)) {
    return null
  }

  const cleanElement = doc.createElementNS(SVG_NS, tagName)

  for (const attr of Array.from(source.attributes)) {
    const attrName = attr.name.toLowerCase()
    if (!ALLOWED_SVG_ATTRS.has(attrName)) {
      continue
    }

    if (/(?:url\s*\(|javascript:|data:)/i.test(attr.value)) {
      continue
    }

    cleanElement.setAttribute(attr.name, attr.value)
  }

  for (const child of Array.from(source.children)) {
    const cleanChild = sanitizeNode(child, doc)
    if (cleanChild) {
      cleanElement.appendChild(cleanChild)
    }
  }

  return cleanElement
}

export function sanitizeSvg(rawSvg: string): string {
  const trimmed = rawSvg.trim()
  if (!trimmed) {
    return ''
  }

  const parser = new DOMParser()
  const parsed = parser.parseFromString(trimmed, 'image/svg+xml')

  if (parsed.querySelector('parsererror')) {
    return ''
  }

  const root = parsed.documentElement
  if (!root || root.localName.toLowerCase() !== 'svg') {
    return ''
  }

  const outputDoc = document.implementation.createDocument(SVG_NS, 'svg', null)
  const sanitizedRoot = sanitizeNode(root, outputDoc)
  if (!sanitizedRoot) {
    return ''
  }

  return new XMLSerializer().serializeToString(sanitizedRoot)
}

