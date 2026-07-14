import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const LOGIN_API_URL =
  "http://localhost:5000/api/auth/login";

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);

      const response = await axios.post(
        LOGIN_API_URL,
        {
          email,
          password,
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

        if (loginData.remember) {
          localStorage.setItem(
            "user",
            JSON.stringify(userData)
          );
        } else {
          sessionStorage.setItem(
            "user",
            JSON.stringify(userData)
          );
        }

        if (userData?.role === "Admin") {
          navigate("/admin-dashboard");
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
    <div className="bg-light min-vh-100">
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
              width="50"
              height="50"
              className="me-3"
            />

            <div className="text-start">
              <div
                className="fw-bold"
                style={{
                  fontSize: "30px",
                  color: "#0b3aa0",
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

            <div>
              <button
                type="button"
                className="btn btn-outline-primary me-2 px-4"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={() =>
                  navigate("/register")
                }
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

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
              <div className="card-body p-5">
                <h1 className="text-center fw-bold mb-2">
                  Sign In
                </h1>

                <p className="text-center text-secondary mb-4">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none fw-semibold"
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

                  <div className="mb-3">
                    <label
                      htmlFor="loginPassword"
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>

                    <input
                      id="loginPassword"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter Password"
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
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
                      className="btn btn-link text-decoration-none p-0"
                      onClick={() =>
                        navigate(
                          "/forgotpassword"
                        )
                      }
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                    disabled={loading}
                  >
                    {loading
                      ? "SIGNING IN..."
                      : "SIGN IN"}
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