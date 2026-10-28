// 予報データから、生活に役立つ一言アドバイスを作る。

export type Advice = {
  emoji: string;
  title: string;
  detail: string;
  tone: "warn" | "notice" | "ok";
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
