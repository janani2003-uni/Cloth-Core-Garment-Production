import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

function Register() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    factoryName: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });


  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

   const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        factoryName: formData.factoryName,
        password: formData.password,
      }
    );

    alert(res.data.message);

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Registration Failed"
    );
  }
};

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img
              src={logo}
              alt="logo"
              width="55"
            />
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
                <a className="nav-link">HOME</a>
              </li>
              <li className="nav-item">
                <a className="nav-link">WHO WE ARE</a>
              </li>
              <li className="nav-item">
                <a className="nav-link">
                  OUR PRODUCTS & MATERIALS
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link">CONTACT US</a>
              </li>
            </ul>
            <button className="btn btn-primary me-2 px-4">
              Login
            </button>
            <button className="btn btn-primary px-4">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="container py-5">
        <p
          className="fw-bold mb-2"
          style={{
            color: "#f2a100",
            letterSpacing: "3px"
          }}
        >
          GET STARTED
        </p>
        <h1
          className="fw-bold"
          style={{
            fontFamily: "serif",
            letterSpacing: "3px"
          }}
        >
          Create Account
        </h1>

        <p className="mb-5">
  Already registered?

  <Link
    to="/"
    className="ms-2 fw-bold text-decoration-none"
    style={{ color: "#f2a100" }}
  >
    Sign in here
  </Link>
</p>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold">
                First Name
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold">
                Last Name
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 mb-4">
              <label className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 mb-4">
              <label className="form-label fw-semibold">
                Factory Name
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="factoryName"
                placeholder="Enter Factory Name"
                value={formData.factoryName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-4">
              <label className="form-label fw-semibold">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                required
              />
              <label className="form-check-label">
                I agree to the
                <span className="text-primary fw-bold"> Terms & Conditions </span>
                and
                <span className="text-primary fw-bold"> Privacy Policy</span>
              </label>
            </div>
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold"
              style={{
                borderRadius: "10px",
                fontSize: "18px"
              }}
            >
              CREATE MY ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;