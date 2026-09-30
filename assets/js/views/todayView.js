import { escapeHtml, formatDate, formatDateTime } from "../utils.js";

const EXCLUDED_STATUSES = ["契約", "見送り"];
const REASONS = [
  { key: "appointment", label: "アポ" },
  { key: "overdue", label: "期限超過" },
  { key: "today", label: "今日連絡" }
];

export function getLocalDateString(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getTodayTargets(stores, ownerName = "", today = getLocalDateString()) {
  const items = [];

  stores.forEach((store) => {
    if (EXCLUDED_STATUSES.includes(store.status)) return;
    if (ownerName && store.ownerName !== ownerName) return;

    const reasons = [];
    if (store.appointmentAt && store.appointmentAt.slice(0, 10) === today) reasons.push("appointment");
    if (store.nextContactDate && store.nextContactDate < today) reasons.push("overdue");
    if (store.nextContactDate === today) reasons.push("today");

    if (reasons.length > 0) items.push({ store, reasons });
  });

  items.sort((a, b) => {
    const rankA = REASONS.findIndex((reason) => reason.key === a.reasons[0]);
    const rankB = REASONS.findIndex((reason) => reason.key === b.reasons[0]);
    if (rankA !== rankB) return rankA - rankB;

    // アポは時刻が早い順、期限超過は次回連絡日が古い（超過日数が多い）順
    const sortKey = (item) => (item.reasons[0] === "appointment" ? item.store.appointmentAt : item.store.nextContactDate) || "";
    const keyA = sortKey(a);
    const keyB = sortKey(b);
    if (keyA !== keyB) return keyA < keyB ? -1 : 1;
    return a.store.name.localeCompare(b.store.name, "ja");
  });

  const counts = Object.fromEntries(REASONS.map((reason) => [reason.key, 0]));
  items.forEach((item) => item.reasons.forEach((key) => { counts[key] += 1; }));

  return { items, counts };
}

export function renderTodayBreakdown(counts) {
  return REASONS.map((reason) => `
    <span class="today-breakdown-item">${escapeHtml(reason.label)} <strong>${counts[reason.key]}</strong></span>
  `).join("");
}

export function renderTodayRows(items) {
  if (items.length === 0) {
    return `<p class="today-empty">今日の対応はありません</p>`;
  }

  const header = `
    <div class="today-row today-row-header" aria-hidden="true">
      <span>該当理由</span><span>店舗名</span><span>担当者</span><span>営業ステータス</span>
      <span>次回連絡日</span><span>アポ日時</span><span>次回アクション</span><span>メモ</span>
    </div>
  `;

  const rows = items.map(({ store, reasons }) => `
    <button class="today-row" type="button" data-today-store-id="${escapeHtml(store.id)}">
      <span class="today-badges">
        ${reasons.map((key) => {
          const reason = REASONS.find((item) => item.key === key);
          return `<span class="today-badge is-${key}">${escapeHtml(reason.label)}</span>`;
        }).join("")}
      </span>
      <span class="today-name">${escapeHtml(store.name)}</span>
      <span>${escapeHtml(store.ownerName || "-")}</span>
      <span>${escapeHtml(store.status)}</span>
      <span>${escapeHtml(formatDate(store.nextContactDate))}</span>
      <span>${escapeHtml(formatDateTime(store.appointmentAt))}</span>
      <span class="today-text">${escapeHtml(store.nextAction || "-")}</span>
      <span class="today-text">${escapeHtml(store.memo || "-")}</span>
    </button>
  `).join("");

  return header + rows;
}
