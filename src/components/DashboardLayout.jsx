import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import SessionTimer from "./SessionTimer";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
} from "react-icons/hi";

const LINKS = [
  { name: "Appointments", to: "/dashboard/appointments", icon: HiOutlineCalendar },
  { name: "Services", to: "/dashboard/services", icon: HiOutlineClipboardList },
  { name: "Clients", to: "/dashboard/clients", icon: HiOutlineUserGroup },
  { name: "Staff", to: "/dashboard/staff", icon: HiOutlineUsers },
  { name: "History", to: "/dashboard/history", icon: HiOutlineClock },
  { name: "Logs", to: "/dashboard/logs", icon: HiOutlineDocumentText },
  { name: "Roles", to: "/dashboard/roles", icon: HiOutlineShieldCheck },
];

export default function DashboardLayout() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  const activeTitle =
    LINKS.find((link) => location.pathname.startsWith(link.to))?.name ||
    "Overview";

  return (
    <div className="relative flex h-screen w-full bg-[#e5d4c3]">
      {/* background treatment */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85)_0%,_rgba(229,212,195,1)_55%,_rgba(210,186,159,1)_90%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(207,175,144,0)_0%,rgba(159,122,88,0.2)_45%,rgba(114,84,61,0)_80%)] mix-blend-multiply" />

      {/* Sidebar */}
      <aside
        className="
          relative z-10 h-full w-[250px]
          bg-gradient-to-b from-[#d8c0a2] via-[#e4ceba] to-[#f1e1d3]
          border-r border-white/50
          flex flex-col
          px-5 py-6
          shadow-[18px_0_50px_rgba(167,128,92,0.15)]
        "
      >
        {/* inner border */}
        <div className="pointer-events-none absolute inset-2 rounded-3xl border border-white/35" />

        {/* Brand */}
        <div className="relative mb-8">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#3f2f25]/70">
            Control Center
          </p>
          <h2 className="text-[2.25rem] leading-tight font-semibold text-[#382b22] mt-1">
            Dashboard
          </h2>
          <p className="text-xs text-[#382b22]/60 mt-1">
            Manage salon workflow
          </p>
        </div>

        {/* Navigation */}
        <nav className="relative flex flex-col gap-1">
          {LINKS.map(({ name, to, icon: Icon }) => {
            return (
              <NavLink
                key={to}
                to={to}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                className={({ isActive }) => {
                  const base =
                    "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-150 relative";
                  if (isActive) {
                    return [
                      base,
                      "bg-[#3c2b21] text-white shadow-[0_12px_30px_rgba(60,43,33,0.35)] border border-white/50 scale-[1.01]",
                    ].join(" ");
                  }
                  if (hovered === name) {
                    return [
                      base,
                      "bg-white/30 text-[#3c2b21] scale-[1.01]",
                    ].join(" ");
                  }
                  return [
                    base,
                    "text-[#3c2b21]/90 hover:bg-white/25 hover:scale-[1.01]",
                  ].join(" ");
                }}
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-xl bg-white/25 border border-white/30 text-xs"
                  aria-hidden
                >
                  <Icon size={16} />
                </span>
                <span className="flex-1 font-medium tracking-tight">
                  {name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#3c2b21]/0 group-hover:bg-[#3c2b21]/80 transition-colors" />
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="relative mt-auto pt-4 border-t border-white/35">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-white/60 border border-white/60 grid place-items-center text-xs font-semibold text-[#3c2b21]">
              S
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3c2b21]">
                Secure session
              </p>
              <p className="text-[0.6rem] text-[#3c2b21]/65">
                Your admin token is valid
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-[#bf4747] text-white py-2.5 text-sm font-semibold tracking-tight shadow-[0_10px_25px_rgba(191,71,71,0.35)] hover:bg-[#a93b3b] transition"
          >
            Logout
          </button>
          <p className="text-[0.58rem] text-[#3c2b21]/45 mt-2 leading-relaxed">
            All actions are logged in the Audit Log.
          </p>
        </div>
      </aside>

      {/* Main area */}
      <main className="relative z-10 flex-1 px-9 py-6 flex flex-col gap-5 min-w-0 text-left">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-[#3a2b22]/70">
              Salon operations
            </p>
            <h1 className="text-[1.55rem] font-semibold tracking-tight text-[#372a21]">
              {activeTitle}
            </h1>
            
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/50 border border-white/40 px-3 py-1.5 text-[0.65rem] text-[#3c2b21]/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              Status healthy
            </div>
            <div className="h-10 w-[140px] rounded-full bg-white/40 border border-white/45 flex items-center justify-center text-[0.65rem] text-[#3c2b21]">
              {new Date().toLocaleDateString("en-CA", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* metrics row */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="Today’s appointments" value="18" change="+4 vs yesterday" />
          <MetricCard title="Active clients" value="126" change="12 repeat" />
          <MetricCard title="Staff online" value="5/7" change="Shift A running" />
          <MetricCard title="Pending approvals" value="3" change="Needs attention" tone="warn" />
        </div>

        {/* content shell */}
        <div
          className="
            flex-1
            bg-[rgba(255,255,255,0.55)]
            rounded-3xl
            border border-white/65
            shadow-[0_18px_50px_rgba(201,168,140,0.28)]
            flex
            gap-5
            overflow-hidden
            min-h-[calc(100vh-15rem)]
          "
        >
          {/* main outlet zone */}
          <div className="flex-1 min-w-0 p-6 overflow-y-auto">
            <div className="mb-3">
              <p className="text-[0.55rem] uppercase tracking-[0.35em] text-[#3c2b21]/60">
                Active module
              </p>
              <h2 className="text-[1.05rem] font-semibold text-[#3c2b21]">
                {activeTitle}
              </h2>
              <p className="text-[0.65rem] text-[#3c2b21]/50">
                Data below is pulled from your backend. Routes are already wired.
              </p>
            </div>
            <div className="rounded-2xl bg-white/40 border border-white/35 p-3 min-h-[350px]">
              <Outlet />
            </div>
          </div>

          {/* right rail */}
          <div className="w-[270px] bg-white/25 border-l border-white/35 p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-semibold text-[#3c2b21] mb-2">
                Quick actions
              </h3>
              <div className="flex flex-col gap-2">
                <button className="rounded-xl bg-white/70 border border-white/80 text-[#3c2b21] text-[0.65rem] py-2 px-3 text-left hover:bg-white">
                  Create appointment
                </button>
                <button className="rounded-xl bg-white/30 border border-white/40 text-[#3c2b21] text-[0.65rem] py-2 px-3 text-left hover:bg-white/60">
                  Add new client
                </button>
                <button className="rounded-xl bg-white/30 border border-white/40 text-[#3c2b21] text-[0.65rem] py-2 px-3 text-left hover:bg-white/60">
                  Assign staff
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#3c2b21] mb-2">
                Session
              </h3>
              <p className="text-[0.6rem] text-[#3c2b21]/65">
                Session timer is running. You can surface it from top right.
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#3c2b21] mb-2">
                System notes
              </h3>
              <ul className="space-y-2 text-[0.58rem] text-[#3c2b21]/70">
                <li>• Logs are persisted.</li>
                <li>• Staff module reads RBAC from backend.</li>
                <li>• Make sure dates are UTC normalized.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* floating session timer */}
      <SessionTimer />
    </div>
  );
}

/* small internal component */
function MetricCard({ title, value, change, tone }) {
  const isWarn = tone === "warn";
  return (
    <div
      className={[
        "rounded-2xl border bg-white/50 px-4 py-3",
        isWarn ? "border-[#b65d4a]/40" : "border-white/65",
        "shadow-[0_22px_42px_rgba(214,180,150,0.18)]",
      ].join(" ")}
    >
      <p className="text-[0.55rem] uppercase tracking-[0.35em] text-[#3c2b21]/60 mb-1">
        {title}
      </p>
      <p className="text-[1.55rem] font-semibold text-[#3c2b21] leading-none mb-1">
        {value}
      </p>
      <p
        className={[
          "text-[0.58rem]",
          isWarn ? "text-[#9b3b27]" : "text-[#3c2b21]/55",
        ].join(" ")}
      >
        {change}
      </p>
    </div>
  );
}
