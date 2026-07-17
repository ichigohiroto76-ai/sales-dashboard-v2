export const STORAGE_KEYS = {
  stores: "salesManager.stores",
  meta: "salesManager.meta"
};

export const OWNER_NAMES = [
  "未設定",
  "島田和明",
  "川村大登",
  "水野貴之",
  "白石裕"
];

export const AREA_NAMES = [
  "未設定",
  "歌舞伎町",
  "横浜",
  "千葉",
  "名古屋",
  "大阪",
  "福岡",
  "札幌",
  "その他"
];



export const STATUSES = [
  "未対応",
  "コール済み",
  "連絡済み",
  "返信あり",
  "アポ",
  "契約",
  "見送り"
];

export const SUMMARY_ITEMS = [
  { key: "__total", label: "総店舗数" },
  { key: "未対応", label: "未対応" },
  { key: "コール済み", label: "コール済み" },
  { key: "連絡済み", label: "連絡済み" },
  { key: "返信あり", label: "返信あり" },
  { key: "アポ", label: "アポ獲得" },
  { key: "契約", label: "契約" },
  { key: "見送り", label: "見送り" }
];

export const CSV_HEADERS = [
  "id",
  "name",
  "groupName",
  "areaName",
  "ownerName",
  "status",
  "lastContactDate",
  "nextContactDate",
  "appointmentAt",
  "nextAction",
  "memo",
  "createdAt",
  "updatedAt"
];

export const SAMPLE_STORES = [
  {
    id: "store_sample_001",
    name: "青山カフェ",
    groupName: "都心カフェグループ",
    areaName: "その他",
    ownerName: "川村大登",
    status: "返信あり",
    lastContactDate: "2026-06-28",
    nextContactDate: "2026-07-01",
    appointmentAt: "2026-07-02T14:00",
    nextAction: "資料を送付し、導入条件を確認",
    memo: "Instagram経由で反応あり。決裁者確認待ち。",
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z"
  },
  {
    id: "store_sample_002",
    name: "銀座ダイニング",
    groupName: "GINZA FOOD",
    areaName: "その他",
    ownerName: "島田和明",
    status: "コール済み（返信なし）",
    lastContactDate: "2026-06-27",
    nextContactDate: "2026-06-30",
    appointmentAt: "",
    nextAction: "夕方に再コール",
    memo: "店長不在。折り返しなし。",
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z"
  },
  {
    id: "store_sample_003",
    name: "横浜ビストロ",
    groupName: "港町レストランズ",
    areaName: "横浜",
    ownerName: "水野貴之",
    status: "商談",
    lastContactDate: "2026-06-29",
    nextContactDate: "2026-07-03",
    appointmentAt: "2026-07-03T11:00",
    nextAction: "見積もり条件を提示",
    memo: "複数店舗展開の可能性あり。",
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z"
  }
];
