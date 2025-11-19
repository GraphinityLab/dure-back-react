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
  // Get number of columns based on page type
  const getColCount = () => {
    if (activeTitle === "Services") return 3;
    if (activeTitle === "Appointments") return 4;
    if (activeTitle === "Clients") return 4;
    if (activeTitle === "Staff") return 4;
    if (activeTitle === "History") return 4;
    if (activeTitle === "Logs") return 4;
    if (activeTitle === "Roles") return 4;
    if (activeTitle === "Overview") return 4;
    return 3; // Default to 3 for other pages
  };

  const colCount = getColCount();

  // skeleton
  if (!dashboardData || loading) {
    return (
      <div
        className={[
          "w-full gap-4",
          colCount === 3 ? "grid grid-cols-3" : "grid grid-cols-4",
        ].join(" ")}
      >
        {Array.from({ length: colCount }).map((_, idx) => (
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

  // Service metrics
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

  // Build metrics based on active page
  let metrics = [];

  if (activeTitle === "Services") {
    metrics = [
      {
        title: "Total Services",
        value: totalServices,
        icon: "total",
        tone: "default",
        change: totalServices > 0 ? "Active catalog" : "No services yet",
      },
      {
        title: "Avg Price",
        value: formatCurrency(avgPrice),
        icon: "chart",
        tone: "muted",
        change: avgPrice > 0 ? "Per service" : "N/A",
      },
      {
        title: "Avg Duration",
        value: formatDuration(avgDuration),
        icon: "clock",
        tone: "muted",
        change: avgDuration > 0 ? "Per service" : "N/A",
      },
    ];
  } else if (activeTitle === "Appointments") {
    const totalAppts = dashboardData?.counts?.totalAppointments || 0;
    const todayAppts = dashboardData?.counts?.todaysAppointments || 0;
    const onlineStaff = dashboardData?.counts?.onlineStaff || 0;
    
    metrics = [
      {
        title: "Total Appointments",
        value: totalAppts,
        change: `Pending: ${pending}`,
        icon: "total",
        tone: "default",
      },
      {
        title: "Today's Appointments",
        value: todayAppts,
        icon: "today",
        tone: todayAppts > 0 ? "info" : "muted",
        change: todayAppts > 0 ? "Scheduled" : "No appointments",
      },
      {
        title: "Staff Online",
        value: onlineStaff,
        icon: "online",
        tone: onlineStaff > 0 ? "success" : "muted",
        change: onlineStaff > 0 ? "Available" : "Offline",
      },
      {
        title: "Pending Approvals",
        value: pending,
        change: pending > 0 ? "Needs attention" : "All clear",
        icon: "pending",
        tone: pending > 0 ? "warn" : "success",
      },
    ];
  } else if (activeTitle === "Clients") {
    const totalClients = dashboardData?.counts?.totalClients || dashboardData?.clients?.length || 0;
    const newThisMonth = dashboardData?.counts?.newThisMonth || 0;
    const activeClients = dashboardData?.counts?.activeClients || 0;
    const avgAppointments = dashboardData?.counts?.avgAppointmentsPerClient || 0;
    
    metrics = [
      {
        title: "Total Clients",
        value: totalClients,
        icon: "clients",
        tone: "default",
        change: totalClients > 0 ? "Registered" : "No clients yet",
      },
      {
        title: "New This Month",
        value: newThisMonth,
        icon: "trend",
        tone: newThisMonth > 0 ? "success" : "muted",
        change: newThisMonth > 0 ? "Growth" : "No new clients",
      },
      {
        title: "Active Clients",
        value: activeClients,
        icon: "active",
        tone: activeClients > 0 ? "info" : "muted",
        change: activeClients > 0 ? "With appointments" : "No activity",
      },
      {
        title: "Avg Appointments",
        value: avgAppointments.toFixed(1),
        icon: "chart",
        tone: "muted",
        change: avgAppointments > 0 ? "Per client" : "N/A",
      },
    ];
  } else if (activeTitle === "Staff") {
    const totalStaff = dashboardData?.counts?.totalStaff || dashboardData?.staff?.length || 0;
    const onlineStaff = dashboardData?.counts?.onlineStaff || 0;
    const activeStaff = dashboardData?.counts?.activeStaff || 0;
    const totalRoles = dashboardData?.counts?.totalRoles || 0;
    
    metrics = [
      {
        title: "Total Staff",
        value: totalStaff,
        icon: "staff",
        tone: "default",
        change: totalStaff > 0 ? "Team members" : "No staff yet",
      },
      {
        title: "Online Now",
        value: onlineStaff,
        icon: "online",
        tone: onlineStaff > 0 ? "success" : "muted",
        change: onlineStaff > 0 ? "Available" : "All offline",
      },
      {
        title: "Active Staff",
        value: activeStaff,
        icon: "active",
        tone: activeStaff > 0 ? "info" : "muted",
        change: activeStaff > 0 ? "With appointments" : "No assignments",
      },
      {
        title: "Total Roles",
        value: totalRoles,
        icon: "roles",
        tone: "muted",
        change: totalRoles > 0 ? "Defined" : "No roles",
      },
    ];
  } else if (activeTitle === "History") {
    const totalRecords = dashboardData?.counts?.totalRecords || 0;
    const thisMonth = dashboardData?.counts?.thisMonth || 0;
    const completed = dashboardData?.counts?.completed || 0;
    const cancelled = dashboardData?.counts?.cancelled || 0;
    
    metrics = [
      {
        title: "Total Records",
        value: totalRecords,
        icon: "history",
        tone: "default",
        change: totalRecords > 0 ? "All time" : "No history",
      },
      {
        title: "This Month",
        value: thisMonth,
        icon: "trend",
        tone: thisMonth > 0 ? "info" : "muted",
        change: thisMonth > 0 ? "Recent activity" : "No activity",
      },
      {
        title: "Completed",
        value: completed,
        icon: "check",
        tone: completed > 0 ? "success" : "muted",
        change: completed > 0 ? "Finished" : "None",
      },
      {
        title: "Cancelled",
        value: cancelled,
        icon: "cancel",
        tone: cancelled > 0 ? "warn" : "muted",
        change: cancelled > 0 ? "Cancellations" : "None",
      },
    ];
  } else if (activeTitle === "Logs") {
    const totalLogs = dashboardData?.counts?.totalLogs || 0;
    const todayLogs = dashboardData?.counts?.todayLogs || 0;
    const recentChanges = dashboardData?.counts?.recentChanges || 0;
    const systemEvents = dashboardData?.counts?.systemEvents || 0;
    
    metrics = [
      {
        title: "Total Logs",
        value: totalLogs,
        icon: "logs",
        tone: "default",
        change: totalLogs > 0 ? "All entries" : "No logs",
      },
      {
        title: "Today's Logs",
        value: todayLogs,
        icon: "today",
        tone: todayLogs > 0 ? "info" : "muted",
        change: todayLogs > 0 ? "Recent activity" : "No activity",
      },
      {
        title: "Recent Changes",
        value: recentChanges,
        icon: "file",
        tone: recentChanges > 0 ? "info" : "muted",
        change: recentChanges > 0 ? "Last 24h" : "None",
      },
      {
        title: "System Events",
        value: systemEvents,
        icon: "sparkles",
        tone: systemEvents > 0 ? "muted" : "muted",
        change: systemEvents > 0 ? "Events" : "None",
      },
    ];
  } else if (activeTitle === "Roles") {
    const totalRoles = dashboardData?.counts?.totalRoles || dashboardData?.roles?.length || 0;
    const activeRoles = dashboardData?.counts?.activeRoles || 0;
    const totalPermissions = dashboardData?.counts?.totalPermissions || 0;
    const assignedStaff = dashboardData?.counts?.assignedStaff || 0;
    
    metrics = [
      {
        title: "Total Roles",
        value: totalRoles,
        icon: "roles",
        tone: "default",
        change: totalRoles > 0 ? "Defined" : "No roles",
      },
      {
        title: "Active Roles",
        value: activeRoles,
        icon: "active",
        tone: activeRoles > 0 ? "success" : "muted",
        change: activeRoles > 0 ? "In use" : "None active",
      },
      {
        title: "Permissions",
        value: totalPermissions,
        icon: "key",
        tone: "muted",
        change: totalPermissions > 0 ? "Total count" : "None",
      },
      {
        title: "Assigned Staff",
        value: assignedStaff,
        icon: "staff",
        tone: assignedStaff > 0 ? "info" : "muted",
        change: assignedStaff > 0 ? "With roles" : "None",
      },
    ];
  } else if (activeTitle === "Overview") {
    // General dashboard overview metrics
    // Handle both cases: data might be null/undefined or have counts
    const counts = dashboardData?.counts || {};
    const totalAppts = counts.totalAppointments || 0;
    const todayAppts = counts.todaysAppointments || 0;
    const totalClients = counts.totalClients || 0;
    const totalStaff = counts.totalStaff || 0;
    const onlineStaff = counts.onlineStaff || 0;
    const pendingAppts = counts.pendingAppointments || 0;
    const totalServices = counts.totalServices || 0;
    const completedThisMonth = counts.completedThisMonth || 0;
    
    metrics = [
      {
        title: "Total Appointments",
        value: totalAppts,
        icon: "total",
        tone: "default",
        change: `Pending: ${pendingAppts}`,
      },
      {
        title: "Today's Appointments",
        value: todayAppts,
        icon: "today",
        tone: todayAppts > 0 ? "info" : "muted",
        change: todayAppts > 0 ? "Scheduled" : "No appointments",
      },
      {
        title: "Total Clients",
        value: totalClients,
        icon: "clients",
        tone: "default",
        change: totalClients > 0 ? "Registered" : "No clients",
      },
      {
        title: "Staff Online",
        value: totalStaff > 0 ? `${onlineStaff}/${totalStaff}` : "0/0",
        icon: "online",
        tone: onlineStaff > 0 ? "success" : "muted",
        change: onlineStaff > 0 ? "Available" : "All offline",
      },
    ];
  } else if (activeTitle === "Clock In/Out") {
    // Clock In/Out metrics
    const clockStats = dashboardData?.clockStats || {};
    const totalSessions = clockStats.totalSessions || 0;
    const totalMinutes = clockStats.totalMinutes || 0;
    const sessionsThisWeek = clockStats.sessionsThisWeek || 0;
    const minutesThisWeek = clockStats.minutesThisWeek || 0;
    
    metrics = [
      {
        title: "Total Sessions",
        value: totalSessions,
        icon: "history",
        tone: "default",
        change: totalSessions > 0 ? "All time" : "No sessions",
      },
      {
        title: "Total Hours",
        value: formatDuration(totalMinutes),
        icon: "clock",
        tone: totalMinutes > 0 ? "info" : "muted",
        change: totalMinutes > 0 ? "Worked" : "No hours",
      },
      {
        title: "This Week",
        value: sessionsThisWeek,
        icon: "trend",
        tone: sessionsThisWeek > 0 ? "success" : "muted",
        change: sessionsThisWeek > 0 ? `${formatDuration(minutesThisWeek)} worked` : "No sessions",
      },
      {
        title: "Avg Session",
        value: totalSessions > 0 ? formatDuration(Math.round(totalMinutes / totalSessions)) : "0m",
        icon: "chart",
        tone: totalSessions > 0 ? "info" : "muted",
        change: totalSessions > 0 ? "Per session" : "N/A",
      },
    ];
  } else {
    // Default fallback metrics
    metrics = [
      {
        title: "Overview",
        value: "—",
        icon: "chart",
        tone: "muted",
        change: "No data available",
      },
    ];
  }

  return (
    <div
      className={[
        "w-full gap-4",
        colCount === 3 ? "grid grid-cols-3" : "grid grid-cols-4",
      ].join(" ")}
    >
      {metrics.map((m, idx) => (
        <MetricCard key={idx} {...m} />
      ))}
    </div>
  );
}
