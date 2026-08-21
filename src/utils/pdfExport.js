/**
 * Ekspor laporan hasil penilaian WP (Weighted Product) ke PDF.
 * Dipakai oleh halaman Hasil WP (hasil belum tersimpan) dan Riwayat (hasil tersimpan per periode).
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateVStats, classifyPerformance, formatVPercent, PERFORMANCE_META } from './wp';
import { APP_NAME, APP_TAGLINE } from '../config/app';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const NAVY = [30, 64, 90];
const NAVY_LIGHT = [226, 232, 240];
const TEXT_MUTED = [100, 116, 139];
const TEXT_DARK = [15, 23, 42];
const GOLD_BG = [254, 249, 224];

const NOTE_COLORS = {
  kurang_baik: [185, 28, 28],
  baik: [29, 78, 216],
  sangat_baik: [180, 83, 9],
};

function formatNow() {
  return new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Pastikan cukup ruang tersisa di halaman; kalau tidak, pindah ke halaman baru. */
function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_HEIGHT - 18) {
    doc.addPage();
    return 24;
  }
  return y;
}

function drawHeader(doc, subtitle, periodLabel) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(APP_NAME, MARGIN, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(APP_TAGLINE, MARGIN, 19);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, 22.5, PAGE_WIDTH - MARGIN, 22.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(subtitle, MARGIN, 27.5);

  if (periodLabel) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(periodLabel, PAGE_WIDTH - MARGIN, 27.5, { align: 'right' });
  }

  doc.setTextColor(...TEXT_DARK);
}

function drawContinuationHeader(doc) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text(APP_NAME, MARGIN, 12);
  doc.setDrawColor(...NAVY_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, 15, PAGE_WIDTH - MARGIN, 15);
  doc.setTextColor(...TEXT_DARK);
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    if (i > 1) drawContinuationHeader(doc);

    doc.setDrawColor(...NAVY_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, PAGE_HEIGHT - 13, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 13);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Dicetak: ${formatNow()}`, MARGIN, PAGE_HEIGHT - 8);
    doc.text(`Halaman ${i} dari ${pageCount}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: 'right' });
  }
}

/** Judul section dengan aksen kotak warna di kiri, konsisten spacing-nya. */
function sectionTitle(doc, y, label, needed = 30) {
  y = ensureSpace(doc, y, needed);

  doc.setFillColor(...NAVY);
  doc.rect(MARGIN, y - 3.2, 2.2, 4.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(label.toUpperCase(), MARGIN + 5, y);

  return y + 5;
}

/** Tabel label:value tanpa header, border tipis, dipakai untuk kartu ringkasan. */
function infoTable(doc, startY, startX, width, rows) {
  autoTable(doc, {
    startY,
    body: rows,
    theme: 'grid',
    tableWidth: width,
    margin: { left: startX },
    styles: {
      fontSize: 8.8,
      cellPadding: 2.2,
      lineColor: NAVY_LIGHT,
      lineWidth: 0.15,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: TEXT_MUTED, cellWidth: width * 0.42 },
      1: { cellWidth: width * 0.58 },
    },
  });

  return doc.lastAutoTable.finalY;
}

function buildRankingRows(results) {
  const vStats = calculateVStats(results.map((r) => r.vValue));

  return results.map((r) => {
    const category = classifyPerformance(r.vValue, vStats);
    return {
      row: [
        r.rank,
        r.name ?? '—',
        r.employeeId ?? '—',
        Number(r.sValue ?? 0).toFixed(4),
        formatVPercent(r.vValue ?? 0),
        PERFORMANCE_META[category].label,
      ],
      category,
      isBest: r.rank === 1,
    };
  });
}

