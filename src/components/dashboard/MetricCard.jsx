/* eslint-disable no-unused-vars */
import React from 'react';

export default function MetricCard({ title, value, change, tone }) {
  const isWarn = tone === "warn";
  return (
    <div
      className={`rounded-2xl border bg-white/50 px-4 py-3 ${
        isWarn ? "border-[#b65d4a]/40" : "border-white/65"
      } shadow-[0_22px_42px_rgba(214,180,150,0.18)]`}
    >
      <p className="text-[0.55rem] uppercase tracking-[0.35em] text-[#3c2b21]/60 mb-1">
        {title}
      </p>
      <p className="text-[1.55rem] font-semibold text-[#3c2b21] leading-none mb-1">
        {value}
      </p>
      {change && (
        <p
          className={`text-[0.58rem] ${
            isWarn ? "text-[#9b3b27]" : "text-[#3c2b21]/55"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
