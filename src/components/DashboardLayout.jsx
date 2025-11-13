/* eslint-disable no-unused-vars */
import {
  useEffect,
  useState,
} from 'react';

import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineHome,
} from 'react-icons/hi';
import { Clock as ClockIcon } from 'lucide-react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { motion } from 'framer-motion';

import axiosInstance from '../../utils/axiosInstance';
import MetricsRow from '../components/dashboard/MetricRow';
import SessionTimer from './SessionTimer';

const LINKS = [
  {
    name: "Overview",
    to: "/dashboard",
    icon: HiOutlineHome,
  },
  {
    name: "Appointments",
    to: "/dashboard/appointments",
    icon: HiOutlineCalendar,
  },
  { name: "Services", to: "/dashboard/services", icon: HiOutlineClipboardList },
  { name: "Clients", to: "/dashboard/clients", icon: HiOutlineUserGroup },
  { name: "Staff", to: "/dashboard/staff", icon: HiOutlineUsers },
  { name: "Clock In/Out", to: "/dashboard/clock", icon: ClockIcon },
  { name: "History", to: "/dashboard/history", icon: HiOutlineClock },
  { name: "Logs", to: "/dashboard/logs", icon: HiOutlineDocumentText },
  { name: "Roles", to: "/dashboard/roles", icon: HiOutlineShieldCheck },
];

