import { AREA_NAMES, OWNER_NAMES, STATUSES } from "./constants.js";
import { downloadCsv, storesFromCsv, storesToCsv } from "./csv.js";
import { renderSummary } from "./views/dashboardView.js";
import { renderStoreRows } from "./views/storesView.js";
import {
  deleteStore,
  getStores,
  replaceStores,
  saveStores,
  saveStore,
  updateStoreStatus
} from "./services/storeService.js";
import { buildStoreDuplicateKey, parseBulkStoreText } from "./services/bulkImportService.js";
import { includesText } from "./utils.js";

const state = {
  stores: [],
  pendingDelete: null,
  filters: {
    name: "",
    groupName: "",
    ownerName: "",
    status: "",
    areaName: ""
  }
};

const elements = {
  summaryGrid: document.querySelector("#summaryGrid"),
  summaryUpdatedAt: document.querySelector("#summaryUpdatedAt"),
  storeCountText: document.querySelector("#storeCountText"),
  storeTableBody: document.querySelector("#storeTableBody"),
  emptyState: document.querySelector("#emptyState"),
  addStoreButton: document.querySelector("#addStoreButton"),
  bulkAddStoreButton: document.querySelector("#bulkAddStoreButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  csvFileInput: document.querySelector("#csvFileInput"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  storeDialog: document.querySelector("#storeDialog"),
  storeForm: document.querySelector("#storeForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelStoreButton: document.querySelector("#cancelStoreButton"),
  deleteStoreButton: document.querySelector("#deleteStoreButton"),
  bulkStoreDialog: document.querySelector("#bulkStoreDialog"),
  bulkStoreForm: document.querySelector("#bulkStoreForm"),
  bulkStoreText: document.querySelector("#bulkStoreText"),
  closeBulkDialogButton: document.querySelector("#closeBulkDialogButton"),
  cancelBulkButton: document.querySelector("#cancelBulkButton"),
  bulkImportResult: document.querySelector("#bulkImportResult"),
  deleteConfirmDialog: document.querySelector("#deleteConfirmDialog"),
  cancelDeleteButton: document.querySelector("#cancelDeleteButton"),
  confirmDeleteButton: document.querySelector("#confirmDeleteButton"),
  toast: document.querySelector("#toast"),
  filters: {
    name: document.querySelector("#filterName"),
    groupName: document.querySelector("#filterGroup"),
    ownerName: document.querySelector("#filterOwner"),
    status: document.querySelector("#filterStatus"),
    areaName: document.querySelector("#filterArea")
  },
  form: {
    id: document.querySelector("#storeId"),
    name: document.querySelector("#storeName"),
    groupName: document.querySelector("#groupName"),
    areaName: document.querySelector("#areaName"),
    ownerName: document.querySelector("#ownerName"),
    status: document.querySelector("#status"),
    lastContactDate: document.querySelector("#lastContactDate"),
    nextContactDate: document.querySelector("#nextContactDate"),
    appointmentAt: document.querySelector("#appointmentAt"),
    nextAction: document.querySelector("#nextAction"),
    memo: document.querySelector("#memo")
  }
};

function init() {
  state.stores = getStores();
  populateSelectOptions();
  bindEvents();
  render();
}

function populateSelectOptions() {
  elements.filters.ownerName.innerHTML = createOptions([""], "すべて", OWNER_NAMES);
  elements.filters.status.innerHTML = createOptions([""], "すべて", STATUSES);
  elements.filters.areaName.innerHTML = createOptions([""], "すべて", AREA_NAMES);
  elements.form.areaName.innerHTML = createOptions([], "", AREA_NAMES);
  elements.form.ownerName.innerHTML = createOptions([], "", OWNER_NAMES);
  elements.form.status.innerHTML = createOptions([], "", STATUSES);
}

function createOptions(prefixValues, prefixLabel, values) {
  const prefixOptions = prefixValues.map((value) => `<option value="${value}">${prefixLabel}</option>`);
  const valueOptions = values.map((value) => `<option value="${value}">${value}</option>`);
  return [...prefixOptions, ...valueOptions].join("");
}

function bindEvents() {
  Object.entries(elements.filters).forEach(([key, element]) => {
    element.addEventListener("input", () => {
      state.filters[key] = element.value;
      renderStores();
    });
  });

  elements.clearFiltersButton.addEventListener("click", clearFilters);
  elements.addStoreButton.addEventListener("click", () => openStoreDialog());
  elements.bulkAddStoreButton.addEventListener("click", openBulkStoreDialog);
  elements.closeDialogButton.addEventListener("click", closeStoreDialog);
  elements.cancelStoreButton.addEventListener("click", closeStoreDialog);
  elements.storeForm.addEventListener("submit", handleStoreSubmit);
  elements.bulkStoreForm.addEventListener("submit", handleBulkStoreSubmit);
  elements.closeBulkDialogButton.addEventListener("click", closeBulkStoreDialog);
  elements.cancelBulkButton.addEventListener("click", closeBulkStoreDialog);
  elements.deleteStoreButton.addEventListener("click", handleDeleteStore);
  elements.cancelDeleteButton.addEventListener("click", closeDeleteConfirmDialog);
  elements.confirmDeleteButton.addEventListener("click", confirmDeleteStore);
  elements.exportCsvButton.addEventListener("click", handleExportCsv);
  elements.csvFileInput.addEventListener("change", handleImportCsv);

  elements.storeTableBody.addEventListener("change", (event) => {
    const select = event.target.closest("[data-status-store-id]");
    if (!select) return;

    updateStoreStatus(select.dataset.statusStoreId, select.value);
    state.stores = getStores();
    render();
    showToast("営業ステータスを更新しました。");
  });

  elements.storeTableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-store-id]");
    if (editButton) {
      const store = state.stores.find((item) => item.id === editButton.dataset.editStoreId);
      if (store) openStoreDialog(store);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-store-id]");
    if (deleteButton) {
      openDeleteConfirmDialog(deleteButton.dataset.deleteStoreId, deleteButton.dataset.storeName);
    }
  });
}

