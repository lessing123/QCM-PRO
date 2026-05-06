const PDF_WIDTH = 595
const PDF_HEIGHT = 842
const LEFT_MARGIN = 40
const TOP_MARGIN = 56
const FONT_SIZE = 11
const LINE_HEIGHT = 15

function escapePdfText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function truncate(text: string, max = 110) {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

function toPages(lines: string[]) {
  const usableHeight = PDF_HEIGHT - TOP_MARGIN * 2
  const linesPerPage = Math.max(1, Math.floor(usableHeight / LINE_HEIGHT))
  const pages: string[][] = []

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage))
  }

  return pages.length > 0 ? pages : [['']]
}

export function buildTextPdf(title: string, lines: string[]) {
  const pages = toPages([title, '', ...lines])
  const objects: string[] = ['']
  const pageIds: number[] = []
  const contentIds: number[] = []

  const addObject = (body: string) => {
    objects.push(body)
    return objects.length - 1
  }

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')

  for (const pageLines of pages) {
    const contentLines = pageLines.map((line, index) => {
      const safe = escapePdfText(truncate(line))
      return index === 0
        ? `(${safe}) Tj`
        : `T* (${safe}) Tj`
    }).join('\n')

    const content = `BT\n/F1 ${FONT_SIZE} Tf\n1 0 0 1 ${LEFT_MARGIN} ${PDF_HEIGHT - TOP_MARGIN} Tm\n${contentLines}\nET`
    const contentId = addObject(`<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`)
    contentIds.push(contentId)

    const pageId = addObject(`<< /Type /Page /Parent __PAGES_ID__ 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageIds.push(pageId)
  }

  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
  objects[pagesId] = objects[pagesId].replace(/__PAGES_ID__/g, String(pagesId))
  for (const pageId of pageIds) {
    objects[pageId] = objects[pageId].replace(/__PAGES_ID__/g, String(pagesId))
  }

  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)

  let pdf = '%PDF-1.4\n'
  const offsets = new Array(objects.length).fill(0)

  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'latin1')
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
  }

  const xrefStart = Buffer.byteLength(pdf, 'latin1')
  pdf += `xref\n0 ${objects.length}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i < objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return Buffer.from(pdf, 'latin1')
}
