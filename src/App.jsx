import './App.css';

import React, { useEffect } from 'react';

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import axiosInstance from '../utils/axiosInstance';
import DashboardLayout from './components/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ClockInOutPage from './pages/ClockInOutPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import LogsPage from './pages/LogsPage';
import OverviewPage from './pages/OverviewPage';
import RolesPage from './pages/RolesPage';
import ServicesPage from './pages/ServicesPage';
import StaffPage from './pages/StaffPage';
import UserSettingsPage from './pages/UserSettingsPage';

function App() {
  useEffect(() => {
    // Refresh session every 5 minutes
    const interval = setInterval(async () => {
      try {
        await axiosInstance.post("/session/extend");
        console.log("Session extended");
      } catch (err) {
        console.error("Session refresh failed:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="clock" element={<ClockInOutPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="settings" element={<UserSettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
