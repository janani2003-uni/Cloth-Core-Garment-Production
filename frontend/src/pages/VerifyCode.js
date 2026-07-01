import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function VerifyCode() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleVerify = () => {
    navigate("/reset-password", { state });
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
   <div className="ms-3">
              <div className="fw-bold" style={{ fontSize: "30px", color: "#0b3aa0" }}>
                ClothCore
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d", lineHeight: "1.2" }}>
                Garment Productions
              </div>
            </div>
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
          Step 2
        </p>

        <h1
          className="mb-3"
          style={{
            fontWeight: "500",
            letterSpacing: "2px",
          }}
        >
          Enter OTP Code
        </h1>

        <p className="text-dark fs-5 mb-5">
          Enter the 6-digit code we sent to your email address.
        </p>

        <h3
          className="text-center fw-bold mb-5"
          style={{ letterSpacing: "2px" }}
        >
          Verification Code
        </h3>

        <div className="d-flex justify-content-center gap-5 mb-4">

          {[1, 2, 3, 4, 5].map((item) => (
            <input
              key={item}
              type="text"
              maxLength="1"
              className="form-control text-center"
              style={{
                width: "75px",
                height: "85px",
                fontSize: "30px",
                borderRadius: "8px",
              }}
            />
          ))}

        </div>

        <div
          className="d-flex justify-content-center align-items-center mb-5"
          style={{ gap: "300px" }}
        >

          <span
            style={{
              letterSpacing: "3px",
              fontSize: "20px",
            }}
          >
            Code expires in
          </span>

          <button
            className="btn btn-link text-decoration-none"
            style={{
              letterSpacing: "3px",
              fontSize: "20px",
            }}
          >
            Resend Code
          </button>

        </div>

        <div className="text-center">

          <button
            className="btn text-white fw-bold"
            style={{
              background: "#118db3",
              width: "300px",
              height: "60px",
              letterSpacing: "4px",
              fontSize: "20px",
            }}
            onClick={handleVerify}
          >
            VERIFY CODE
          </button>

        </div>

        <div className="text-center mt-4">

          <button
            className="btn btn-link text-dark text-decoration-none"
            onClick={() => navigate("/forgotpassword")}
            style={{
              letterSpacing: "2px",
            }}
          >
            &lt; Back to Email
          </button>

        </div>

      </div>

    </div>
  );
}

export default VerifyCode;