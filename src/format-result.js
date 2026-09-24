export function formatResultText(data, labels = {}, depth = 0) {
  const indent = '  '.repeat(depth);
  if (data === null || data === undefined) return indent + 'Não informado';
  if (typeof data === 'boolean') return indent + (data ? 'Sim' : 'Não');
  if (typeof data !== 'object') return String(data).split(/\r?\n/).map(line => indent + line).join('\n');
  const entries = Object.entries(data);
  if (!entries.length) return indent + 'Nenhum registro';
  return entries.map(([key, value]) => {
    const label = Array.isArray(data) ? `Registro ${Number(key) + 1}` : labels[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
    if (value !== null && typeof value === 'object') return `${indent}${label}\n${formatResultText(value, labels, depth + 1)}`;
    const text = formatResultText(value, labels, 0);
    return `${indent}${label}: ${text.replace(/\n/g, '\n' + indent + '  ')}`;
  }).join('\n');
}
