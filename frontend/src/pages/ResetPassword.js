import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();
  const { state } = useLocation();
  console.log(state);
console.log(state?.otp);

  const handleUpdate = async () => {
  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  try {
    console.log("Email:", state.email);
console.log("OTP:", state.otp);
console.log("New Password:", password);
    const response = await axios.post(
      "http://127.0.0.1:5000/api/auth/reset-password",
      {
        email: state.email,
        otp: state.otp,
        newPassword: password,
      }
    );

    alert(response.data.message);

    navigate("/password-reset-success");

  } catch (error) {
    console.log(error);

    alert(error.response?.data?.message || error.message);
  }
};

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* LEFT SIDE */}
        <div
          className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
          style={{ background: "#0d1b5e", color: "white" }}
        >
          <img
  src={logo}
  alt="Logo"
  className="img-fluid"
  style={{
    width: "350px",
    maxWidth: "80%",
  }}
/>     
   <div className="ms-3">
              <div className="fw-bold" style={{ fontSize: "30px", color: "#0b3aa0" }}>
                ClothCore
              </div>
              <div style={{ fontSize: "14px", color: "#6c757d", lineHeight: "1.2" }}>
                Garment Productions
              </div>
            </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">

          <div
            className="p-4"
            style={{
              width: "350px",
              background: "#cfd3d7",
              borderRadius: "25px",
            }}
          >
            <h5>Set New Password</h5>

            <input
              type="password"
              className="form-control mb-2"
              placeholder="New Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirm Password"
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              className="btn btn-warning w-100"
              onClick={handleUpdate}
            >
              Update Password
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;