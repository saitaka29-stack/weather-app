"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeatherResponse } from "@/lib/weather";
import { addHistory, readHistory, saveHistory, type HistoryItem } from "@/lib/history";
import SearchBar from "@/components/SearchBar";
import Calendar from "@/components/Calendar";
import DayDetail from "@/components/DayDetail";
import WeatherIcon from "@/components/WeatherIcon";

const LAST_CITY_KEY = "weather:lastCity";

export default function Home() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 取得に成功したらデータを返し、失敗したら null を返す
  const load = useCallback(async (query: URLSearchParams): Promise<WeatherResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?${query}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "取得に失敗しました");
      setData(json);
      setSelected(json.daily[0]?.date ?? "");
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCity = useCallback(
    async (city: string) => {
      const result = await load(new URLSearchParams({ city }));
      if (!result) return; // 見つからなかった都市は履歴に残さない
      try {
        localStorage.setItem(LAST_CITY_KEY, city);
      } catch {}
      setHistory((h) => addHistory(h, { label: result.location.name, query: city }));
    },
    [load],
  );

  const locate = () => {
    if (!navigator.geolocation) {
      setError("このブラウザは位置情報に対応していません");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        load(new URLSearchParams({ lat: String(coords.latitude), lon: String(coords.longitude) })),
      () => {
        setLoading(false);
        setError("現在地を取得できませんでした（位置情報の許可を確認してください）");
      },
    );
  };

  const clearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  // 初回表示：前回見た都市、なければ東京
  useEffect(() => {
    setHistory(readHistory());
    let city = "Tokyo,JP";
    try {
      city = localStorage.getItem(LAST_CITY_KEY) ?? city;
    } catch {}
    load(new URLSearchParams({ city }));
  }, [load]);

  const day = data?.daily.find((d) => d.date === selected);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">☀️ お天気カレンダー</h1>

      <SearchBar
        loading={loading}
        history={history}
        onSearch={searchCity}
        onLocate={locate}
        onClearHistory={clearHistory}
      />

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-rose-700">{error}</p>}
      {loading && <p className="mt-4 text-slate-600">読み込み中…</p>}

      {data && (
        <div className={`mt-6 space-y-6 ${loading ? "opacity-50" : ""}`}>
          {/* 現在の天気 */}
          <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 p-6 text-white shadow">
            <p className="text-sm opacity-90">現在の天気</p>
            <h2 className="text-2xl font-bold">
              {data.location.name}
              <span className="ml-2 text-base font-normal opacity-80">{data.location.country}</span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-2">
              <div className="flex items-center">
                <WeatherIcon icon={data.current.icon} alt={data.current.description} size={88} />
                <div>
                  <p className="text-5xl font-bold">{Math.round(data.current.temp)}°C</p>
                  <p className="opacity-90">
                    {data.current.description}・体感 {Math.round(data.current.feelsLike)}°C
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <dt className="text-xs opacity-80">湿度</dt>
                  <dd className="text-xl font-semibold">{data.current.humidity}%</dd>
                </div>
                <div>
                  <dt className="text-xs opacity-80">降水確率</dt>
                  <dd className="text-xl font-semibold">
                    {data.current.pop === null ? "-" : `${Math.round(data.current.pop * 100)}%`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs opacity-80">風速</dt>
                  <dd className="text-xl font-semibold">{data.current.windSpeed.toFixed(1)} m/s</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* カレンダー + 選択日の詳細 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <Calendar
              key={data.location.lat + "," + data.location.lon}
              daily={data.daily}
              selected={selected}
              onSelect={setSelected}
            />
            {day ? (
              <DayDetail day={day} />
            ) : (
              <div className="rounded-2xl bg-white/80 p-5 text-slate-500 shadow-sm">
                カレンダーから日付を選んでください
              </div>
            )}
          </div>

          {/* 週間一覧 */}
          <section className="rounded-2xl bg-white/80 p-4 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-800">週間予報</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {data.daily.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelected(d.date)}
                  className={`flex flex-col items-center rounded-lg p-2 text-sm ${
                    d.date === selected ? "bg-sky-100 ring-2 ring-sky-500" : "bg-slate-50 hover:bg-sky-50"
                  }`}
                >
                  <span className="font-medium text-slate-700">{d.date.slice(5).replace("-", "/")}</span>
                  <WeatherIcon icon={d.icon} alt={d.description} size={44} />
                  <span>
                    <span className="text-rose-500">{Math.round(d.tempMax)}°</span> /{" "}
                    <span className="text-sky-600">{Math.round(d.tempMin)}°</span>
                  </span>
                  <span className="text-xs text-sky-700">☂ {Math.round(d.pop * 100)}%</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-slate-500">
        Weather data © <a className="underline" href="https://openweathermap.org/">OpenWeatherMap</a>
      </footer>
    </main>
  );
}
