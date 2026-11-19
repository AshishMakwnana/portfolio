import { Buffer } from 'node:buffer';
import type { PortfolioPayload } from '../types/portfolio';
import { formatResumePlainText } from './portfolioLogic';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 46;
const RIGHT = PAGE_WIDTH - 46;

function toPdfText(value: string): string {
  return value
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2022/g, '-')
    .replace(/\u00b7/g, '|')
    .replace(/\u2192/g, '->')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, '')
    .replace(/([\\()])/g, '\\$1');
}

function wrapLine(value: string, maxLength: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    if (word.length > maxLength) {
      if (line) lines.push(line);
      for (let start = 0; start < word.length; start += maxLength) {
        const part = word.slice(start, start + maxLength);
        if (part.length === maxLength) lines.push(part);
        else line = part;
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function makePageContent(
  lines: string[],
  pageNumber: number,
  pageCount: number,
  firstPage: boolean,
) {
  const commands: string[] = [];
  let y = PAGE_HEIGHT - 52;

  const drawText = (
    value: string,
    x: number,
    size: number,
    font: 'F1' | 'F2',
    color = '0.12 0.17 0.24',
  ) => {
    commands.push(
      `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y.toFixed(2)} Tm (${toPdfText(value)}) Tj ET`,
    );
  };

  const moveDown = (space: number) => {
    y -= space;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const original = lines[index];
    const line = original.trim();

    if (!line || /^-{3,}$/.test(line)) {
      y -= 6;
      continue;
    }

    if (firstPage && index === 0) {
      moveDown(34);
      drawText(line, LEFT, 23, 'F2', '0.04 0.43 0.68');
      y -= 10;
      commands.push(`0.04 0.43 0.68 RG 1.4 w ${LEFT} ${y} m ${RIGHT} ${y} l S`);
      y -= 17;
      continue;
    }

    if (/^[A-Z][A-Z &]+$/.test(line)) {
      moveDown(16);
      drawText(line, LEFT, 10, 'F2', '0.04 0.43 0.68');
      y -= 4;
      commands.push(`0.83 0.87 0.91 RG 0.6 w ${LEFT} ${y} m ${RIGHT} ${y} l S`);
      y -= 9;
      continue;
    }

    const bullet = original.startsWith('  - ');
    const text = bullet ? `- ${line.slice(2)}` : line;
    const indent = bullet ? 13 : 0;
    const maxLength = bullet ? 91 : 105;
    const wrapped = wrapLine(text, maxLength);

    for (const wrappedLine of wrapped) {
      drawText(wrappedLine, LEFT + indent, 9.2, 'F1');
      y -= 11;
    }
  }

  commands.push(`0.83 0.87 0.91 RG 0.6 w ${LEFT} 46 m ${RIGHT} 46 l S`);
  commands.push(
    `BT /F1 8 Tf 0.38 0.43 0.50 rg 1 0 0 1 ${LEFT} 32 Tm (${toPdfText('Ashish Makwana | Resume')}) Tj ET`,
  );
  commands.push(
    `BT /F1 8 Tf 0.38 0.43 0.50 rg 1 0 0 1 ${RIGHT - 38} 32 Tm (${pageNumber} / ${pageCount}) Tj ET`,
  );

  return commands.join('\n');
}

export function generateResumePdf(portfolio: PortfolioPayload): Buffer {
  const lines = formatResumePlainText(portfolio).split('\n');
  const pages: string[][] = [[]];
  let usedHeight = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (trimmed === 'SELECTED PROJECTS' && pages[pages.length - 1].length > 0) {
      pages.push([]);
      usedHeight = 0;
    }
    const bullet = line.startsWith('  - ');
    const maxLength = bullet ? 91 : 105;
    const isSection = /^[A-Z][A-Z &]+$/.test(trimmed);
    const lineHeight =
      index === 0 ? 61 :
      !trimmed || /^-{3,}$/.test(trimmed) ? 6 :
      isSection ? 29 :
      wrapLine(bullet ? `- ${trimmed.slice(2)}` : trimmed, maxLength).length * 11;

    if (usedHeight + lineHeight > 728 && pages[pages.length - 1].length > 0) {
      pages.push([]);
      usedHeight = 0;
    }
    pages[pages.length - 1].push(line);
    usedHeight += lineHeight;
  }

  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  const pageIds: number[] = [];
  pages.forEach((page, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const content = makePageContent(page, index + 1, pages.length, index === 0);
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${Buffer.byteLength(content, 'latin1') + 1} >>\nstream\n${content}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let document = '%PDF-1.4\n%Resume PDF\n';
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = Buffer.byteLength(document, 'latin1');
    document += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(document, 'latin1');
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    document += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(document, 'latin1');
}
