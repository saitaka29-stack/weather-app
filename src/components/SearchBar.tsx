"use client";

import { useState } from "react";

const PRESETS = [
  { label: "札幌", q: "Sapporo,JP" },
  { label: "東京", q: "Tokyo,JP" },
  { label: "名古屋", q: "Nagoya,JP" },
  { label: "大阪", q: "Osaka,JP" },
  { label: "福岡", q: "Fukuoka,JP" },
  { label: "那覇", q: "Naha,JP" },
];

type Props = {
  loading: boolean;
  onSearch: (city: string) => void;
  onLocate: () => void;
};

export default function SearchBar({ loading, onSearch, onLocate }: Props) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onSearch(text.trim());
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="都市名を入力（例: Kyoto, London）"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          検索
        </button>
        <button
          type="button"
          onClick={onLocate}
          disabled={loading}
          title="現在地の天気"
          className="rounded-lg border border-sky-600 px-3 py-2 font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50"
        >
          📍 現在地
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.q}
            onClick={() => onSearch(p.q)}
            disabled={loading}
            className="rounded-full bg-white/70 px-3 py-1 text-sm text-slate-700 shadow-sm hover:bg-white disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
