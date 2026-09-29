export function normalizePhone(phone) {
  let cleaned = String(phone).replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  if (!cleaned.startsWith('91')) cleaned = '91' + cleaned;
  return cleaned;
}
