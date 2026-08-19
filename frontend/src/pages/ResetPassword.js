import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import logo from "../assets/logo-new.png.jpeg";
import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_MESSAGE,
  PASSWORD_REQUIREMENTS_LIST,
} from "../utils/passwordPolicy";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const resetToken = state?.resetToken;

  // The Reset Password step can never be reached with only an email — a
  // verified reset token (issued by /verify-reset-otp) is required. If it's
  // missing here (direct navigation, refresh after the in-memory router
  // state was lost, expired flow), send the user back to start rather than
  // rendering a form the backend will reject anyway.
  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/forgotpassword", { replace: true, state: { sessionExpired: true } });
    }
  }, [email, resetToken, navigate]);

  if (!email || !resetToken) {
    return null;
  }

  const handleUpdate = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post("http://127.0.0.1:5000/api/auth/reset-password", {
        email,
        resetToken,
        newPassword: password,
        confirmPassword: confirm,
      });

      navigate("/password-reset-success");
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";

      // The backend rejects an invalid/expired token the same way — treat
      // it as the session ending and route back to the start with context.
      if (err.response?.status === 400 && /reset session/i.test(message)) {
        navigate("/forgotpassword", { replace: true, state: { sessionExpired: true } });
        return;
      }

      setError(message);
    } finally {
      setSubmitting(false);
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
                  <p className="fw-bold mb-2 auth-eyebrow">STEP 3</p>

                  <h1 className="fw-bold mb-2 auth-title">Create New Password</h1>

                  <p className="mb-4 auth-subtitle">
                    Choose a new password for your ClothCore account.
                  </p>

                  {error && (
                    <div className="auth-banner is-error" role="alert">
                      <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label fw-semibold">
                      New Password
                    </label>

                    <div className="auth-input-group has-toggle">
                      <FiLock className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        className="form-control form-control-lg auth-input"
                        placeholder="Enter New Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
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
                      {PASSWORD_REQUIREMENTS_LIST.map((rule) => (
                        <span key={rule}>
                          ✓ {rule}
                          <br />
                        </span>
                      ))}
                    </small>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmNewPassword" className="form-label fw-semibold">
                      Confirm Password
                    </label>

                    <div className="auth-input-group has-toggle">
                      <FiLock className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="confirmNewPassword"
                        type={showConfirm ? "text" : "password"}
                        className="form-control form-control-lg auth-input"
                        placeholder="Confirm New Password"
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setError("");
                        }}
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowConfirm((current) => !current)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleUpdate}
                    disabled={submitting}
                  >
                    {submitting ? "UPDATING..." : "UPDATE PASSWORD"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
