# ☀️ お天気カレンダー

🔗 **公開サイト:** https://weather-calendar-seven.vercel.app/

[OpenWeatherMap](https://openweathermap.org/) の無料 API を使った天気予報アプリです（Next.js + TypeScript + Tailwind CSS）。

## できること

- 都市名で検索（主要都市はワンクリック）、または **📍現在地** の天気を表示
- 現在の **気温・体感温度・天気・湿度・降水確率・風速**
- **カレンダー** で日付を選んで、その日の予報（最高/最低気温・降水確率・湿度・3時間ごとの推移）に切り替え
- 週間予報の一覧（無料プランのため今日から約5日先まで）

## 追加機能（課題3）

| 機能 | 誰の | どんな課題を | どう解決するか |
| --- | --- | --- | --- |
| ① 傘アドバイス | 通勤・通学で出かける人の | 降水確率の数字を見ても、傘を持つべきか迷う課題を | 選んだ日の降水確率から「傘が必要☔ / 折りたたみがあると安心🌂 / 傘はいらなそう☀️」を一言で表示する |
| ② 服装アドバイス | 朝、出かける前に服を選ぶ人の | 気温の数字だけでは、何を着ればいいか分かりにくい課題を | 選んだ日の最高・最低気温から服装の目安を表示する（寒暖差10℃以上なら「脱ぎ着しやすい服で」と添える） |
| ③ 検索履歴ボタン | 実家や旅行先など、決まった複数の都市の天気をよく見る人の | 毎回、都市名を入力し直すのが面倒な課題を | 最近調べた都市（最大5件）をボタンで表示し、ワンクリックで切り替えられるようにする（ブラウザに保存） |

## しくみ

```
ブラウザ ──fetch──▶ /api/weather（Next.js の Route Handler・サーバー側）──▶ OpenWeatherMap API
                         └ ここでだけ process.env.OPENWEATHER_API_KEY を読む
```

- API キーは環境変数 `OPENWEATHER_API_KEY` で管理し、コードには直書きしていません。
- 名前に `NEXT_PUBLIC_` を付けていないので、キーはブラウザに送られません（サーバー側でのみ使用）。
- 使っている API（すべて無料プランで使えます）
  - Geocoding API `/geo/1.0/direct`：都市名 → 緯度・経度
  - Current Weather `/data/2.5/weather`：現在の天気
  - 5 Day / 3 Hour Forecast `/data/2.5/forecast`：予報（降水確率 `pop` を含む）

| ファイル | 役割 |
| --- | --- |
| `src/app/api/weather/route.ts` | API キーを使って OpenWeatherMap を呼ぶサーバー側の処理 |
| `src/lib/weather.ts` | 3時間ごとの予報を「日ごと」にまとめる変換処理と型 |
| `src/app/page.tsx` | 画面全体（状態管理・現在の天気） |
| `src/components/Calendar.tsx` | 日付を選べるカレンダー |
| `src/components/DayDetail.tsx` | 選んだ日の詳細 |
| `src/components/SearchBar.tsx` | 都市検索・現在地ボタン・最近の検索 |
| `src/lib/advice.ts` / `src/components/AdviceCard.tsx` | 傘・服装アドバイスの判定と表示 |
| `src/lib/history.ts` | 検索履歴の保存（localStorage） |

## ローカルで動かす

1. [OpenWeatherMap](https://home.openweathermap.org/users/sign_up) に無料登録し、[API keys](https://home.openweathermap.org/api_keys) ページでキーを確認
   - ※発行直後のキーは、有効になるまで数十分〜数時間かかることがあります
2. 環境変数ファイルを作成

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` の `your_api_key_here` を自分のキーに書き換えます（`.env.local` は `.gitignore` 済みなので GitHub には上がりません）。

3. 起動

   ```bash
   npm install
   npm run dev
   ```

   http://localhost:3000 を開きます。

## デプロイ（Vercel）

1. このリポジトリを GitHub に push
2. [Vercel](https://vercel.com/new) で GitHub リポジトリを Import
3. **Environment Variables** に `OPENWEATHER_API_KEY` = （自分のキー）を追加して Deploy
   - 後から追加・変更した場合は、Deployments から **Redeploy** すると反映されます
