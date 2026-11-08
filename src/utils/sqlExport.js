import { supabase } from '../lib/supabase';

const PAGE_SIZE = 1000;

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

/** Ambil semua baris tabel (Supabase membatasi 1000 baris per request) */
async function fetchAll(table, columns, order) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order(order, { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
}

/**
 * Bangun script SQL berisi data sales + nilai per periode.
 * Nilai di-join lewat employee_id & nama kriteria agar bisa diimpor ke database lain.
 */
export async function buildSalesSql() {
  const [sales, criteria, scores] = await Promise.all([
    fetchAll('sales', 'id, name, employee_id, is_active', 'created_at'),
    fetchAll('criteria', 'id, name', 'created_at'),
    fetchAll('sales_scores', 'id, sales_id, criteria_id, period, value', 'period'),
  ]);

  const salesById = Object.fromEntries(sales.map((s) => [s.id, s]));
  const criteriaById = Object.fromEntries(criteria.map((c) => [c.id, c]));
  const periods = [...new Set(scores.map((s) => s.period))].sort();

  let sql = `-- =============================================================================
-- SIPENS — Export Data Sales
-- Dibuat: ${new Date().toLocaleString('id-ID')}
-- Total: ${sales.length} sales, ${scores.length} nilai (${periods.length} periode)
-- Jalankan SETELAH schema.sql (kriteria harus sudah ada dengan nama yang sama)
-- =============================================================================

`;

  if (sales.length > 0) {
    sql += `INSERT INTO public.sales (name, employee_id, is_active) VALUES\n`;
    sql += sales
      .map((s) => `  ('${escapeSql(s.name)}', '${escapeSql(s.employee_id)}', ${s.is_active ? 'TRUE' : 'FALSE'})`)
      .join(',\n');
    sql += `\nON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;\n\n`;
  }

  for (const period of periods) {
    const rows = scores
      .filter((s) => s.period === period && salesById[s.sales_id] && criteriaById[s.criteria_id])
      .map((s) => `  ('${escapeSql(salesById[s.sales_id].employee_id)}', '${escapeSql(criteriaById[s.criteria_id].name)}', ${Number(s.value)})`);
    if (rows.length === 0) continue;

    sql += `-- --- Nilai sales ${period} (${rows.length} baris) ---\n`;
    sql += `INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)\n`;
    sql += `SELECT s.id, c.id, '${period}', v.score\nFROM (VALUES\n`;
    sql += rows.join(',\n');
    sql += `
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name
ON CONFLICT (sales_id, criteria_id, period) DO UPDATE SET value = EXCLUDED.value;

`;
  }

  return { sql, salesCount: sales.length, scoreCount: scores.length };
}

export async function downloadSalesSql() {
  const result = await buildSalesSql();
  const blob = new Blob([result.sql], { type: 'application/sql;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sipens-data-sales-${new Date().toISOString().slice(0, 10)}.sql`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return result;
}
