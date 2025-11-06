// src/components/SessionTimer.jsx
import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';

export default function SessionTimer() {
  const navigate = useNavigate();

  useEffect(() => {
    let interval;

    const checkAndExtendSession = async () => {
      try {
        // Check session status
        await axiosInstance.get("/session/status"); // backend returns 401 if no session

        // Extend session every 5 minutes
        await axiosInstance.post("/session/extend");
        console.log("Session extended");
      } catch (err) {
        console.warn("Session invalid or expired:", err);
        // Redirect to login if session expired or cookie missing
        navigate("/", { replace: true });
      }
    };

    // Initial check immediately
    checkAndExtendSession();

    // Then repeat every 5 minutes
    interval = setInterval(checkAndExtendSession, 5 * 60 * 1000);

    return () => clearInterval(interval); // cleanup
  }, [navigate]);

  return null; // No UI
}
