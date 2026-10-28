import type { DailyForecast } from "@/lib/weather";
import { clothingAdvice, umbrellaAdvice } from "@/lib/advice";
import WeatherIcon from "./WeatherIcon";
import AdviceCard from "./AdviceCard";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const w = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}月${d}日（${w}）`;
}

const pct = (pop: number) => `${Math.round(pop * 100)}%`;

export default function DayDetail({ day }: { day: DailyForecast }) {
  return (
    <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">{formatDate(day.date)} の予報</h2>

      <div className="mt-2 flex items-center gap-3">
        <WeatherIcon icon={day.icon} alt={day.description} size={72} />
        <div>
          <p className="text-slate-600">{day.description}</p>
          <p className="text-2xl font-bold text-slate-900">
            <span className="text-rose-500">{Math.round(day.tempMax)}°</span>
            <span className="mx-1 text-slate-400">/</span>
            <span className="text-sky-600">{Math.round(day.tempMin)}°</span>
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="降水確率" value={pct(day.pop)} />
        <Stat label="湿度（平均）" value={`${day.humidity}%`} />
        <Stat label="最大風速" value={`${day.windSpeed.toFixed(1)} m/s`} />
      </dl>

      <div className="mt-4 grid gap-2">
        <AdviceCard label="傘アドバイス" advice={umbrellaAdvice(day.pop)} />
        <AdviceCard label="服装アドバイス" advice={clothingAdvice(day.tempMax, day.tempMin)} />
      </div>

      <h3 className="mt-5 mb-2 text-sm font-medium text-slate-600">3時間ごとの予報</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {day.hourly.map((h) => (
          <div key={h.time} className="flex min-w-16 flex-col items-center rounded-lg bg-slate-50 px-2 py-2 text-xs">
            <span className="font-medium text-slate-700">{h.time}</span>
            <WeatherIcon icon={h.icon} alt={h.description} size={36} />
            <span className="font-semibold text-slate-900">{Math.round(h.temp)}°</span>
            <span className="text-sky-600">☂ {pct(h.pop)}</span>
            <span className="text-slate-500">💧 {h.humidity}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
