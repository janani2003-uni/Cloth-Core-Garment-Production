import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleUpdate = () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    navigate("/password-reset-success");
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}

      <nav className="navbar navbar-light bg-white border-bottom">

        <div className="container">

          <img
            src={logo}
            alt="logo"
            width="60"
          />

          <div>

            <button
              className="btn btn-primary me-3 px-4"
              onClick={() => navigate("/")}
            >
              Login
            </button>

            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/register")}
            >
              Register
            </button>

          </div>

        </div>

      </nav>

      <div className="container py-5">

        <p
          className="text-primary mb-2"
          style={{ letterSpacing: "2px" }}
        >
          Step 3
        </p>

        <h1
          className="mb-2"
          style={{
            fontWeight: "500",
            letterSpacing: "1px",
          }}
        >
          Set New Password
        </h1>

        <p className="text-secondary mb-5">
          Choose a strong password you haven't used before.
        </p>

        <div className="row justify-content-center">

          <div className="col-lg-8">

            <div className="mb-4">

              <label className="form-label fw-bold">
                New Password
              </label>

              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>

            <div className="mb-5">

              <label className="form-label fw-bold">
                Confirm New Password
              </label>

              <input
                type="password"
                className="form-control form-control-lg"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

            </div>

            <div className="text-center">

              <button
                className="btn text-white fw-bold px-5 py-3"
                style={{
                  background: "#118db3",
                  letterSpacing: "3px",
                  width: "320px",
                }}
                onClick={handleUpdate}
              >
                RESET PASSWORD
              </button>

            </div>

            <div className="text-center mt-4">

              <button
                className="btn btn-link text-dark text-decoration-none"
                onClick={() => navigate("/verify-code")}
              >
                &lt; Back to Verification
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;