// 最近検索した都市をブラウザ（localStorage）に保存する。

export type HistoryItem = {
  label: string; // 画面に出す名前（例: 東京都）
  query: string; // 再検索に使う文字列（例: Tokyo,JP）
};

const KEY = "weather:history";
const MAX = 5;

export function readHistory(): HistoryItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(items) ? items.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

/** 先頭に追加する（同じ都市は重複させず先頭へ移動、最大 5 件） */
export function addHistory(history: HistoryItem[], item: HistoryItem): HistoryItem[] {
  const next = [item, ...history.filter((h) => h.label !== item.label)].slice(0, MAX);
  saveHistory(next);
  return next;
}

export function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}
