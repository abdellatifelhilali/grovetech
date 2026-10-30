export function analyze(p) {
  const fields = ['price', 'cost', 'shipping', 'fees', 'adCost', 'monthlySales', 'reviews'];
  for (const key of fields) {
    if (p[key] === '' || p[key] == null || !Number.isFinite(Number(p[key])) || Number(p[key]) < 0) throw new Error(`${key} must be a nonnegative number`);
  }
  if (!p.name?.trim() || Number(p.price) <= 0) throw new Error('A product name and positive sale price are required');
  const n = Object.fromEntries(fields.map(k => [k, Number(p[k])]));
  const profit = n.price - n.cost - n.shipping - n.fees - n.adCost;
  const margin = profit / n.price * 100;
  const score = Math.round(Math.max(0, Math.min(100, Math.max(0, Math.min(1, margin / 40)) * 50 + Math.min(1, n.monthlySales / 1000) * 30 + (1 - Math.min(1, n.reviews / 2000)) * 20)));
  return {name:p.name.trim().slice(0,200), ...n, profit, margin, score, verdict: profit <= 0 ? 'Unprofitable' : score >= 70 ? 'Research further' : 'Needs validation'};
}