function addRankingTable(doc, startY, results) {
  const built = buildRankingRows(results);

  autoTable(doc, {
    startY,
    head: [['#', 'Nama', 'ID Karyawan', 'Total', 'Nilai (%)', 'Catatan']],
    body: built.map((b) => b.row),
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 2.6, textColor: TEXT_DARK, lineColor: NAVY_LIGHT },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 24, fontStyle: 'bold' },
      5: { cellWidth: 30 },
    },
    margin: { left: MARGIN, right: MARGIN },
    didParseCell: (data) => {
      const entry = built[data.row.index];
      if (!entry || data.section !== 'body') return;

      if (entry.isBest) {
        data.cell.styles.fillColor = GOLD_BG;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 5) {
        data.cell.styles.textColor = NOTE_COLORS[entry.category];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  return doc.lastAutoTable.finalY;
}

/**
 * Bangun dan unduh PDF laporan hasil WP.
 *
 * @param {object} params
 * @param {string} params.periodLabel - Label periode (contoh: "Juni 2026")
 * @param {string} params.period - Periode mentah (contoh: "2026-06")
 * @param {{ id: string, name: string, employeeId: string, sValue: number, vValue: number, rank: number, isBest?: boolean }[]} params.results
 * @param {{ name: string, type: 'benefit'|'cost' }[]} [params.criteria]
 * @param {number[]} [params.normalizedWeights]
 * @param {{ lambda_max: number, ci: number, cr: number, is_consistent: boolean }|null} [params.ahpMeta]
 * @param {string} [params.savedAt] - ISO timestamp, jika data berasal dari riwayat tersimpan
 * @param {'wp-result'|'history'} [params.source]
 */
export function exportWPResultPDF({
  periodLabel,
  period,
  results,
  criteria,
  normalizedWeights,
  ahpMeta,
  savedAt,
  source = 'wp-result',
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const subtitle =
    source === 'history' ? 'Laporan Riwayat Hasil Penilaian' : 'Laporan Hasil Penilaian (WP)';

  drawHeader(doc, subtitle, periodLabel);

  const bestSales = results.find((r) => r.rank === 1) ?? null;
  const summaryRows = [
    ['Periode', `${periodLabel} (${period})`],
    ['Metode', 'Weighted Product (WP)'],
    ['Jumlah sales dinilai', String(results.length)],
    ['Sales terbaik', bestSales ? `${bestSales.name} (${bestSales.employeeId})` : '—'],
    ['Nilai V terbaik', bestSales ? formatVPercent(bestSales.vValue) : '—'],
  ];
  if (savedAt) summaryRows.push(['Disimpan pada', formatDateTime(savedAt)]);

  let y = sectionTitle(doc, 40, 'Ringkasan');

  const halfWidth = (CONTENT_WIDTH - 6) / 2;
  const rightX = MARGIN + halfWidth + 6;

  if (ahpMeta) {
    const leftFinalY = infoTable(doc, y, MARGIN, halfWidth, summaryRows);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('KONSISTENSI AHP', rightX, y - 2);
    doc.setTextColor(...TEXT_DARK);

    const rightFinalY = infoTable(doc, y, rightX, halfWidth, [
      ['λ max', Number(ahpMeta.lambda_max).toFixed(4)],
      ['Consistency Index', Number(ahpMeta.ci).toFixed(4)],
      ['Consistency Ratio', Number(ahpMeta.cr).toFixed(4)],
      ['Status', ahpMeta.is_consistent ? 'Konsisten (CR ≤ 0.1)' : 'Tidak konsisten (CR > 0.1)'],
    ]);

    y = Math.max(leftFinalY, rightFinalY) + 8;
  } else {
    y = infoTable(doc, y, MARGIN, CONTENT_WIDTH, summaryRows) + 8;
  }

  if (criteria?.length && normalizedWeights?.length) {
    y = sectionTitle(doc, y, 'Bobot Kriteria');
    autoTable(doc, {
      startY: y,
      head: [['Kriteria', 'Tipe', 'Bobot']],
      body: criteria.map((c, i) => [
        c.name ?? `Kriteria ${i + 1}`,
        c.type === 'cost' ? 'Cost' : 'Benefit',
        Number(normalizedWeights[i]).toFixed(4),
      ]),
      theme: 'grid',
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 2.4, lineColor: NAVY_LIGHT, textColor: TEXT_DARK },
      columnStyles: { 2: { halign: 'right' } },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  y = sectionTitle(doc, y, 'Tabel Ranking Lengkap', 40);
  addRankingTable(doc, y, results);

  drawFooter(doc);

  const safeAppName = APP_NAME.replace(/\s+/g, '-');
  const fileName = `${safeAppName}-Laporan-${source === 'history' ? 'Riwayat' : 'Hasil'}-${period}.pdf`;
  doc.save(fileName);
}
