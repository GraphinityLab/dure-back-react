/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';

const HomePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------- VERIFY USERNAME --------------------
  const handleNext = async () => {
    if (!username.trim()) {
      setError("Please enter your username or email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Only checks if the user exists; DOES NOT create session
      await axiosInstance.post("/auth/check-username", { username });

      setStep(2);
    } catch (err) {
      console.error("User check failed:", err);
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- LOGIN --------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      // This is the only call that creates session / sets sid cookie
      await axiosInstance.post("/auth/login", {
        identifier: username,
        password,
      });

      setError("");
      navigate("/dashboard/appointments", { replace: true });
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-32 px-6 text-[#3e2e3d] min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply bg-[url('/bg-texture.png')] bg-center bg-cover" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-lg border border-[#e8dcd4] rounded-3xl shadow-lg p-10 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-[Soligant] mb-10"
        >
          Welcome Back
        </motion.h1>

        <form onSubmit={handleLogin} className="space-y-6 font-[CaviarDreams]">
          {step === 1 && (
            <motion.div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-[#d8c9c9] bg-white/70 text-[#3e2e3d] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] placeholder:text-[#9c8b92]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="w-full px-6 py-3 rounded-full bg-[#3e2e3d] text-white font-semibold hover:bg-[#5f4b5a] transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Next"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div className="space-y-4">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-[#d8c9c9] bg-white/70 text-[#3e2e3d] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] placeholder:text-[#9c8b92]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full bg-[#3e2e3d] text-white font-semibold hover:bg-[#5f4b5a] transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword("");
                  setError("");
                }}
                className="w-full text-sm text-[#7e5e54] hover:underline mt-2"
              >
                Back
              </button>
            </motion.div>
          )}
        </form>
      </motion.div>
    </section>
  );
};

export default HomePage;
