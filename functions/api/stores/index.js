const AREA_NAMES = ["未設定", "歌舞伎町", "横浜", "千葉", "名古屋", "大阪", "福岡", "札幌", "その他"];
const OWNER_NAMES = ["未設定", "島田和明", "川村大登", "水野貴之", "白石裕"];
const STATUSES = ["未対応", "コール済み", "コール済み（返信なし）", "連絡済み", "返信あり", "アポ", "商談", "契約", "見送り"];

export async function onRequestGet({ env }) {
  const rows = await env.DB.prepare(`
    SELECT
      id,
      name,
      group_name AS groupName,
      area_name AS areaName,
      owner_name AS ownerName,
      status,
      last_contact_date AS lastContactDate,
      next_contact_date AS nextContactDate,
      appointment_at AS appointmentAt,
      next_action AS nextAction,
      memo,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM stores
    ORDER BY updated_at DESC, created_at DESC
  `).all();

  return json(rows.results || []);
}

export async function onRequestPost({ request, env }) {
  const payload = await request.json();
  const store = normalizeStore(payload);

  await insertStore(env.DB, store);
  return json(store, 201);
}

export async function onRequestPut({ request, env }) {
  const payload = await request.json();
  const stores = Array.isArray(payload) ? payload : payload.stores;

  if (!Array.isArray(stores)) {
    return json({ message: "stores must be an array." }, 400);
  }

  const normalizedStores = stores.map(normalizeStore).filter((store) => store.name);
  const statements = [
    env.DB.prepare("DELETE FROM stores"),
    ...normalizedStores.map((store) => insertStoreStatement(env.DB, store))
  ];

  if (statements.length > 0) {
    await env.DB.batch(statements);
  }

  return json(normalizedStores);
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function normalizeStore(input = {}) {
  const now = new Date().toISOString();

  return {
    id: String(input.id || createId()).trim(),
    name: String(input.name || "").trim(),
    groupName: String(input.groupName || "").trim(),
    areaName: normalizeAreaName(input.areaName),
    ownerName: normalizeOwnerName(input.ownerName),
    status: normalizeStatus(input.status),
    lastContactDate: String(input.lastContactDate || "").trim(),
    nextContactDate: String(input.nextContactDate || "").trim(),
    appointmentAt: String(input.appointmentAt || "").trim(),
    nextAction: String(input.nextAction || "").trim(),
    memo: String(input.memo || "").trim(),
    createdAt: input.createdAt || now,
    updatedAt: now
  };
}

function normalizeAreaName(value) {
  const areaName = String(value || "").trim();
  if (!areaName) return "未設定";
  return AREA_NAMES.includes(areaName) ? areaName : "その他";
}

function normalizeOwnerName(value) {
  const ownerName = String(value || "").trim();
  return OWNER_NAMES.includes(ownerName) ? ownerName : "未設定";
}

function normalizeStatus(value) {
  const status = String(value || "").trim();
  return STATUSES.includes(status) ? status : "未対応";
}

function createId() {
  return `store_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

async function insertStore(db, store) {
  await insertStoreStatement(db, store).run();
}

function insertStoreStatement(db, store) {
  return db.prepare(`
    INSERT INTO stores (
      id,
      name,
      group_name,
      area_name,
      owner_name,
      status,
      last_contact_date,
      next_contact_date,
      appointment_at,
      next_action,
      memo,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    store.id,
    store.name,
    store.groupName,
    store.areaName,
    store.ownerName,
    store.status,
    store.lastContactDate,
    store.nextContactDate,
    store.appointmentAt,
    store.nextAction,
    store.memo,
    store.createdAt,
    store.updatedAt
  );
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