export default function DashboardLayout() {
  const [hovered, setHovered] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const activeTitle = (() => {
    if (location.pathname.startsWith("/dashboard/settings")) return "Settings";
    // Check exact match for Overview first
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") return "Overview";
    // Then check other links (excluding Overview to avoid false matches)
    const otherLinks = LINKS.filter(link => link.to !== "/dashboard");
    const found = otherLinks.find((link) => location.pathname.startsWith(link.to));
    return found?.name || "Overview";
  })();

  // -------------------- Fetch Current User --------------------
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/me");
        setCurrentUser(data.user);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // -------------------- Always Fetch Upcoming Appointments --------------------
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/appointments/dashboard/overview"
        );
        setUpcomingAppointments(data?.upcomingAppointments || []);
      } catch (err) {
        console.error("Failed to fetch upcoming appointments:", err);
        setUpcomingAppointments([]);
      }
    };
    fetchUpcomingAppointments();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUpcomingAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  // -------------------- Fetch Dashboard Data --------------------
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setDashboardData(null); // Reset data while loading
        
        if (activeTitle === "Services") {
          const { data } = await axiosInstance.get(
            "/services/dashboard/overview"
          );
          setDashboardData(data);
        } else if (activeTitle === "Appointments") {
          const { data } = await axiosInstance.get(
            "/appointments/dashboard/overview"
          );
          setDashboardData(data);
          // Also update upcoming appointments when on appointments page
          setUpcomingAppointments(data?.upcomingAppointments || []);
        } else if (activeTitle === "Clients") {
          try {
            const { data } = await axiosInstance.get(
              "/clients/dashboard/overview"
            );
            setDashboardData(data);
          } catch (err) {
            // Fallback: try to get clients list if dashboard endpoint doesn't exist
            const { data } = await axiosInstance.get("/clients");
            setDashboardData({ clients: Array.isArray(data) ? data : [] });
          }
        } else if (activeTitle === "Staff") {
          try {
            const { data } = await axiosInstance.get(
              "/staff/dashboard/overview"
            );
            setDashboardData(data);
          } catch (err) {
            // Fallback: try to get staff list if dashboard endpoint doesn't exist
            const { data } = await axiosInstance.get("/staff");
            setDashboardData({ staff: data?.staff || [] });
          }
        } else if (activeTitle === "History") {
          try {
            const { data } = await axiosInstance.get(
              "/history/dashboard/overview"
            );
            setDashboardData(data);
          } catch (err) {
            // Fallback: try to get history list if dashboard endpoint doesn't exist
            const { data } = await axiosInstance.get("/history");
            setDashboardData({ history: Array.isArray(data) ? data : [] });
          }
        } else if (activeTitle === "Logs") {
          try {
            const { data } = await axiosInstance.get(
              "/logs/dashboard/overview"
            );
            setDashboardData(data);
          } catch (err) {
            // Fallback: try to get logs list if dashboard endpoint doesn't exist
            const { data } = await axiosInstance.get("/logs");
            setDashboardData({ logs: Array.isArray(data) ? data : [] });
          }
        } else if (activeTitle === "Roles") {
          try {
            const { data } = await axiosInstance.get(
              "/roles/dashboard/overview"
            );
            setDashboardData(data);
          } catch (err) {
            // Fallback: try to get roles list if dashboard endpoint doesn't exist
            const { data } = await axiosInstance.get("/roles");
            setDashboardData({ roles: Array.isArray(data) ? data : [] });
          }
        } else if (activeTitle === "Overview") {
          // General dashboard overview
          try {
            const { data } = await axiosInstance.get("/dashboard/overview");
            // Ensure counts object exists
            if (data && data.counts) {
              setDashboardData(data);
            } else {
              setDashboardData({ counts: {} });
            }
          } catch (err) {
            console.error("Failed to fetch dashboard overview:", err);
            // Set empty counts object so metrics show 0 instead of "No data available"
            setDashboardData({ counts: {} });
          }
        } else if (activeTitle === "Clock In/Out") {
          // Clock In/Out page - fetch clock statistics
          try {
            const { data } = await axiosInstance.get("/clock/statistics");
            setDashboardData({ clockStats: data || {} });
          } catch (err) {
            console.error("Failed to fetch clock statistics:", err);
            setDashboardData({ clockStats: {} });
          }
        } else {
          // For unknown pages, set empty data
          setDashboardData({});
        }
      } catch (err) {
        console.error(`Failed to fetch ${activeTitle} dashboard:`, err);
        // Set empty data on error to prevent loading state
        setDashboardData({});
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeTitle]);

  // -------------------- Logout --------------------
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  // -------------------- Helpers --------------------
  const formatCurrency = (num) =>
    `$${(Number(num) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDuration = (minutes) => {
    if (!minutes) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  // -------------------- Metrics Calculations --------------------
  let totalServices = 0,
    avgPrice = 0,
    avgDuration = 0;

  if (activeTitle === "Services" && dashboardData?.services?.length > 0) {
    const s = dashboardData.services[0];
    totalServices = Number(s.total_services || 0);
    avgPrice = Number(s.avg_price || 0);
    avgDuration = Number(s.avg_duration_minutes || 0);
  }

  return (
    <div className="relative flex h-screen w-full bg-[#e5d4c3]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85)_0%,rgba(229,212,195,1)_55%,rgba(210,186,159,1)_90%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(207,175,144,0)_0%,rgba(159,122,88,0.2)_45%,rgba(114,84,61,0)_80%)] mix-blend-multiply" />

      {/* Premium Sidebar */}
      <aside className="relative z-10 h-full w-[260px] bg-gradient-to-b from-[#d8c0a2] via-[#e4ceba] to-[#f1e1d3] border-r border-white/50 flex flex-col px-5 py-6 shadow-[18px_0_50px_rgba(167,128,92,0.15)] backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-2 rounded-3xl border border-white/35" />
        <div className="relative mb-8">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#3f2f25]/70 font-medium">
            Control Center
          </p>
          <h2 className="text-[2.25rem] leading-tight font-semibold text-[#382b22] mt-1 bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-xs text-[#382b22]/60 mt-1">
            Manage salon workflow
          </p>
        </div>

        <nav className="relative flex flex-col gap-1.5">
          {LINKS.map(({ name, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}
              className={({ isActive }) => {
                // Special handling for Overview link - exact match only
                const isOverviewActive = to === "/dashboard" && (location.pathname === "/dashboard" || location.pathname === "/dashboard/");
                const isActuallyActive = isActive || isOverviewActive;
                
                const base =
                  "flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm transition-all duration-200 relative group";
                if (isActuallyActive)
                  return `${base} bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white shadow-[0_12px_30px_rgba(60,43,33,0.35)] border border-white/50 scale-[1.02]`;
                if (hovered === name)
                  return `${base} bg-white/40 backdrop-blur-sm text-[#3c2b21] scale-[1.01] border border-white/30`;
                return `${base} text-[#3c2b21]/90 hover:bg-white/30 hover:scale-[1.01] hover:border hover:border-white/20`;
              }}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-xl text-xs transition-all duration-200 ${
                  (to === "/dashboard" 
                    ? (location.pathname === "/dashboard" || location.pathname === "/dashboard/")
                    : location.pathname.startsWith(to))
                    ? "bg-white/20 border-white/30"
                    : "bg-white/25 border-white/30 group-hover:bg-white/35"
                } border`}
                aria-hidden
              >
                <Icon size={16} />
              </span>
              <span className="flex-1 font-medium tracking-tight">{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="relative mt-auto pt-4 border-t border-white/35">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/settings')}
            className="w-full flex items-center gap-2.5 mb-4 p-2.5 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 transition-all cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3c2b21] to-[#5f4b5a] border border-white/60 grid place-items-center text-xs font-semibold text-white shadow-sm group-hover:shadow-md transition-all">
              {currentUser?.first_name?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-[#3c2b21] truncate">
                {currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username : 'Loading...'}
              </p>
              <p className="text-[0.6rem] text-[#3c2b21]/65 truncate">
                {currentUser?.email || 'User Settings'}
              </p>
            </div>
          </motion.button>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-gradient-to-r from-[#bf4747] to-[#a93b3b] text-white py-2.5 text-sm font-semibold tracking-tight shadow-[0_10px_25px_rgba(191,71,71,0.35)] hover:from-[#a93b3b] hover:to-[#952f2f] transition-all duration-200 hover:shadow-[0_12px_30px_rgba(191,71,71,0.45)]"
          >
            Logout
          </button>
          <p className="text-[0.58rem] text-[#3c2b21]/45 mt-2 leading-relaxed text-center">
            All actions are logged
          </p>
        </div>
      </aside>

      {/* Main area */}
      <main className="relative z-10 flex-1 px-6 py-6 flex flex-col gap-6 min-w-0 text-left overflow-hidden">
        {/* Top bar - Status and Date only */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <div className="h-10 px-4 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center gap-2 text-xs font-medium text-[#3c2b21] shadow-lg">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            System Healthy
          </div>
          <div className="h-10 px-4 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center text-xs font-medium text-[#3c2b21] shadow-lg">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Metrics row - Hide for Settings page */}
        {activeTitle !== "Settings" && activeTitle !== "Clock In/Out" && (
          <div className="w-full shrink-0">
            <MetricsRow
              activeTitle={activeTitle}
              dashboardData={dashboardData}
              formatCurrency={formatCurrency}
              formatDuration={formatDuration}
              loading={loading}
            />
          </div>
        )}
        {/* Clock In/Out metrics - shown separately on that page */}
        {activeTitle === "Clock In/Out" && (
          <div className="w-full shrink-0">
            <MetricsRow
              activeTitle={activeTitle}
              dashboardData={dashboardData}
              formatCurrency={formatCurrency}
              formatDuration={formatDuration}
              loading={loading}
            />
          </div>
        )}

        {/* Content shell */}
        <div className="flex-1 flex gap-5 overflow-hidden min-h-0">
          {/* Main content area */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <Outlet />
          </div>

          {/* Right rail: upcoming appointments */}
          <div className="w-[280px] shrink-0 bg-gradient-to-br from-white/60 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(60,43,33,0.15)] p-5 flex flex-col gap-4 overflow-hidden">
            <div className="shrink-0">
              <h3 className="text-sm font-semibold text-[#3c2b21] mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c1a38f]" />
                Upcoming Appointments
              </h3>
              <p className="text-xs text-[#6b5c55]">Next scheduled sessions</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#c1a38f]/60 scrollbar-thumb-rounded-full scrollbar-track-transparent hover:scrollbar-thumb-[#a78974]/80">
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingAppointments.map((appt) => {
                    const formattedDate = new Date(
                      appt.appointment_date
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    // Premium status colors
                    let statusConfig = {
                      bg: "bg-gray-100",
                      text: "text-gray-700",
                      border: "border-gray-200",
                    };
                    if (appt.status === "pending") {
                      statusConfig = {
                        bg: "bg-amber-50",
                        text: "text-amber-700",
                        border: "border-amber-200",
                      };
                    } else if (appt.status === "confirmed") {
                      statusConfig = {
                        bg: "bg-emerald-50",
                        text: "text-emerald-700",
                        border: "border-emerald-200",
                      };
                    } else if (appt.status === "completed") {
                      statusConfig = {
                        bg: "bg-blue-50",
                        text: "text-blue-700",
                        border: "border-blue-200",
                      };
                    } else if (appt.status === "cancelled" || appt.status === "declined") {
                      statusConfig = {
                        bg: "bg-rose-50",
                        text: "text-rose-700",
                        border: "border-rose-200",
                      };
                    }

                    return (
                      <li
                        key={appt.appointment_id}
                        className="group relative p-3.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-[#3c2b21] truncate">
                              {formattedDate}
                            </div>
                            <div className="text-xs text-[#6b5c55] font-medium">
                              {appt.start_time}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg text-[0.6rem] font-semibold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border shrink-0`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[#3c2b21] truncate">
                            {appt.client_first_name} {appt.client_last_name}
                          </div>
                          <div className="text-xs text-[#6b5c55] italic truncate">
                            {appt.service_name}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/50 mb-3">
                    <HiOutlineCalendar className="h-8 w-8 text-[#6b5c55]" />
                  </div>
                  <p className="text-sm font-medium text-[#3c2b21] mb-1">
                    No Upcoming Appointments
                  </p>
                  <p className="text-xs text-[#6b5c55]">
                    All clear for now
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating session timer */}
      <SessionTimer />
    </div>
  );
}

/* Metric card */
function MetricCard({ title, value, change, tone }) {
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
