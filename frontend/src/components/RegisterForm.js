import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiBriefcase, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";

const passwordRegex =
  /^(?=(.*[!@#$%^&*(),.?":{}|<>]){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    factoryName: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!passwordRegex.test(formData.password)) {
      setPasswordError(
        "Password must be 8–20 characters and include at least 2 special characters, 1 uppercase letter, 1 lowercase letter and 1 number."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          factoryName: formData.factoryName,
          password: formData.password,
        }
      );

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
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
            <label className="form-label fw-semibold">Factory Name</label>

            <div className="auth-input-group">
              <FiBriefcase className="auth-input-icon" aria-hidden="true" />
              <input
                type="text"
                className="form-control form-control-lg auth-input"
                name="factoryName"
                placeholder="Enter Factory Name"
                value={formData.factoryName}
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

        <div className="col-12">
          <button type="submit" className="auth-submit-btn auth-submit-lg">
            CREATE MY ACCOUNT
          </button>
        </div>
      </form>
    </>
  );
}

export default RegisterForm;
