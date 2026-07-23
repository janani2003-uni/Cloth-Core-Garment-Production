import { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import logo from "../assets/logo-new.png.jpeg";

function VerifyCode() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const otpRefs = useRef([]);

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !event.target.value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpChange = (event, index) => {
    if (event.target.value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = document.querySelectorAll("input");

    let enteredOtp = "";

    otp.forEach((item) => {
      enteredOtp += item.value;
    });

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/verify-otp",
        {
          email: state.email,
          otp: enteredOtp,
        }
      );

      alert(response.data.message);

      navigate("/reset-password", {
        state: {
          email: state.email,
          otp: enteredOtp,
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || error.message);
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

                  <h1 className="fw-bold mb-2 auth-title">Enter OTP Code</h1>

                  <p className="mb-4 auth-subtitle">
                    Enter the 6-digit code we sent to your email address.
                  </p>

                  <div className="d-flex justify-content-center flex-wrap gap-2 gap-md-3 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (otpRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        className="form-control auth-input auth-otp-input"
                        onChange={(event) => handleOtpChange(event, index)}
                        onKeyDown={(event) => handleOtpKeyDown(event, index)}
                      />
                    ))}
                  </div>

                  <div className="d-flex justify-content-center align-items-center gap-2 mb-4 auth-subtitle">
                    <span>The code expires after a short time.</span>
                    <button type="button" className="btn btn-link p-0 auth-link">
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={handleVerify}
                  >
                    VERIFY CODE
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
