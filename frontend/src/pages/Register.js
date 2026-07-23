import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo-new.png.jpeg";
import RegisterForm from "../components/RegisterForm";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="auth-page min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light auth-navbar">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src={logo} alt="ClothCore logo" className="auth-navbar-logo" />

            <div className="ms-3">
              <div className="fw-bold auth-brand-title">
                ClothCore
              </div>

              <div className="auth-brand-subtitle">
                Garment Productions
              </div>
            </div>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  HOME
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#who-we-are">
                  WHO WE ARE
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#products">
                  OUR PRODUCTS & MATERIALS
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  CONTACT US
                </a>
              </li>
            </ul>

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
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Register Form */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <motion.div
              className="auth-card-wrap"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card auth-card border-0">
                <div className="card-body p-5">
                  <RegisterForm />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
