// 予報データから、生活に役立つ一言アドバイスを作る。

export type Advice = {
  emoji: string;
  title: string;
  detail: string;
  tone: "warn" | "notice" | "ok" | "info";
};

/** 降水確率（0〜1）から傘が必要かを判定する */
export function umbrellaAdvice(pop: number): Advice {
  const percent = Math.round(pop * 100);
  if (percent >= 50) {
    return { emoji: "☔", title: "傘が必要です", detail: `降水確率 ${percent}%。長傘を持って出かけましょう`, tone: "warn" };
  }
  if (percent >= 30) {
    return { emoji: "🌂", title: "折りたたみ傘があると安心", detail: `降水確率 ${percent}%。念のためカバンに1本`, tone: "notice" };
  }
  return { emoji: "☀️", title: "傘はいらなそう", detail: `降水確率 ${percent}%。雨の心配はほぼありません`, tone: "ok" };
}

const CLOTHING: { min: number; emoji: string; title: string }[] = [
  { min: 25, emoji: "👕", title: "半袖でOK" },
  { min: 20, emoji: "👔", title: "長袖シャツ・薄手のカーディガン" },
  { min: 16, emoji: "🧥", title: "薄手の上着があると安心" },
  { min: 12, emoji: "🧶", title: "セーターや厚手の上着" },
  { min: 8, emoji: "🧥", title: "コートが必要" },
  { min: -Infinity, emoji: "🧣", title: "厚手のコート＋マフラー・手袋" },
];

/** 最高・最低気温から服装の目安を決める */
export function clothingAdvice(tempMax: number, tempMin: number): Advice {
  const max = Math.round(tempMax);
  const min = Math.round(tempMin);
  const { emoji, title } = CLOTHING.find((c) => max >= c.min)!;
  const gap = max - min >= 10 ? "。朝晩は冷えるので、脱ぎ着しやすい服で" : "";
  return { emoji, title, detail: `最高 ${max}℃ / 最低 ${min}℃${gap}`, tone: "info" };
}
