import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import logo from "../assets/logo.png";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email.trim() || !loginData.password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }
      );

      console.log("Login response:", response.data);

      const { token, user, message } = response.data;

      if (!user && !token) {
        alert(message || "Login failed.");
        return;
      }

      if (loginData.remember) {
        localStorage.setItem("user", JSON.stringify(user));

        if (token) {
          localStorage.setItem("token", token);
        }
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));

        if (token) {
          sessionStorage.setItem("token", token);
        }
      }

      alert(message || "Login successful.");

      const role = user?.role?.toLowerCase();

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Full login error:", error);
      console.error("Backend response:", error.response?.data);

      if (error.response) {
        alert(
          error.response.data?.message ||
            error.response.data?.error ||
            `Login failed with status ${error.response.status}.`
        );
      } else if (error.request) {
        alert(
          "Cannot connect to the backend. Make sure the backend is running on port 5000."
        );
      } else {
        alert(error.message || "Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <button
            type="button"
            className="navbar-brand d-flex align-items-center border-0 bg-transparent"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="ClothCore logo"
              width="55"
              height="55"
              className="me-3"
              style={{ objectFit: "contain" }}
            />

            <div className="text-start">
              <div
                className="fw-bold"
                style={{
                  fontSize: "30px",
                  color: "#0b3aa0",
                  lineHeight: "1",
                }}
              >
                ClothCore
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  lineHeight: "1.2",
                }}
              >
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
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  Who We Are
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  Our Products &amp; Materials
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  Contact Us
                </button>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary px-4"
                disabled
              >
                Login
              </button>

              <button
                type="button"
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Card */}
      <div className="container">
        <div
          className="row justify-content-center align-items-center"
          style={{ minHeight: "85vh" }}
        >
          <div className="col-lg-5 col-md-7">
            <div
              className="card border-0 shadow-lg"
              style={{ borderRadius: "25px" }}
            >
              <div className="card-body p-4 p-md-5">
                <h1 className="text-center fw-bold mb-2">
                  Sign In
                </h1>

                <p className="text-center text-secondary mb-4">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link text-primary fw-semibold text-decoration-none p-0"
                    onClick={() => navigate("/register")}
                  >
                    Create one here
                  </button>
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-3">
                    <label
                      htmlFor="loginEmail"
                      className="form-label fw-semibold"
                    >
                      Email Address
                    </label>

                    <input
                      id="loginEmail"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter Email Address"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label
                      htmlFor="loginPassword"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>

                    <div className="position-relative">
                      <input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        placeholder="Enter Password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        style={{ paddingRight: "55px" }}
                      />

                      <button
                        type="button"
                        className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-1"
                        onClick={() =>
                          setShowPassword((previousValue) => !previousValue)
                        }
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        title={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeSlash size={22} />
                        ) : (
                          <Eye size={22} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        id="remember"
                        type="checkbox"
                        className="form-check-input"
                        name="remember"
                        checked={loginData.remember}
                        onChange={handleChange}
                      />

                      <label
                        htmlFor="remember"
                        className="form-check-label"
                      >
                        Remember Me
                      </label>
                    </div>

                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0"
                      onClick={() => navigate("/forgotpassword")}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                    disabled={loading}
                  >
                    {loading ? "SIGNING IN..." : "SIGN IN"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;