/* eslint-disable no-unused-vars */
import React from 'react';

import MetricCard from './MetricCard';

export default function MetricsRow({
  activeTitle,
  dashboardData,
  formatCurrency,
  formatDuration,
  loading,
}) {
  // Show loading state if dashboardData is not ready or explicitly loading
  if (!dashboardData || loading) {
    // Render placeholder cards with "Loading..."
    const placeholders = activeTitle === "Services" ? 3 : 4; // match the number of cards in each view

    return (
      <div className="flex gap-4 w-full">
        {Array.from({ length: placeholders }).map((_, idx) => (
          <div key={idx} className="flex-1 animate-pulse">
            <MetricCard title="Loading..." value="..." change="" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate service metrics
  let totalServices = 0,
    avgPrice = 0,
    avgDuration = 0;

  if (activeTitle === "Services" && dashboardData?.services?.length > 0) {
    const s = dashboardData.services[0];
    totalServices = Number(s.total_services || 0);
    avgPrice = Number(s.avg_price || 0);
    avgDuration = Number(s.avg_duration_minutes || 0);
  }

  // Build metrics array
  const metrics =
    activeTitle === "Services"
      ? [
          { title: "Total Services", value: totalServices },
          { title: "Avg Price", value: formatCurrency(avgPrice) },
          { title: "Avg Duration", value: formatDuration(avgDuration) },
        ]
      : [
          {
            title: "Total appointments",
            value: dashboardData?.counts?.totalAppointments || 0,
            change: `Pending: ${
              dashboardData?.counts?.pendingAppointments || 0
            }`,
          },
          {
            title: "Today’s appointments",
            value: dashboardData?.counts?.todaysAppointments || 0,
          },
          {
            title: "Staff online",
            value: dashboardData?.counts?.onlineStaff || 0,
          },
          {
            title: "Pending approvals",
            value: dashboardData?.counts?.pendingAppointments || 0,
            change:
              dashboardData?.counts?.pendingAppointments > 0
                ? "Needs attention"
                : "",
            tone:
              dashboardData?.counts?.pendingAppointments > 0
                ? "warn"
                : undefined,
          },
        ];

  return (
    <div className="flex gap-4 w-full">
      {metrics.map((m, idx) => (
        <div key={idx} className="flex-1">
          <MetricCard {...m} />
        </div>
      ))}
    </div>
  );
}
