import { AREA_NAMES, SAMPLE_STORES, STATUSES, STORAGE_KEYS } from "../constants.js";
import { createId, getIsoNow } from "../utils.js";
import { readJson, writeJson } from "../storage.js";

const API_BASE_PATH = "/api/stores";

function normalizeStore(input) {
  const now = getIsoNow();
  const status = STATUSES.includes(input.status) ? input.status : "未対応";
  const areaName = normalizeAreaName(input.areaName);

  return {
    id: input.id || createId("store"),
    name: String(input.name ?? "").trim(),
    groupName: String(input.groupName ?? "").trim(),
    areaName,
    ownerName: String(input.ownerName ?? "").trim(),
    status,
    lastContactDate: String(input.lastContactDate ?? "").trim(),
    nextContactDate: String(input.nextContactDate ?? "").trim(),
    appointmentAt: String(input.appointmentAt ?? "").trim(),
    nextAction: String(input.nextAction ?? "").trim(),
    memo: String(input.memo ?? "").trim(),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

function normalizeAreaName(value) {
  const areaName = String(value ?? "").trim();
  if (!areaName) return "未設定";
  return AREA_NAMES.includes(areaName) ? areaName : "その他";
}

function persist(stores) {
  writeJson(STORAGE_KEYS.stores, stores);
  writeJson(STORAGE_KEYS.meta, {
    schemaVersion: 2,
    updatedAt: getIsoNow()
  });
}

function canUseApi() {
  return typeof window !== "undefined" && window.location.protocol !== "file:";
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function initializeStores() {
  const stores = readJson(STORAGE_KEYS.stores, null);
  if (Array.isArray(stores)) {
    const normalizedStores = stores.map(normalizeStore);
    if (JSON.stringify(stores) !== JSON.stringify(normalizedStores)) {
      persist(normalizedStores);
    }
    return normalizedStores;
  }

  persist(SAMPLE_STORES);
  return SAMPLE_STORES.map(normalizeStore);
}

function saveStoreLocally(storeInput) {
  const stores = initializeStores();
  const normalizedStore = normalizeStore({
    ...storeInput,
    updatedAt: getIsoNow()
  });
  const existingIndex = stores.findIndex((store) => store.id === normalizedStore.id);

  if (existingIndex >= 0) {
    normalizedStore.createdAt = stores[existingIndex].createdAt;
    stores[existingIndex] = normalizedStore;
  } else {
    stores.unshift(normalizedStore);
  }

  persist(stores);
  return normalizedStore;
}

function saveStoresLocally(storeInputs) {
  const stores = initializeStores();
  const normalizedStores = storeInputs
    .map((storeInput) => normalizeStore({
      ...storeInput,
      updatedAt: getIsoNow()
    }))
    .filter((store) => store.name);

  persist([...normalizedStores, ...stores]);
  return normalizedStores;
}

export async function getStores() {
  if (canUseApi()) {
    try {
      const stores = await requestJson(API_BASE_PATH);
      const normalizedStores = stores.map(normalizeStore);
      persist(normalizedStores);
      return normalizedStores;
    } catch (error) {
      console.warn("D1から店舗データを取得できないため、LocalStorageを表示します。", error);
    }
  }

  return initializeStores();
}

export async function saveStore(storeInput) {
  const isUpdate = Boolean(storeInput.id);
  const normalizedStore = normalizeStore({
    ...storeInput,
    updatedAt: getIsoNow()
  });

  if (canUseApi()) {
    try {
      const path = isUpdate ? `${API_BASE_PATH}/${encodeURIComponent(normalizedStore.id)}` : API_BASE_PATH;
      const store = await requestJson(path, {
        method: isUpdate ? "PUT" : "POST",
        body: JSON.stringify(normalizedStore)
      });
      return normalizeStore(store);
    } catch (error) {
      console.warn("D1へ店舗データを保存できないため、LocalStorageへ保存します。", error);
    }
  }

  return saveStoreLocally(normalizedStore);
}

export async function saveStores(storeInputs) {
  const normalizedStores = storeInputs
    .map((storeInput) => normalizeStore({
      ...storeInput,
      updatedAt: getIsoNow()
    }))
    .filter((store) => store.name);

  if (canUseApi()) {
    try {
      const savedStores = await Promise.all(
        normalizedStores.map((store) => requestJson(API_BASE_PATH, {
          method: "POST",
          body: JSON.stringify(store)
        }))
      );
      return savedStores.map(normalizeStore);
    } catch (error) {
      console.warn("D1へ一括登録できないため、LocalStorageへ保存します。", error);
    }
  }

  return saveStoresLocally(normalizedStores);
}

export async function updateStoreStatus(storeId, status) {
  const stores = await getStores();
  const target = stores.find((store) => store.id === storeId);
  if (!target || !STATUSES.includes(status)) return null;

  return saveStore({
    ...target,
    status,
    updatedAt: getIsoNow()
  });
}

export async function deleteStore(storeId) {
  if (canUseApi()) {
    try {
      await requestJson(`${API_BASE_PATH}/${encodeURIComponent(storeId)}`, {
        method: "DELETE"
      });
      return;
    } catch (error) {
      console.warn("D1の店舗データを削除できないため、LocalStorageから削除します。", error);
    }
  }

  const stores = initializeStores().filter((store) => store.id !== storeId);
  persist(stores);
}

export async function replaceStores(importedStores) {
  const stores = importedStores
    .map(normalizeStore)
    .filter((store) => store.name);

  if (canUseApi()) {
    try {
      const savedStores = await requestJson(API_BASE_PATH, {
        method: "PUT",
        body: JSON.stringify({ stores })
      });
      const normalizedStores = savedStores.map(normalizeStore);
      persist(normalizedStores);
      return normalizedStores;
    } catch (error) {
      console.warn("D1へCSVデータを保存できないため、LocalStorageへ保存します。", error);
    }
  }

  persist(stores);
  return stores;
}
