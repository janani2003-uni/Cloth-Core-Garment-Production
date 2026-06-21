import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    navigate("/verify-code", {
      state: { email },
    });
  };

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}

      <nav className="navbar navbar-expand-lg bg-white shadow-sm">

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

      {/* Content */}

      <div className="container py-5">

        <p
          className="text-primary mb-2"
          style={{ letterSpacing: "2px" }}
        >
          FORGOT PASSWORD
        </p>

        <h1
          className="mb-3"
          style={{
            fontWeight: "500",
            letterSpacing: "2px",
          }}
        >
          Find Your Account
        </h1>

        <p className="text-dark mb-5 fs-5">
          Enter your registered email and we'll send you a verification code
          to reset your password.
        </p>

        <div className="row justify-content-center">

          <div className="col-lg-10">

            <label className="form-label fw-bold fs-5 mb-3">
              Registered Email Address
            </label>

            <input
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <p
              className="mt-4"
              style={{
                letterSpacing: "3px",
                fontSize: "18px",
              }}
            >
              This should be the email you used when creating your
              <br />
              ClothCore account.
            </p>

            <div className="text-center mt-5">

              <button
                className="btn text-white fw-bold px-5 py-3"
                style={{
                  background: "#118db3",
                  width: "300px",
                  letterSpacing: "3px",
                }}
                onClick={handleVerify}
              >
                SEND RESET CODE
              </button>

            </div>

            <div className="text-center mt-4">

              <button
                className="btn btn-link text-dark text-decoration-none"
                onClick={() => navigate("/")}
              >
                &lt; Back to Sign In
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;