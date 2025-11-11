import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ✅ crucial for sending/receiving session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------- RESPONSE INTERCEPTOR --------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, session likely expired
    if (error.response?.status === 401) {
      console.warn("Unauthorized — session expired or not logged in");

      // Prevent infinite reload loops or lost context
      if (!window.location.pathname.includes("/login")) {
        sessionStorage.setItem("sessionExpired", "true");
        window.location.replace("/");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
