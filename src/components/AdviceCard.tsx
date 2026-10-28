import type { Advice } from "@/lib/advice";

const TONE_CLASS: Record<Advice["tone"], string> = {
  warn: "border-sky-300 bg-sky-50",
  notice: "border-amber-300 bg-amber-50",
  ok: "border-emerald-300 bg-emerald-50",
  info: "border-violet-300 bg-violet-50",
};

export default function AdviceCard({ label, advice }: { label: string; advice: Advice }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${TONE_CLASS[advice.tone]}`}>
      <span className="text-3xl" aria-hidden>
        {advice.emoji}
      </span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-900">{advice.title}</p>
        <p className="text-xs text-slate-600">{advice.detail}</p>
      </div>
    </div>
  );
}
