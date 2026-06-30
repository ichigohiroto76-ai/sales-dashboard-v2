import { AREA_NAMES, CSV_HEADERS, OWNER_NAMES, STATUSES } from "./constants.js";

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

export function storesFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { stores: [], errors: ["CSVにデータ行がありません。"] };
  }

  const headers = rows[0].map((header) => header.trim());
  const errors = [];
  const stores = [];

  rows.slice(1).forEach((row, rowIndex) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });

    const lineNumber = rowIndex + 2;
    if (!record.name?.trim()) errors.push(`${lineNumber}行目: 店舗名がありません。`);
    if (!record.ownerName?.trim()) {
      errors.push(`${lineNumber}行目: 担当者がありません。`);
    } else if (!OWNER_NAMES.includes(record.ownerName)) {
      errors.push(`${lineNumber}行目: 担当者が固定プルダウンに存在しません。`);
    }
    if (!record.status?.trim()) {
      errors.push(`${lineNumber}行目: 営業ステータスがありません。`);
    } else if (!STATUSES.includes(record.status)) {
      errors.push(`${lineNumber}行目: 営業ステータスが定義外です。`);
    }

    if (record.name?.trim()) {
      stores.push({
        id: record.id,
        name: record.name,
        groupName: record.groupName,
        areaName: normalizeCsvAreaName(record.areaName),
        ownerName: record.ownerName || OWNER_NAMES[0],
        status: record.status || "未対応",
        lastContactDate: record.lastContactDate,
        nextContactDate: record.nextContactDate,
        appointmentAt: normalizeCsvDateTime(record.appointmentAt),
        nextAction: record.nextAction,
        memo: record.memo,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      });
    }
  });

  return { stores, errors };
}

export function storesToCsv(stores) {
  const rows = [
    CSV_HEADERS,
    ...stores.map((store) => CSV_HEADERS.map((header) => store[header] ?? ""))
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function downloadCsv(filename, csvText) {
  const blob = new Blob([`\uFEFF${csvText}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function normalizeCsvDateTime(value) {
  return String(value ?? "").trim().replace(" ", "T");
}

function normalizeCsvAreaName(value) {
  const areaName = String(value ?? "").trim();
  if (!areaName) return "未設定";
  return AREA_NAMES.includes(areaName) ? areaName : "その他";
}
