const AREA_NAMES = ["未設定", "歌舞伎町", "横浜", "千葉", "名古屋", "大阪", "福岡", "札幌", "その他"];
const OWNER_NAMES = ["未設定", "島田和明", "川村大登", "水野貴之", "白石裕"];
const STATUSES = ["未対応", "コール済み", "コール済み（返信なし）", "連絡済み", "返信あり", "アポ", "商談", "契約", "見送り"];

export async function onRequestPut({ request, env, params }) {
  const id = params.id;
  const existing = await getStore(env.DB, id);

  if (!existing) {
    return json({ message: "Store not found." }, 404);
  }

  const payload = await request.json();
  const store = normalizeStore({
    ...existing,
    ...payload,
    id,
    createdAt: existing.createdAt
  });

  await env.DB.prepare(`
    UPDATE stores
    SET
      name = ?,
      group_name = ?,
      area_name = ?,
      owner_name = ?,
      status = ?,
      last_contact_date = ?,
      next_contact_date = ?,
      appointment_at = ?,
      next_action = ?,
      memo = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
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
    store.updatedAt,
    id
  ).run();

  return json(store);
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare("DELETE FROM stores WHERE id = ?").bind(params.id).run();
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function getStore(db, id) {
  return db.prepare(`
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
    WHERE id = ?
  `).bind(id).first();
}

function normalizeStore(input = {}) {
  return {
    id: String(input.id || "").trim(),
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
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
