import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiBriefcase, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from "../utils/passwordPolicy";
import SuccessModal from "./modals/SuccessModal";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    shopName: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!PASSWORD_REGEX.test(formData.password)) {
      setPasswordError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    if (submitting) return; // guards against duplicate submits from a double-click

    try {
      setSubmitting(true);

      // Registration success is only ever shown once the backend actually
      // confirms the account was created — this call either resolves (the
      // account exists) or throws (nothing was created), there is no
      // optimistic/fake success state in between.
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          shopName: formData.shopName,
          password: formData.password,
        }
      );

      // The normal flow is Register -> Login (this project never
      // auto-logs a new account in — see Login.js, which is the only place
      // a session/token is ever set), so the success modal's action sends
      // them there rather than assuming a different flow.
      setRegistered(true);
    } catch (err) {
      // Surface the backend's actual, specific message (e.g. "Email
      // already exists", a password-policy message, a missing-field
      // message) whenever one is available, rather than a generic
      // "Something went wrong".
      if (!err.response) {
        setServerError("Cannot connect to the server. Please check your connection and try again.");
      } else {
        setServerError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <p className="fw-bold mb-2 auth-eyebrow">
        GET STARTED
      </p>

      <h1 className="fw-bold auth-title register-heading">
        Create Account
      </h1>

      <p className="mb-4 auth-subtitle">
        Already registered?
        <Link to="/login" className="ms-2 fw-bold text-decoration-none auth-link">
          Sign in here
        </Link>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-4">
            <label className="form-label fw-semibold">First Name</label>

            <div className="auth-input-group">
              <FiUser className="auth-input-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-lg auth-input"
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <label className="form-label fw-semibold">Last Name</label>

            <div className="auth-input-group">
              <FiUser className="auth-input-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-lg auth-input"
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12 mb-4">
            <label className="form-label fw-semibold">Email Address</label>

            <div className="auth-input-group">
              <FiMail className="auth-input-icon" aria-hidden="true" />
              <input
                type="email"
                className="form-control form-control-lg auth-input"
                name="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12 mb-4">
            <label className="form-label fw-semibold">Shop Name</label>

            <div className="auth-input-group">
              <FiBriefcase className="auth-input-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-lg auth-input"
                name="shopName"
                placeholder="Enter Shop Name"
                value={formData.shopName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <label className="form-label fw-semibold">Password</label>

            <div className="auth-input-group has-toggle">
              <FiLock className="auth-input-icon" aria-hidden="true" />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control form-control-lg auth-input"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
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

            <small className="password-requirements">
              <strong>Password Requirements</strong>
              <br />
              ✓ 8–20 characters
              <br />
              ✓ At least 1 uppercase letter
              <br />
              ✓ At least 1 lowercase letter
              <br />
              ✓ At least 1 number
              <br />
              ✓ At least 2 special characters
            </small>
          </div>

          <div className="col-md-6 mb-4">
            <label className="form-label fw-semibold">Confirm Password</label>

            <div className="auth-input-group has-toggle">
              <FiLock className="auth-input-icon" aria-hidden="true" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`form-control form-control-lg auth-input ${
                  passwordError ? "is-invalid" : ""
                }`}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {passwordError && (
              <div className="invalid-feedback d-block">{passwordError}</div>
            )}
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              name="agree"
              id="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />

            <label className="form-check-label" htmlFor="agree">
              I agree to the
              <span className="text-primary fw-bold"> Terms &amp; Conditions </span>
              and
              <span className="text-primary fw-bold"> Privacy Policy</span>
            </label>
          </div>
        </div>

        {serverError && (
          <div className="col-12">
            <div className="auth-banner is-error" role="alert">
              <FiAlertCircle style={{ flexShrink: 0 }} /> {serverError}
            </div>
          </div>
        )}

        <div className="col-12">
          <button type="submit" className="auth-submit-btn auth-submit-lg" disabled={submitting}>
            {submitting ? "CREATING ACCOUNT..." : "CREATE MY ACCOUNT"}
          </button>
        </div>
      </form>

      <SuccessModal
        open={registered}
        onClose={() => navigate("/login")}
        title="Registration Successful!"
        message={"Your ClothCore account has been created successfully.\nYou can now sign in to continue."}
        primaryLabel="Go to Login"
        onPrimary={() => navigate("/login")}
      />
    </>
  );
}

export default RegisterForm;
