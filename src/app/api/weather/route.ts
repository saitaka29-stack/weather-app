import { NextRequest, NextResponse } from "next/server";
import { buildResponse, type OwmCurrent, type OwmForecast } from "@/lib/weather";

// API キーはサーバー側でのみ読み込む（NEXT_PUBLIC_ を付けないのでブラウザには渡らない）
const API_KEY = process.env.OPENWEATHER_API_KEY;
// テスト時にダミーサーバーへ向けられるよう上書き可能にしておく（通常は未設定でOK）
const BASE = process.env.OPENWEATHER_BASE_URL ?? "https://api.openweathermap.org";

type GeoResult = {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
};

async function owm<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("appid", API_KEY!);

  // 同じ地点へのリクエストは 10 分間キャッシュして API の呼び出し回数を節約
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new OwmError(res.status, body.message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

class OwmError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "サーバーに OPENWEATHER_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city")?.trim();
  let lat = searchParams.get("lat");
  let lon = searchParams.get("lon");
  let displayName: string | undefined;

  try {
    // 都市名が指定されたら、ジオコーディング API で緯度・経度に変換する
    if (city) {
      const [place] = await owm<GeoResult[]>("/geo/1.0/direct", { q: city, limit: "1" });
      if (!place) {
        return NextResponse.json(
          { error: `「${city}」が見つかりませんでした` },
          { status: 404 },
        );
      }
      lat = String(place.lat);
      lon = String(place.lon);
      displayName = place.local_names?.ja ?? place.name;
    }

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "city または lat/lon を指定してください" },
        { status: 400 },
      );
    }

    const params = { lat, lon, units: "metric", lang: "ja" };
    const [current, forecast] = await Promise.all([
      owm<OwmCurrent>("/data/2.5/weather", params),
      owm<OwmForecast>("/data/2.5/forecast", params),
    ]);

    return NextResponse.json(buildResponse(current, forecast, displayName));
  } catch (e) {
    if (e instanceof OwmError) {
      const message =
        e.status === 401
          ? "API キーが無効です（発行直後は有効になるまで数時間かかることがあります）"
          : `天気 API エラー: ${e.message}`;
      return NextResponse.json({ error: message }, { status: e.status === 401 ? 500 : 502 });
    }
    return NextResponse.json({ error: "天気データの取得に失敗しました" }, { status: 502 });
  }
}
