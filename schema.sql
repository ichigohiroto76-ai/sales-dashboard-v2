CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT NOT NULL DEFAULT '',
  area_name TEXT NOT NULL DEFAULT '未設定',
  owner_name TEXT NOT NULL DEFAULT '未設定',
  status TEXT NOT NULL DEFAULT '未対応',
  last_contact_date TEXT NOT NULL DEFAULT '',
  next_contact_date TEXT NOT NULL DEFAULT '',
  appointment_at TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_owner_name ON stores(owner_name);
CREATE INDEX IF NOT EXISTS idx_stores_area_name ON stores(area_name);
CREATE INDEX IF NOT EXISTS idx_stores_updated_at ON stores(updated_at);
