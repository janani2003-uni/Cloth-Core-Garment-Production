import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import axios from "axios";
import logo from "../assets/logo-new.png.jpeg";
import { setSession } from "../utils/auth";

const LOGIN_API_URL =
  "http://localhost:5000/api/auth/login";

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
          timeout: 10000,
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
    <div className="auth-page min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light auth-navbar">
        <div className="container">
          <button
            type="button"
            className="navbar-brand d-flex align-items-center border-0 bg-transparent"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="ClothCore logo"
              className="me-3 auth-navbar-logo"
            />

            <div className="text-start">
              <div className="fw-bold auth-brand-title">
                ClothCore
              </div>

              <div className="auth-brand-subtitle">
                Garment Productions
              </div>
            </div>
          </button>

          <button
            type="button"
            className="navbar-toggler"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/")}
                >
                  Who We Are
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/")}
                >
                  Our Products & Materials
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={() => navigate("/")}
                >
                  Contact Us
                </button>
              </li>
            </ul>

            <button
              type="button"
              className="explore-btn me-2"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              type="button"
              className="login-register-btn"
              onClick={() =>
                navigate("/register")
              }
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div
          className="row justify-content-center align-items-center"
          style={{ minHeight: "85vh" }}
        >
          <div className="col-lg-5 col-md-7">
            <motion.div
              className="auth-card-wrap"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="card auth-card border-0">
              <div className="card-body p-5">
                <h1 className="text-center fw-bold mb-2 auth-title">
                  Sign In
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
            </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;