function render() {
  renderDashboard();
  renderStores();
}

function renderDashboard() {
  elements.summaryGrid.innerHTML = renderSummary(state.stores);
  elements.summaryUpdatedAt.textContent = `最終更新: ${new Date().toLocaleString("ja-JP")}`;
}

function renderStores() {
  const stores = getFilteredStores();
  elements.storeTableBody.innerHTML = renderStoreRows(stores);
  elements.emptyState.hidden = stores.length > 0;
  elements.storeCountText.textContent = `${stores.length}件表示 / 全${state.stores.length}件`;
}

function getFilteredStores() {
  return state.stores.filter((store) => {
    return (
      includesText(store.name, state.filters.name) &&
      includesText(store.groupName, state.filters.groupName) &&
      (!state.filters.areaName || store.areaName === state.filters.areaName) &&
      (!state.filters.ownerName || store.ownerName === state.filters.ownerName) &&
      (!state.filters.status || store.status === state.filters.status)
    );
  });
}

function clearFilters() {
  Object.keys(state.filters).forEach((key) => {
    state.filters[key] = "";
    elements.filters[key].value = "";
  });
  renderStores();
}

function openStoreDialog(store = null) {
  elements.storeForm.reset();
  elements.dialogTitle.textContent = store ? "店舗編集" : "店舗追加";
  elements.deleteStoreButton.hidden = !store;

  if (store) {
    Object.entries(elements.form).forEach(([key, element]) => {
      element.value = store[key] ?? "";
    });
  } else {
    elements.form.id.value = "";
    elements.form.areaName.value = "未設定";
    elements.form.ownerName.value = OWNER_NAMES[0];
    elements.form.status.value = "未対応";
  }

  elements.storeDialog.showModal();
  elements.form.name.focus();
}

