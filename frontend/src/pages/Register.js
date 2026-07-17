import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import axios from "axios";
import logo from "../assets/logo.png";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    factoryName: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setPasswordError(
        "Password must contain at least 6 characters."
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    }

    if (!formData.agree) {
      alert(
        "Please agree to the Terms and Conditions and Privacy Policy."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          factoryName: formData.factoryName.trim(),
          password: formData.password,
        }
      );

      alert(response.data.message || "Registration successful.");

      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration failed. Please check the backend server."
      );
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

          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  HOME
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  WHO WE ARE
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  OUR PRODUCTS & MATERIALS
                </button>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent"
                  onClick={() => navigate("/")}
                >
                  CONTACT US
                </button>
              </li>
            </ul>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/")}
              >
                Login
              </button>

              <button
                type="button"
                className="btn btn-primary px-4"
                disabled
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10">
            <div
              className="card border-0 shadow-lg"
              style={{
                borderRadius: "20px",
              }}
            >
              <div className="card-body p-4 p-md-5">
                <p
                  className="fw-bold mb-2"
                  style={{
                    color: "#f2a100",
                    letterSpacing: "3px",
                  }}
                >
                  GET STARTED
                </p>

                <h1
                  className="fw-bold mb-3"
                  style={{
                    fontFamily: "serif",
                    letterSpacing: "2px",
                  }}
                >
                  Create Account
                </h1>

                <p className="mb-5 text-secondary">
                  Already registered?
                  <Link
                    to="/"
                    className="ms-2 fw-bold text-decoration-none"
                    style={{ color: "#f2a100" }}
                  >
                    Sign in here
                  </Link>
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* First Name */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="firstName"
                        className="form-label fw-semibold"
                      >
                        First Name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        className="form-control form-control-lg"
                        name="firstName"
                        placeholder="Enter First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="lastName"
                        className="form-label fw-semibold"
                      >
                        Last Name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        className="form-control form-control-lg"
                        name="lastName"
                        placeholder="Enter Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-12 mb-4">
                      <label
                        htmlFor="email"
                        className="form-label fw-semibold"
                      >
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        className="form-control form-control-lg"
                        name="email"
                        placeholder="Enter Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>

                    {/* Factory Name */}
                    <div className="col-12 mb-4">
                      <label
                        htmlFor="factoryName"
                        className="form-label fw-semibold"
                      >
                        Factory Name
                      </label>

                      <input
                        id="factoryName"
                        type="text"
                        className="form-control form-control-lg"
                        name="factoryName"
                        placeholder="Enter Factory Name"
                        value={formData.factoryName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="registerPassword"
                        className="form-label fw-semibold"
                      >
                        Password
                      </label>

                      <div className="position-relative">
                        <input
                          id="registerPassword"
                          type={
                            showPassword ? "text" : "password"
                          }
                          className="form-control form-control-lg"
                          name="password"
                          placeholder="Enter Password"
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                          minLength={6}
                          style={{ paddingRight: "55px" }}
                        />

                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-1"
                          onClick={() =>
                            setShowPassword(
                              (previousValue) =>
                                !previousValue
                            )
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          title={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeSlash size={22} />
                          ) : (
                            <Eye size={22} />
                          )}
                        </button>
                      </div>

                      <small className="text-secondary">
                        Use at least 6 characters.
                      </small>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6 mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="form-label fw-semibold"
                      >
                        Confirm Password
                      </label>

                      <div className="position-relative">
                        <input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          className={`form-control form-control-lg ${
                            passwordError ? "is-invalid" : ""
                          }`}
                          name="confirmPassword"
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                          minLength={6}
                          style={{ paddingRight: "55px" }}
                        />

                        <button
                          type="button"
                          className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-1"
                          onClick={() =>
                            setShowConfirmPassword(
                              (previousValue) =>
                                !previousValue
                            )
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          title={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeSlash size={22} />
                          ) : (
                            <Eye size={22} />
                          )}
                        </button>
                      </div>

                      {passwordError && (
                        <div className="text-danger mt-2">
                          {passwordError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        id="agree"
                        className="form-check-input"
                        type="checkbox"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                        required
                      />

                      <label
                        htmlFor="agree"
                        className="form-check-label"
                      >
                        I agree to the{" "}
                        <span className="text-primary fw-bold">
                          Terms &amp; Conditions
                        </span>{" "}
                        and{" "}
                        <span className="text-primary fw-bold">
                          Privacy Policy
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold"
                    style={{
                      borderRadius: "10px",
                      fontSize: "18px",
                    }}
                    disabled={loading}
                  >
                    {loading
                      ? "CREATING ACCOUNT..."
                      : "CREATE MY ACCOUNT"}
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

export default Register;