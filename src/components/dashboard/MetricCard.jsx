/* eslint-disable no-unused-vars */
import React from "react";
import {
  CalendarDays,
  CalendarCheck2,
  Users,
  AlertTriangle,
} from "lucide-react";

/**
 * Props
 * - title: string
 * - value: string | number
 * - change?: string
 * - tone?: 'default' | 'warn' | 'success' | 'muted'
 * - icon?: 'total' | 'today' | 'staff' | 'pending'
 */
const ICONS = {
  total: CalendarDays,
  today: CalendarCheck2,
  staff: Users,
  pending: AlertTriangle,
};

const frameByTone = {
  default:
    "border-white/60 shadow-[0_16px_44px_rgba(214,180,150,0.18)]",
  warn:
    "border-[#F2C7BA] shadow-[0_20px_54px_rgba(233,120,97,0.25)]",
  success:
    "border-[#CDE8D9] shadow-[0_20px_54px_rgba(92,187,141,0.22)]",
  muted:
    "border-white/50 shadow-[0_16px_36px_rgba(12,16,18,0.06)]",
};

const chipByTone = {
  default: "bg-white/65 text-[#6f6159] border-white/70",
  warn: "bg-[#fff3ef] text-[#9c3b29] border-[#f2c3b6]",
  success: "bg-[#f3fbf7] text-[#2f7a55] border-[#cfeedd]",
  muted: "bg-white/55 text-[#85766e] border-white/65",
};

export default function MetricCard({
  title,
  value,
  change,
  tone = "default",
  icon,
}) {
  const Icon = ICONS[icon] || CalendarDays;

  return (
    <div
      className={[
        "group relative h-full w-full rounded-2xl p-[1px]",
        "bg-gradient-to-br from-white/80 via-white/55 to-white/25 backdrop-blur",
        frameByTone[tone],
      ].join(" ")}
      data-testid="metric-card"
    >
      <div className="relative rounded-[1rem] h-full bg-white/72 border border-white/60">
        <div className="grid grid-cols-[auto_1fr] gap-3 p-4">
          {/* icon */}
          <div className="self-start">
            <div className="h-10 w-10 rounded-xl border border-white/70 bg-white/70 flex items-center justify-center">
              <Icon className="h-5 w-5 text-[#6a5950]" aria-hidden />
            </div>
          </div>

          {/* text block */}
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#3c2b21]/60">
              {title}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-[32px] leading-none font-semibold text-[#3c2b21]">
                {value}
              </div>

              {change ? (
                <span
                  className={[
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    chipByTone[tone],
                  ].join(" ")}
                >
                  {change}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* subtle bottom glaze */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-[1rem] bg-gradient-to-t from-black/[0.03] to-transparent" />
      </div>

      {/* hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-white/60 transition" />
    </div>
  );
}
