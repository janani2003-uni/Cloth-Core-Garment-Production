import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiUser } from "react-icons/fi";
import axios from "axios";
import logo from "../assets/logo-new.png.jpeg";
import authSplitImage from "../assets/hero-gallery-1.jpg.png";
import { setSession } from "../utils/auth";
import { API_BASE_URL } from "../utils/apiConfig";

const LOGIN_API_URL =
  `${API_BASE_URL}/api/auth/login`;

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
    adminCode: "",
  });

  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  const handleChange = (event) => {
    const { name, value, checked, type } =
      event.target;

    setLoginData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = loginData.email
      .trim()
      .toLowerCase();

    const password = loginData.password;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    if (loginAsAdmin && !loginData.adminCode.trim()) {
      alert("Please enter the admin access code.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        LOGIN_API_URL,
        {
          email,
          password,
          ...(loginAsAdmin ? { adminCode: loginData.adminCode.trim() } : {}),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          // Longer than the UI would like, but the backend's own MongoDB
          // reconnect logic (server.js) can take up to 30s to recover from a
          // brief network blip before it gives up and returns an error —
          // 10s here was shorter than that, so a connection that would have
          // succeeded on its own instead surfaced as a scary "backend took
          // too long" popup.
          timeout: 25000,
        }
      );

      if (
        response.data.message ===
        "Login Successful"
      ) {
        const userData = response.data.user;

        setSession(
          userData,
          response.data.token,
          loginData.remember
        );

        // Each role lands on its own dashboard by default. Admin can then
        // switch to any other dashboard via "View As" in the account dropdown
        // — this only sets the initial landing page after login.
        if (userData.role === "admin") {
          navigate("/admin-dashboard");
        } else if (userData.role === "supervisor") {
          navigate("/supervisor-dashboard");
        } else {
          navigate("/dashboard");
        }

        return;
      }

      alert(
        response.data.message || "Login failed"
      );
    } catch (error) {
      console.error("Login Error:", error);

      if (error.code === "ECONNABORTED") {
        alert(
          "The backend took too long to respond."
        );
        return;
      }

      if (!error.response) {
        alert(
          "Cannot connect to the backend. Make sure the backend is running on port 5000."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-split-page">
      <div
        className="auth-split-image"
        style={{
          backgroundImage: `linear-gradient(165deg, rgba(34,16,51,0.5), rgba(82,43,91,0.25) 55%, rgba(34,16,51,0.65)), url(${authSplitImage})`,
        }}
      />

      <div className="auth-split-panel">
        <motion.div
          className="auth-split-panel-inner"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-split-header">
            <button
              type="button"
              className="auth-split-brand border-0 bg-transparent"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="ClothCore logo" />
              <div className="text-start">
                <div className="fw-bold auth-brand-title">ClothCore</div>
                <div className="auth-brand-subtitle">Garment Productions</div>
              </div>
            </button>

            <div className="nav-auth-btn">
              <FiUser className="nav-auth-btn-icon" />
              <button
                type="button"
                className="nav-auth-btn-segment login"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <span className="nav-auth-btn-divider" aria-hidden="true">/</span>
              <button
                type="button"
                className="nav-auth-btn-segment register"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>

          <div>
                <h1 className="text-center fw-bold mb-2 auth-title">
                  Welcome Back
                </h1>

                <p className="text-center mb-4 auth-subtitle">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none fw-semibold auth-link"
                    onClick={() =>
                      navigate("/register")
                    }
                  >
                    Create one here
                  </button>
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label
                      htmlFor="loginEmail"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <div className="auth-input-group">
                      <FiMail className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="loginEmail"
                        type="email"
                        className="form-control form-control-lg auth-input"
                        placeholder="Enter Email Address"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="loginPassword"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>

                    <div className="auth-input-group has-toggle">
                      <FiLock className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg auth-input"
                        placeholder="Enter Password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        className="form-check-input"
                        name="remember"
                        checked={
                          loginData.remember
                        }
                        onChange={handleChange}
                      />

                      <label
                        htmlFor="rememberMe"
                        className="form-check-label"
                      >
                        Remember Me
                      </label>
                    </div>

                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0 auth-link"
                      onClick={() =>
                        navigate(
                          "/forgotpassword"
                        )
                      }
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="mb-3">
                    <button
                      type="button"
                      className="admin-register-link"
                      onClick={() => setLoginAsAdmin((current) => !current)}
                      aria-pressed={loginAsAdmin}
                    >
                      <FiShield aria-hidden="true" />
                      <span>{loginAsAdmin ? "Cancel admin login" : "Login as Admin"}</span>
                    </button>
                  </div>

                  {loginAsAdmin && (
                    <div className="mb-4">
                      <label
                        htmlFor="loginAdminCode"
                        className="form-label fw-semibold"
                      >
                        Admin Access Code
                      </label>

                      <div className="auth-input-group has-toggle">
                        <FiShield className="auth-input-icon" aria-hidden="true" />
                        <input
                          id="loginAdminCode"
                          type={showAdminCode ? "text" : "password"}
                          className="form-control form-control-lg auth-input"
                          placeholder="Enter the admin access code"
                          name="adminCode"
                          value={loginData.adminCode}
                          onChange={handleChange}
                          required={loginAsAdmin}
                        />
                        <button
                          type="button"
                          className="auth-password-toggle"
                          onClick={() => setShowAdminCode((current) => !current)}
                          aria-label={showAdminCode ? "Hide admin code" : "Show admin code"}
                        >
                          {showAdminCode ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      <small className="d-block mt-2" style={{ color: "var(--clothcore-text-muted)" }}>
                        Ask an existing administrator for this code. It's only needed to log in with Admin access.
                      </small>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "SIGNING IN..."
                      : "SIGN IN"}
                  </button>
                </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;