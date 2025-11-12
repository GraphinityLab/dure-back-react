/* eslint-disable no-unused-vars */
import React from "react";
import MetricCard from "./MetricCard";

export default function MetricsRow({
  activeTitle,
  dashboardData,
  formatCurrency,
  formatDuration,
  loading,
}) {
  // skeleton
  if (!dashboardData || loading) {
    const placeholders = activeTitle === "Services" ? 3 : 4;
    return (
      <div
        className={[
          "w-full gap-4",
          activeTitle === "Services" ? "grid grid-cols-3" : "grid grid-cols-4",
        ].join(" ")}
      >
        {Array.from({ length: placeholders }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-[1px] bg-gradient-to-br from-white/70 via-white/50 to-white/20 border border-white/60"
          >
            <div className="h-[110px] rounded-2xl bg-white/65 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // service metrics
  let totalServices = 0,
    avgPrice = 0,
    avgDuration = 0;

  if (activeTitle === "Services" && dashboardData?.services?.length > 0) {
    const s = dashboardData.services[0];
    totalServices = Number(s.total_services || 0);
    avgPrice = Number(s.avg_price || 0);
    avgDuration = Number(s.avg_duration_minutes || 0);
  }

  const pending = Number(dashboardData?.counts?.pendingAppointments || 0);

  const metrics =
    activeTitle === "Services"
      ? [
          {
            title: "Total Services",
            value: totalServices,
            icon: "total",
            tone: "default",
          },
          {
            title: "Avg Price",
            value: formatCurrency(avgPrice),
            icon: "today",
            tone: "muted",
          },
          {
            title: "Avg Duration",
            value: formatDuration(avgDuration),
            icon: "staff",
            tone: "muted",
          },
        ]
      : [
          {
            title: "Total Appointments",
            value: dashboardData?.counts?.totalAppointments || 0,
            change: `Pending: ${pending}`,
            icon: "total",
            tone: "default",
          },
          {
            title: "Today’s Appointments",
            value: dashboardData?.counts?.todaysAppointments || 0,
            icon: "today",
            tone: "muted",
          },
          {
            title: "Staff Online",
            value: dashboardData?.counts?.onlineStaff || 0,
            icon: "staff",
            tone: "muted",
          },
          {
            title: "Pending Approvals",
            value: pending,
            change: pending > 0 ? "Needs attention" : "All clear",
            icon: "pending",
            tone: pending > 0 ? "warn" : "success",
          },
        ];

  return (
    <div
      className={[
        "w-full gap-4",
        activeTitle === "Services" ? "grid grid-cols-3" : "grid grid-cols-4",
      ].join(" ")}
    >
      {metrics.map((m, idx) => (
        <MetricCard key={idx} {...m} />
      ))}
    </div>
  );
}
