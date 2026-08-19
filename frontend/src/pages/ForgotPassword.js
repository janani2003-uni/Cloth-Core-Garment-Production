import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import logo from "../assets/logo-new.png.jpeg";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  // Reached here after ResetPassword.js or VerifyCode.js detected a
  // missing/expired reset session — show a helpful message instead of
  // silently dropping the user back at the start.
  const sessionExpiredMessage = state?.sessionExpired
    ? "Your reset session has expired. Please request a new verification code."
    : "";

  const handleVerify = async () => {
    setError("");
    setInfo("");

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/forgot-password",
        { email: email.trim() }
      );

      setInfo(response.data.message);

      navigate("/verify-code", {
        state: { email: email.trim().toLowerCase() },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light auth-navbar">
        <div className="container">
          <button
            type="button"
            className="navbar-brand d-flex align-items-center border-0 bg-transparent"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="ClothCore logo" className="me-3 auth-navbar-logo" />

            <div className="text-start">
              <div className="fw-bold auth-brand-title">ClothCore</div>
              <div className="auth-brand-subtitle">Garment Productions</div>
            </div>
          </button>

          <div>
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
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
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
                  <p className="fw-bold mb-2 auth-eyebrow">FORGOT PASSWORD</p>

                  <h1 className="fw-bold mb-2 auth-title">Find Your Account</h1>

                  <p className="mb-4 auth-subtitle">
                    Enter the email associated with your ClothCore account.
                    We'll send you a verification code.
                  </p>

                  {sessionExpiredMessage && (
                    <div className="auth-banner is-info" role="alert">
                      <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{sessionExpiredMessage}</span>
                    </div>
                  )}

                  {error && (
                    <div className="auth-banner is-error" role="alert">
                      <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  {info && (
                    <div className="auth-banner is-success" role="status">
                      <FiCheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{info}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="forgotEmail" className="form-label fw-semibold">
                      Registered Email Address
                    </label>

                    <div className="auth-input-group">
                      <FiMail className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="forgotEmail"
                        type="email"
                        className={`form-control form-control-lg auth-input ${error ? "is-invalid" : ""}`}
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <small className="d-block mt-2 auth-subtitle">
                      This should be the email you used when creating your ClothCore
                      account.
                    </small>
                  </div>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleVerify}
                    disabled={loading}
                  >
                    {loading ? "SENDING..." : "SEND RESET CODE"}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="btn btn-link p-0 auth-back-link"
                      onClick={() => navigate("/login")}
                    >
                      <FiArrowLeft /> Back to Sign In
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
