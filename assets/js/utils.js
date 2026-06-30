export function createId(prefix) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

export function getIsoNow() {
  return new Date().toISOString();
}

export function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function includesText(value, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return true;
  return normalizeText(value).includes(normalizedKeyword);
}

export function formatDate(value) {
  if (!value) return "-";
  return value;
}

export function formatDateTime(value) {
  if (!value) return "-";
  return value.replace("T", " ");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
