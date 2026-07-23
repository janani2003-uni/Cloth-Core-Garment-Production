import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import logo from "../assets/logo-new.png.jpeg";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/forgot-password",
        {
          email,
        }
      );

      alert(response.data.message);

      navigate("/verify-code", {
        state: { email },
      });
    } catch (error) {
      console.log(error);
      console.log(error.response);

      alert(error.response?.data?.message || error.message);
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
                    Enter your registered email and we'll send you a verification
                    code to reset your password.
                  </p>

                  <div className="mb-4">
                    <label htmlFor="forgotEmail" className="form-label fw-semibold">
                      Registered Email Address
                    </label>

                    <div className="auth-input-group">
                      <FiMail className="auth-input-icon" aria-hidden="true" />
                      <input
                        id="forgotEmail"
                        type="email"
                        className="form-control form-control-lg auth-input"
                        placeholder="Enter Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
