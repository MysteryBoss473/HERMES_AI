// lib/pdfUtils.ts
import { getDocument, GlobalWorkerOptions, TextItem, TextMarkedContent } from 'pdfjs-dist/build/pdf'

// Initialisation du worker PDF.js
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
}

interface PDFTextItem {
  str: string;
  dir?: string;
  transform?: number[];
  width?: number;
  height?: number;
  fontName?: string;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: buffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items
        .map((item: TextItem | TextMarkedContent) => 'str' in item ? item.str : '')
        .join(' ')
      fullText += text + '\n'
    }

    return fullText
  } catch (error) {
    console.error('Erreur lors de l\'extraction du texte:', error)
    throw new Error('Impossible d\'extraire le texte du PDF')
  }
}
