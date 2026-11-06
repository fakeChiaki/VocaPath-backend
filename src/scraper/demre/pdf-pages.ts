import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PdfItem {
  str: string;
  x: number;
  y: number;
}

export interface PdfPage {
  items: PdfItem[];
}

export async function readPdfPages(data: Uint8Array): Promise<PdfPage[]> {
  const doc = await getDocument({ data, verbosity: 0 }).promise;
  const pages: PdfPage[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const height = page.view[3];
    const { items } = await page.getTextContent();
    pages.push({
      items: (items as { str?: string; transform?: number[] }[])
        .filter((i) => i.str?.trim() && i.transform)
        .map((i) => ({ str: i.str!.trim(), x: i.transform![4], y: height - i.transform![5] })),
    });
  }
  return pages;
}
