/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
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
      await axiosInstance.post("/auth/login", {
        identifier: username,
        password,
      });
      dispatch({ type: "RESET_LOCK" });
      navigate("/dashboard/appointments", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
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
    <section className="relative min-h-screen flex items-center justify-center py-32 px-6 text-[#3e2e3d] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply bg-[url('/bg-texture.png')] bg-center bg-cover" />

      <motion.div
        variants={variants.card}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-[#e8dcd4] rounded-3xl shadow-xl p-8 md:p-10 text-center"
      >
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={[
                  "h-2 w-10 rounded-full transition-all",
                  step >= i ? "bg-[#3e2e3d]" : "bg-[#d8c9c9]",
                ].join(" ")}
                aria-hidden="true"
              />
              {i < 2 && <div className="h-1 w-6 rounded-full bg-[#eadfd8]" aria-hidden="true" />}
            </div>
          ))}
        </div>

        <motion.h1 variants={variants.heading} initial="hidden" animate="show" className="text-5xl font-[Soligant] mb-8">
          Welcome Back
        </motion.h1>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        ) : null}

        {lockedUntil && Date.now() < lockedUntil ? (
          <div className="mb-4 text-sm text-[#7e5e54]">
            Too many attempts. Try again in {lockSeconds}s.
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-6 font-[CaviarDreams]" noValidate>
          {step === 1 && (
            <motion.div variants={variants.step} initial="hidden" animate="show" className="space-y-4">
              <label htmlFor="identifier" className="sr-only">
                Username or email
              </label>
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
                className="w-full px-4 py-3 rounded-full border border-[#d8c9c9] bg-white/80 text-[#3e2e3d] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] placeholder:text-[#9c8b92]"
              />

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="w-full px-6 py-3 rounded-full bg-[#3e2e3d] text-white font-semibold transition hover:bg-[#5f4b5a] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Next"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={variants.step} initial="hidden" animate="show" className="space-y-4">
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => dispatch({ type: "SET_FIELD", key: "password", value: e.target.value })}
                  aria-invalid={!!error}
                  className="w-full px-4 py-3 pr-12 rounded-full border border-[#d8c9c9] bg-white/80 text-[#3e2e3d] focus:outline-none focus:ring-2 focus:ring-[#c1a38f] placeholder:text-[#9c8b92]"
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_FIELD", key: "showPassword", value: !showPassword })}
                  className="absolute inset-y-0 right-2 my-auto h-9 px-3 rounded-full text-xs border border-[#d8c9c9] bg-white/70 hover:bg-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || (lockedUntil && Date.now() < lockedUntil)}
                className="w-full px-6 py-3 rounded-full bg-[#3e2e3d] text-white font-semibold transition hover:bg-[#5f4b5a] disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="flex items-center justify-between text-xs text-[#7e5e54]">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "BACK" })}
                  className="underline hover:no-underline"
                >
                  Back
                </button>
                <Link to="/forgot-password" className="underline hover:no-underline">
                  Forgot password
                </Link>
              </div>
            </motion.div>
          )}
        </form>

        {/* Subtle footer text */}
        <div className="mt-8 text-[11px] text-[#9c8b92]">
          Your session uses secure HTTP-only cookies.
        </div>
      </motion.div>
    </section>
  );
}
