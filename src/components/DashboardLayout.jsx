import { useState } from 'react';

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';
import SessionTimer from './SessionTimer';

export default function DashboardLayout() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();

  const links = [
    { name: "Appointments", to: "/dashboard/appointments" },
    { name: "Services", to: "/dashboard/services" },
    { name: "Clients", to: "/dashboard/clients" },
    { name: "Staff", to: "/dashboard/staff" },
    { name: "History", to: "/dashboard/history" },
    { name: "Logs", to: "/dashboard/logs" },
    { name: "Roles", to: "/dashboard/roles" },
  ];

  const getLinkStyle = (isActive, linkName) => ({
    padding: "10px 15px",
    borderRadius: "12px",
    textDecoration: "none",
    fontFamily: "'CaviarDreams', sans-serif",
    color: isActive ? "#fff" : "#3e2e3d",
    backgroundColor: isActive
      ? "#3e2e3d"
      : hoveredLink === linkName
      ? "rgba(62, 46, 61, 0.1)"
      : "transparent",
    fontWeight: isActive ? 600 : 500,
    boxShadow: isActive
      ? "0 4px 15px rgba(0,0,0,0.15)"
      : "0 2px 5px rgba(0,0,0,0.05)",
    display: "inline-block",
    transform: hoveredLink === linkName ? "scale(1.05)" : "scale(1)",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  });

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(to bottom right, #f6e9da, #f2dfce, #e8d4be)",
      }}
    >
      <aside
        style={{
          width: "220px",
          background: "rgba(217, 207, 198, 0.95)",
          padding: "2rem 1.5rem",
          boxShadow: "2px 0 15px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "0 20px 20px 0",
          backdropFilter: "blur(5px)",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Soligant', serif",
              fontSize: "1.8rem",
              marginBottom: "2rem",
              color: "#3e2e3d",
            }}
          >
            Dashboard
          </h2>
          <nav
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => getLinkStyle(isActive, link.name)}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 15px",
            borderRadius: "12px",
            border: "none",
            fontFamily: "'CaviarDreams', sans-serif",
            backgroundColor: "#c94f4f",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#b34040")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#c94f4f")}
        >
          Logout
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "2.5rem",
          fontFamily: "'CaviarDreams', sans-serif",
          color: "#3e2e3d",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>

      <SessionTimer />
    </div>
  );
}
