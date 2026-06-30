import { STATUSES } from "../constants.js";
import { escapeHtml, formatDate, formatDateTime } from "../utils.js";

export function renderStoreRows(stores) {
  return stores.map((store) => `
    <tr>
      <td class="store-name">${escapeHtml(store.name)}</td>
      <td>${escapeHtml(store.groupName || "-")}</td>
      <td>${escapeHtml(store.areaName || "未設定")}</td>
      <td>${escapeHtml(store.ownerName || "-")}</td>
      <td>
        <select class="status-select" data-status-store-id="${escapeHtml(store.id)}" aria-label="${escapeHtml(store.name)}の営業ステータス">
          ${STATUSES.map((status) => `
            <option value="${escapeHtml(status)}"${status === store.status ? " selected" : ""}>${escapeHtml(status)}</option>
          `).join("")}
        </select>
      </td>
      <td class="date-cell">${escapeHtml(formatDate(store.lastContactDate))}</td>
      <td class="date-cell">${escapeHtml(formatDate(store.nextContactDate))}</td>
      <td class="date-cell">${escapeHtml(formatDateTime(store.appointmentAt))}</td>
      <td class="action-cell">${escapeHtml(store.nextAction || "-")}</td>
      <td class="memo-cell">${escapeHtml(store.memo || "-")}</td>
      <td>
        <div class="row-actions">
          <button class="button button-secondary inline-edit-button" data-edit-store-id="${escapeHtml(store.id)}" type="button">編集</button>
          <button class="button button-danger-outline inline-delete-button" data-delete-store-id="${escapeHtml(store.id)}" data-store-name="${escapeHtml(store.name)}" type="button">
            <span class="trash-icon" aria-hidden="true">🗑</span>
            <span>削除</span>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}
