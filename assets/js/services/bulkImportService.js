export function parseBulkStoreText(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => parseBulkStoreLine(line))
    .filter((store) => store.name);
}

export function buildStoreDuplicateKey(store) {
  return `${normalizeForDuplicate(store.name)}::${normalizeForDuplicate(store.groupName)}`;
}

function parseBulkStoreLine(line) {
  const trimmedLine = String(line ?? "").trim();
  if (!trimmedLine) {
    return { name: "", groupName: "" };
  }

  const matched = trimmedLine.match(/^(.+?)\s*[\(（]\s*(.*?)\s*[\)）]\s*$/);
  if (!matched) {
    return {
      name: trimmedLine,
      groupName: ""
    };
  }

  return {
    name: matched[1].trim(),
    groupName: matched[2].trim()
  };
}

function normalizeForDuplicate(value) {
  return String(value ?? "").trim().toLowerCase();
}
