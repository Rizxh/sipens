/**
 * Ekspor laporan hasil penilaian WP (Weighted Product) ke PDF.
 * Dipakai oleh halaman Hasil WP (hasil belum tersimpan) dan Riwayat (hasil tersimpan per periode).
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calculateVStats, classifyPerformance, formatVPercent, PERFORMANCE_META } from './wp';

function formatNow() {
  return new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function drawHeader(doc, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 90);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SIPENS', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Sistem Pendukung Keputusan Penilaian Sales Terbaik', 14, 19);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(subtitle, 14, 25);

  doc.setTextColor(20, 20, 20);
}

function drawFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Dicetak: ${formatNow()}`, 14, pageHeight - 8);
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }
}

function buildRankingRows(results) {
  const vStats = calculateVStats(results.map((r) => r.vValue));

  return results.map((r) => {
    const category = classifyPerformance(r.vValue, vStats);
    const note = PERFORMANCE_META[category].label;

    return [
      r.rank,
      r.name ?? '—',
      r.employeeId ?? '—',
      Number(r.sValue ?? 0).toFixed(6),
      formatVPercent(r.vValue ?? 0),
      note,
    ];
  });
}

function addSummarySection(doc, startY, rows) {
  autoTable(doc, {
    startY,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    body: rows,
    margin: { left: 14, right: 14 },
  });

  return doc.lastAutoTable.finalY;
}

function addRankingTable(doc, startY, results) {
  autoTable(doc, {
    startY,
    head: [['Rank', 'Nama', 'ID Karyawan', 'Nilai S', 'Nilai V', 'Catatan']],
    body: buildRankingRows(results),
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 90], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === 0) {
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
 * @param {number} [params.totalS]
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
  totalS,
  criteria,
  normalizedWeights,
  ahpMeta,
  savedAt,
  source = 'wp-result',
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const subtitle =
    source === 'history'
      ? `Laporan Riwayat Hasil Penilaian — ${periodLabel}`
      : `Laporan Hasil Penilaian (WP) — ${periodLabel}`;

  drawHeader(doc, subtitle);

  const bestSales = results.find((r) => r.rank === 1) ?? null;
  const summaryRows = [
    ['Periode', `${periodLabel} (${period})`],
    ['Metode', 'Weighted Product (WP), bobot dari AHP'],
    ['Jumlah sales dinilai', String(results.length)],
    ['Sales terbaik', bestSales ? `${bestSales.name} (${bestSales.employeeId})` : '—'],
    ['Nilai V sales terbaik', bestSales ? formatVPercent(bestSales.vValue) : '—'],
  ];
  if (totalS !== undefined) summaryRows.push(['Total ΣS', Number(totalS).toFixed(6)]);
  if (savedAt) {
    summaryRows.push([
      'Disimpan pada',
      new Date(savedAt).toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    ]);
  }

  let y = 34;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan', 14, y);
  y = addSummarySection(doc, y + 3, summaryRows) + 4;

  if (ahpMeta) {
    doc.setFont('helvetica', 'bold');
    doc.text('Metadata Konsistensi AHP', 14, y);
    y = addSummarySection(doc, y + 3, [
      ['λ max', Number(ahpMeta.lambda_max).toFixed(4)],
      ['Consistency Index (CI)', Number(ahpMeta.ci).toFixed(4)],
      ['Consistency Ratio (CR)', Number(ahpMeta.cr).toFixed(4)],
      ['Status', ahpMeta.is_consistent ? 'Konsisten (CR ≤ 0.1)' : 'Tidak konsisten (CR > 0.1)'],
    ]) + 4;
  }

  if (criteria?.length && normalizedWeights?.length) {
    doc.setFont('helvetica', 'bold');
    doc.text('Bobot Kriteria', 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [['Kriteria', 'Tipe', 'Bobot']],
      body: criteria.map((c, i) => [
        c.name ?? `Kriteria ${i + 1}`,
        c.type === 'cost' ? 'Cost' : 'Benefit',
        `${(normalizedWeights[i] * 100).toFixed(2)}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Tabel Ranking Lengkap', 14, y);
  addRankingTable(doc, y + 3, results);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Catatan performa dihitung otomatis: "Kurang Baik" jika V di bawah rata-rata, "Baik" jika V ≥ rata-rata, ' +
    '"Sangat Baik" jika V ≥ rata-rata + standar deviasi seluruh peserta pada periode ini.',
    14,
    doc.lastAutoTable.finalY + 6,
    { maxWidth: 182 }
  );

  drawFooter(doc);

  const fileName = `SIPENS-Laporan-${source === 'history' ? 'Riwayat' : 'Hasil'}-${period}.pdf`;
  doc.save(fileName);
}
