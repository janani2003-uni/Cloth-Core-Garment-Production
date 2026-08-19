import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import logo from "../assets/logo-new.png.jpeg";

const OTP_LENGTH = 6;
const INITIAL_COOLDOWN_SECONDS = 60;

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!domain) return email || "";
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(1, name.length - visible.length))}@${domain}`;
}

function VerifyCode() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(INITIAL_COOLDOWN_SECONDS);
  const otpRefs = useRef([]);

  // Reached directly (refresh, back button after clearing state, bookmark)
  // without ever going through Forgot Password — there's no email to verify
  // against, so send them back to start properly.
  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const focusBox = (index) => {
    otpRefs.current[index]?.focus();
    otpRefs.current[index]?.select();
  };

  const handleDigitChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "").slice(-1);
    setError("");

    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      if (digits[index]) {
        // Clear the current box first (standard OTP UX — one backspace per
        // character, matching how a single text field would behave).
        setDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      } else if (index > 0) {
        focusBox(index - 1);
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
      event.preventDefault();
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setDigits(next);
    setError("");

    const lastFilledIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
    focusBox(Math.max(0, lastFilledIndex));
  };

  const enteredOtp = digits.join("");
  const isComplete = enteredOtp.length === OTP_LENGTH;

  const handleVerify = useCallback(async () => {
    if (!isComplete || verifying) return;

    setError("");
    setInfo("");
    setVerifying(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/verify-reset-otp",
        { email, otp: enteredOtp }
      );

      navigate("/reset-password", {
        state: { email, resetToken: response.data.resetToken },
      });
    } catch (err) {
      setError(err.response?.data?.message || "The verification code is incorrect.");
      setDigits(Array(OTP_LENGTH).fill(""));
      focusBox(0);
    } finally {
      setVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, enteredOtp, isComplete, verifying, navigate]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setError("");
    setInfo("");
    setResending(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/resend-reset-otp",
        { email }
      );
      setInfo(response.data.message || "A new verification code has been sent.");
      setDigits(Array(OTP_LENGTH).fill(""));
      setCooldown(INITIAL_COOLDOWN_SECONDS);
      focusBox(0);
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.retryAfterSeconds) {
        setCooldown(err.response.data.retryAfterSeconds);
      }
      setError(err.response?.data?.message || "Please wait before requesting another code.");
    } finally {
      setResending(false);
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
          <div className="col-lg-6 col-md-8">
            <motion.div
              className="auth-card-wrap"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card auth-card border-0">
                <div className="card-body p-5 text-center">
                  <p className="fw-bold mb-2 auth-eyebrow">STEP 2</p>

                  <h1 className="fw-bold mb-2 auth-title">Verify Your Email</h1>

                  <p className="mb-4 auth-subtitle">
                    Enter the 6-digit code we sent to{" "}
                    <strong>{maskEmail(email)}</strong>. The code expires after
                    10 minutes.
                  </p>

                  {error && (
                    <div className="auth-banner is-error text-start" role="alert">
                      <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  {info && (
                    <div className="auth-banner is-success text-start" role="status">
                      <FiCheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{info}</span>
                    </div>
                  )}

                  <div
                    className="d-flex justify-content-center flex-wrap gap-2 gap-md-3 mb-4"
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        className={`form-control auth-input auth-otp-input ${error ? "is-invalid" : ""}`}
                        onChange={(event) => handleDigitChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        aria-label={`Digit ${index + 1} of 6`}
                        disabled={verifying}
                      />
                    ))}
                  </div>

                  <div className="d-flex justify-content-center align-items-center gap-2 mb-4 auth-subtitle">
                    {cooldown > 0 ? (
                      <span>Resend available in {cooldown}s</span>
                    ) : (
                      <>
                        <span>Didn't get the code?</span>
                        <button
                          type="button"
                          className="btn btn-link p-0 auth-link"
                          onClick={handleResend}
                          disabled={resending}
                        >
                          {resending ? "Sending..." : "Resend Code"}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleVerify}
                    disabled={!isComplete || verifying}
                  >
                    {verifying ? "VERIFYING..." : "VERIFY CODE"}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="btn btn-link p-0 auth-back-link"
                      onClick={() => navigate("/forgotpassword")}
                    >
                      <FiArrowLeft /> Back to Email
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

export default VerifyCode;
