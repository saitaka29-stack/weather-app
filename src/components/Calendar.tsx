"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DailyForecast } from "@/lib/weather";
import { iconUrl } from "./WeatherIcon";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  daily: DailyForecast[];
  selected: string;
  onSelect: (date: string) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Calendar({ daily, selected, onSelect }: Props) {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const [year, month] = selected.split("-").map(Number);
  const [view, setView] = useState({ year, month }); // month は 1〜12

  // 週間予報など外から選択日が変わったら、その月を表示する
  useEffect(() => setView({ year, month }), [year, month]);

  // 表示中の月の日付マス（前後の空きマスは null）
  const firstWeekday = new Date(Date.UTC(view.year, view.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.year, view.month, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => `${view.year}-${pad(view.month)}-${pad(i + 1)}`,
    ),
  ];

  const move = (delta: number) => {
    const d = new Date(Date.UTC(view.year, view.month - 1 + delta, 1));
    setView({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  };

  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => move(-1)} className="rounded px-2 py-1 hover:bg-slate-100" aria-label="前の月">
          ‹
        </button>
        <h2 className="font-semibold text-slate-800">
          {view.year}年 {view.month}月
        </h2>
        <button onClick={() => move(1)} className="rounded px-2 py-1 hover:bg-slate-100" aria-label="次の月">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 font-medium ${i === 0 ? "text-rose-500" : i === 6 ? "text-sky-600" : "text-slate-500"}`}
          >
            {w}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const day = byDate.get(date);
          const isSelected = date === selected;
          return (
            <button
              key={date}
              disabled={!day}
              onClick={() => day && onSelect(date)}
              className={[
                "flex h-16 flex-col items-center justify-start rounded-lg pt-1 transition",
                day ? "hover:bg-sky-50" : "cursor-not-allowed text-slate-300",
                isSelected ? "bg-sky-600 text-white hover:bg-sky-600" : "",
              ].join(" ")}
            >
              <span className="text-sm">{Number(date.slice(8))}</span>
              {day && (
                <>
                  <Image src={iconUrl(day.icon)} alt={day.description} width={28} height={28} unoptimized />
                  <span className="text-[10px] leading-none">{Math.round(day.tempMax)}°</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        ※ 無料プランの予報は今日から約5日先まで。予報がある日だけ選べます。
      </p>
    </div>
  );
}
