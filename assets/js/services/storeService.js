import { AREA_NAMES, SAMPLE_STORES, STATUSES, STORAGE_KEYS } from "../constants.js";
import { createId, getIsoNow } from "../utils.js";
import { readJson, writeJson } from "../storage.js";

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
    schemaVersion: 1,
    updatedAt: getIsoNow()
  });
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

export function getStores() {
  return initializeStores();
}

export function saveStore(storeInput) {
  const stores = getStores();
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

export function saveStores(storeInputs) {
  const stores = getStores();
  const normalizedStores = storeInputs
    .map((storeInput) => normalizeStore({
      ...storeInput,
      updatedAt: getIsoNow()
    }))
    .filter((store) => store.name);

  persist([...normalizedStores, ...stores]);
  return normalizedStores;
}

export function updateStoreStatus(storeId, status) {
  const stores = getStores();
  const target = stores.find((store) => store.id === storeId);
  if (!target || !STATUSES.includes(status)) return null;

  target.status = status;
  target.updatedAt = getIsoNow();
  persist(stores);
  return target;
}

export function deleteStore(storeId) {
  const stores = getStores().filter((store) => store.id !== storeId);
  persist(stores);
}

export function replaceStores(importedStores) {
  const stores = importedStores
    .map(normalizeStore)
    .filter((store) => store.name);

  persist(stores);
  return stores;
}
