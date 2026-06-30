import { SUMMARY_ITEMS } from "../constants.js";
import { escapeHtml } from "../utils.js";

export function renderSummary(stores) {
  const counts = stores.reduce(
    (result, store) => {
      result.__total += 1;
      result[store.status] = (result[store.status] || 0) + 1;
      return result;
    },
    { __total: 0 }
  );

  return SUMMARY_ITEMS.map((item) => {
    const value = counts[item.key] || 0;
    const statusAttribute = item.key === "__total" ? "" : ` data-status="${escapeHtml(item.key)}"`;
    const totalClass = item.key === "__total" ? " is-total" : "";

    return `
      <article class="summary-item${totalClass}"${statusAttribute}>
        <p class="summary-label">${escapeHtml(item.label)}</p>
        <p class="summary-value">${value}</p>
      </article>
    `;
  }).join("");
}
