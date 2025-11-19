/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Lock, User, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const variants = {
  card: { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } },
  heading: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 0.08 } } },
  step: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } },
};

const initial = {
  step: 1,
  username: "",
  password: "",
  showPassword: false,
  loading: false,
  error: "",
  failedCount: 0,
  lockedUntil: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "NEXT_STEP":
      return { ...state, step: 2, error: "" };
    case "BACK":
      return { ...state, step: 1, password: "", error: "" };
    case "FAIL_LOGIN": {
      const failedCount = state.failedCount + 1;
      // simple backoff: lock 10s after 3 failed attempts
      const lockedUntil = failedCount >= 3 ? Date.now() + 10000 : state.lockedUntil;
      return { ...state, failedCount, lockedUntil };
    }
    case "RESET_LOCK":
      return { ...state, failedCount: 0, lockedUntil: 0 };
    default:
      return state;
  }
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function HomePage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initial);
  const { step, username, password, showPassword, loading, error, failedCount, lockedUntil } = state;

  // Persist identifier for convenience
  useEffect(() => {
    const cached = sessionStorage.getItem("lastIdentifier");
    if (cached) dispatch({ type: "SET_FIELD", key: "username", value: cached });
  }, []);
  useEffect(() => {
    if (username) sessionStorage.setItem("lastIdentifier", username);
  }, [username]);

  // Lockout countdown ticker
  const [, force] = React.useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        dispatch({ type: "RESET_LOCK" });
        clearInterval(id);
      }
      force();
    }, 300);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Stale request guard for username verification
  const reqCounterRef = useRef(0);

  // -------------------- VERIFY USERNAME --------------------
  const handleNext = async () => {
    if (!username.trim()) {
      dispatch({ type: "SET_ERROR", value: "Enter your username or email" });
      return;
    }
    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SET_LOADING", value: true });

    const currentReq = ++reqCounterRef.current;
    try {
      await axiosInstance.post("/auth/check-username", { username });
      // Ignore stale responses
      if (currentReq !== reqCounterRef.current) return;
      dispatch({ type: "NEXT_STEP" });
    } catch (err) {
      const msg = err?.response?.data?.message || "User not found";
      dispatch({ type: "SET_ERROR", value: msg });
    } finally {
      if (currentReq === reqCounterRef.current) {
        dispatch({ type: "SET_LOADING", value: false });
      }
    }
  };

  // -------------------- LOGIN --------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      dispatch({ type: "SET_ERROR", value: "Enter your password" });
      return;
    }
    if (lockedUntil && Date.now() < lockedUntil) return;

    dispatch({ type: "SET_ERROR", value: "" });
    dispatch({ type: "SET_LOADING", value: true });

    try {
      console.log("Attempting login with:", { identifier: username, passwordProvided: !!password });
      const response = await axiosInstance.post("/auth/login", {
        identifier: username,
        password,
      });
      
      console.log("Login response:", response.data);
      
      if (response.data?.message === "Login successful") {
        console.log("Login successful, navigating to dashboard...");
        dispatch({ type: "RESET_LOCK" });
        // Small delay to ensure cookie is set before navigation
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate("/dashboard", { replace: true });
      } else {
        console.error("Login response invalid:", response.data);
        throw new Error("Login response invalid");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      dispatch({ type: "SET_ERROR", value: msg });
      dispatch({ type: "FAIL_LOGIN" });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };

  // Keyboard flow: Enter on step 1 advances
  const handleUsernameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) handleNext();
    }
  };

  const lockSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 px-6 text-[#3e2e3d] overflow-hidden">
      {/* Premium Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e5d4c3] via-[#f1e1d3] to-[#d8c0a2]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85)_0%,rgba(229,212,195,1)_55%,rgba(210,186,159,1)_90%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(207,175,144,0)_0%,rgba(159,122,88,0.2)_45%,rgba(114,84,61,0)_80%)] mix-blend-multiply" />
      
      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-[#c1a38f]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#a78974]/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#8d6f5a]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <motion.div
        variants={variants.card}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-lg bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-[0_20px_60px_rgba(60,43,33,0.25)] p-10 md:p-12 text-center overflow-hidden"
      >
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21]" />
        
        {/* Sparkle decorations */}
        <div className="absolute top-6 right-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-[#c1a38f]/40" />
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-6">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="h-5 w-5 text-[#a78974]/40" />
          </motion.div>
        </div>

        {/* Premium Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-7xl font-[Soligant] mb-3 bg-gradient-to-r from-[#3c2b21] via-[#5f4b5a] to-[#3c2b21] bg-clip-text text-transparent">
              Duré Aesthetics
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#c1a38f] to-transparent" />
              <p className="text-sm font-medium text-[#6b5c55] tracking-wider uppercase">
                Staff Panel
              </p>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#c1a38f] to-transparent" />
            </div>
          </motion.div>

          {/* Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: step >= i ? 1 : 0.8 }}
                  className={[
                    "h-2.5 w-12 rounded-full transition-all duration-300 relative overflow-hidden",
                    step >= i ? "bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a]" : "bg-[#d8c9c9]",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {step >= i && (
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  )}
                </motion.div>
                {i < 2 && (
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-[#eadfd8] to-[#d8c9c9]" aria-hidden="true" />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              role="alert"
              className="mb-6 rounded-2xl border border-rose-300/50 bg-gradient-to-br from-rose-50/80 to-rose-100/60 backdrop-blur-sm px-5 py-4 text-sm text-rose-700 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-rose-200 flex items-center justify-center shrink-0">
                  <span className="text-rose-600 text-xs">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lockedUntil && Date.now() < lockedUntil && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-50/80 to-amber-100/60 backdrop-blur-sm px-5 py-4 text-sm text-amber-800 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600 shrink-0" />
                <span className="font-medium">
                  Too many attempts. Try again in <span className="font-bold">{lockSeconds}s</span>.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6" noValidate>
          {step === 1 && (
            <motion.div variants={variants.step} initial="hidden" animate="show" className="space-y-5">
              <div className="relative">
                <label htmlFor="identifier" className="sr-only">
                  Username or email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="h-5 w-5 text-[#6b5c55]" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    inputMode="email"
                    autoComplete="username email"
                    placeholder="Username or email"
                    value={username}
                    onChange={(e) => dispatch({ type: "SET_FIELD", key: "username", value: e.target.value })}
                    onKeyDown={handleUsernameKeyDown}
                    aria-invalid={!!error}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl text-[#3c2b21] focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] placeholder:text-[#9b8a83] shadow-lg transition-all duration-200 hover:bg-white/80"
                  />
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleNext}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white font-semibold shadow-[0_10px_25px_rgba(60,43,33,0.35)] hover:shadow-[0_12px_30px_rgba(60,43,33,0.45)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={variants.step} initial="hidden" animate="show" className="space-y-5">
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="h-5 w-5 text-[#6b5c55]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => dispatch({ type: "SET_FIELD", key: "password", value: e.target.value })}
                    aria-invalid={!!error}
                    className="w-full pl-12 pr-14 py-4 rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl text-[#3c2b21] focus:outline-none focus:ring-2 focus:ring-[#c1a38f]/50 focus:border-[#c1a38f] placeholder:text-[#9b8a83] shadow-lg transition-all duration-200 hover:bg-white/80"
                  />
                  <motion.button
                    type="button"
                    onClick={() => dispatch({ type: "SET_FIELD", key: "showPassword", value: !showPassword })}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-y-0 right-2 my-auto h-10 w-10 rounded-xl flex items-center justify-center text-[#6b5c55] bg-white/60 hover:bg-white/80 border border-white/50 transition-all duration-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || (lockedUntil && Date.now() < lockedUntil)}
                whileHover={{ scale: loading || (lockedUntil && Date.now() < lockedUntil) ? 1 : 1.02 }}
                whileTap={{ scale: loading || (lockedUntil && Date.now() < lockedUntil) ? 1 : 0.98 }}
                className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-[#3c2b21] to-[#5f4b5a] text-white font-semibold shadow-[0_10px_25px_rgba(60,43,33,0.35)] hover:shadow-[0_12px_30px_rgba(60,43,33,0.45)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Access Dashboard</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-between text-xs pt-2">
                <motion.button
                  type="button"
                  onClick={() => dispatch({ type: "BACK" })}
                  whileHover={{ x: -2 }}
                  className="text-[#6b5c55] hover:text-[#3c2b21] font-medium transition-colors flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" />
                  Back
                </motion.button>
                <Link
                  to="/forgot-password"
                  className="text-[#6b5c55] hover:text-[#3c2b21] font-medium transition-colors underline decoration-[#c1a38f]/50 hover:decoration-[#c1a38f]"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>
          )}
        </form>

        {/* Premium Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-white/30"
        >
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#6b5c55]">
            <Shield className="h-3 w-3" />
            <span>Secure session with HTTP-only cookies</span>
          </div>
          <div className="mt-2 text-[10px] text-[#9b8a83]">
            © {new Date().getFullYear()} Duré Aesthetics. All rights reserved.
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