function closeStoreDialog() {
  elements.storeDialog.close();
}

function openBulkStoreDialog() {
  elements.bulkStoreForm.reset();
  elements.bulkImportResult.hidden = true;
  elements.bulkImportResult.textContent = "";
  elements.bulkStoreDialog.showModal();
  elements.bulkStoreText.focus();
}

function closeBulkStoreDialog() {
  elements.bulkStoreDialog.close();
}

function handleStoreSubmit(event) {
  event.preventDefault();

  const store = {};
  Object.entries(elements.form).forEach(([key, element]) => {
    store[key] = element.value;
  });

  saveStore(store);
  state.stores = getStores();
  render();
  closeStoreDialog();
  showToast("店舗情報を保存しました。");
}

function handleBulkStoreSubmit(event) {
  event.preventDefault();

  const parsedStores = parseBulkStoreText(elements.bulkStoreText.value);
  const existingKeys = new Set(state.stores.map(buildStoreDuplicateKey));
  const newKeys = new Set();
  const storesToAdd = [];
  let skippedCount = 0;

  parsedStores.forEach((store) => {
    const key = buildStoreDuplicateKey(store);
    if (existingKeys.has(key) || newKeys.has(key)) {
      skippedCount += 1;
      return;
    }

    newKeys.add(key);
    storesToAdd.push({
      name: store.name,
      groupName: store.groupName,
      areaName: "未設定",
      ownerName: "未設定",
      status: "未対応",
      lastContactDate: "",
      nextContactDate: "",
      appointmentAt: "",
      nextAction: "",
      memo: ""
    });
  });

  if (storesToAdd.length > 0) {
    saveStores(storesToAdd);
    state.stores = getStores();
    render();
  }

  const resultText = `追加件数: ${storesToAdd.length}件 / 重複でスキップ: ${skippedCount}件`;
  elements.bulkImportResult.textContent = resultText;
  elements.bulkImportResult.hidden = false;
  showToast(resultText);
}

function handleDeleteStore() {
  const storeId = elements.form.id.value;
  if (!storeId) return;

  openDeleteConfirmDialog(storeId, elements.form.name.value, { closeStoreDialogOnDelete: true });
}

function openDeleteConfirmDialog(storeId, storeName, options = {}) {
  state.pendingDelete = {
    storeId,
    storeName,
    closeStoreDialogOnDelete: Boolean(options.closeStoreDialogOnDelete)
  };
  elements.deleteConfirmDialog.showModal();
  elements.cancelDeleteButton.focus();
}

function closeDeleteConfirmDialog() {
  state.pendingDelete = null;
  elements.deleteConfirmDialog.close();
}

function confirmDeleteStore() {
  if (!state.pendingDelete) return;

  const { storeId, closeStoreDialogOnDelete } = state.pendingDelete;
  deleteStore(storeId);
  state.stores = getStores();
  render();
  elements.deleteConfirmDialog.close();
  if (closeStoreDialogOnDelete) closeStoreDialog();
  state.pendingDelete = null;
  showToast("店舗を削除しました。");
}

function handleExportCsv() {
  const csvText = storesToCsv(getFilteredStores());
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  downloadCsv(`stores_${date}.csv`, csvText);
  showToast("CSVを書き出しました。");
}

async function handleImportCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  const { stores, errors } = storesFromCsv(text);
  event.target.value = "";

  if (errors.length > 0) {
    window.alert(`CSVを確認してください。\n\n${errors.slice(0, 10).join("\n")}`);
    return;
  }

  if (stores.length === 0) {
    window.alert("取り込める店舗データがありません。");
    return;
  }

  const confirmed = window.confirm(`${stores.length}件の店舗データで現在の一覧を置き換えますか？`);
  if (!confirmed) return;

  state.stores = replaceStores(stores);
  clearFilters();
  render();
  showToast("CSVを読み込みました。");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2400);
}

init();
