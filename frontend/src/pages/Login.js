import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
function Login() {

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleSubmit = async (e) => {
  e.preventDefault();

  

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: loginData.email,
        password: loginData.password,
      }
    );

    alert(res.data.message);

  } catch (err) {
    alert(err.response?.data?.message || err.message);
  }
};
   

  return (
    <div className="bg-light min-vh-100">

      {/* Navbar */}

      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">

          <a className="navbar-brand d-flex align-items-center" href="/">
            <img
              src={logo}
              alt="logo"
              width="50"
              height="50"
              className="me-2"
            />

            <div>
              <h5 className="mb-0 fw-bold text-primary">
                ClothCore
              </h5>

              <small className="text-muted">
                Garment Productions
              </small>
            </div>
          </a>

          <button
            className="navbar-toggler"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">

            <ul className="navbar-nav mx-auto">

              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/">Who We Are</a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/">
                  Our Products & Materials
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="/">Contact Us</a>
              </li>

            </ul>

            <div>

              <button className="btn btn-outline-primary rounded-pill px-4 me-2">
                Login
              </button>
<button
  className="btn btn-primary rounded-pill px-4"
  onClick={() => navigate("/register")}
>
  Register
</button>

            </div>

          </div>

        </div>
      </nav>

      {/* Login Card */}

      <div className="container">

        <div
          className="row justify-content-center align-items-center"
          style={{ minHeight: "85vh" }}
        >

          <div className="col-lg-5 col-md-7">

            <div
              className="card border-0 shadow-lg"
              style={{ borderRadius: "25px" }}
            >

              <div className="card-body p-5">

                <h1 className="text-center fw-bold mb-2">
                  Sign In
                </h1>

                <p className="text-center text-secondary mb-4">
                  Don't have an account?
                  <span className="text-primary fw-semibold">
                    {" "}
                    Create one here
                  </span>
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Email Address
                    </label>

                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter Email Address"
                      name="email"
                      value={loginData.email}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter Password"
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="d-flex justify-content-between mb-4">

                    <div className="form-check">

                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="remember"
                        checked={loginData.remember}
                        onChange={handleChange}
                      />

                      <label className="form-check-label">
                        Remember Me
                      </label>

                    </div>

                    <a
                      href="/"
                      className="text-decoration-none"
                    >
                      Forgot Password?
                    </a>

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 fw-bold rounded-3"
                  >
                    SIGN IN
                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;