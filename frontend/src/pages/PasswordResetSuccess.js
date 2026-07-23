import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiShield, FiLock, FiCheck } from "react-icons/fi";

function PasswordResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <motion.div
              className="auth-card-wrap"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card auth-card border-0">
                <div className="card-body p-5 text-center">
                  <div className="auth-step-indicator mb-5">
                    <div className="text-center">
                      <div className="auth-step-dot is-complete">
                        <FiMail />
                      </div>
                      <small className="d-block mt-2 auth-subtitle">Email</small>
                    </div>

                    <div className="auth-step-line" />

                    <div className="text-center">
                      <div className="auth-step-dot is-complete">
                        <FiShield />
                      </div>
                      <small className="d-block mt-2 auth-subtitle">Verify</small>
                    </div>

                    <div className="auth-step-line" />

                    <div className="text-center">
                      <div className="auth-step-dot is-complete">
                        <FiLock />
                      </div>
                      <small className="d-block mt-2 auth-subtitle">Reset</small>
                    </div>
                  </div>

                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-4"
                    style={{
                      width: "90px",
                      height: "90px",
                      background: "linear-gradient(135deg, #2ea36b, #57c78f)",
                      boxShadow: "0 12px 30px rgba(46, 163, 107, 0.35)",
                    }}
                  >
                    <FiCheck size={40} color="white" />
                  </div>

                  <h1 className="fw-bold mb-3 auth-title">All Done!</h1>

                  <p className="auth-subtitle mx-auto mb-4" style={{ maxWidth: "420px" }}>
                    Your password has been successfully reset. Sign in to ClothCore
                    with your new credentials and get back to work.
                  </p>

                  <button
                    type="button"
                    className="auth-submit-btn"
                    onClick={() => navigate("/login")}
                  >
                    SIGN IN NOW
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

export default PasswordResetSuccess;
