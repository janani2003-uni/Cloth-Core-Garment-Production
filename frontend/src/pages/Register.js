import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import logo from "../assets/logo-new.png.jpeg";
import authSplitImage from "../assets/shirt.jpg.png";
import RegisterForm from "../components/RegisterForm";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="auth-page auth-split-page">
      <div
        className="auth-split-image"
        style={{
          backgroundImage: `linear-gradient(165deg, rgba(34,16,51,0.5), rgba(82,43,91,0.25) 55%, rgba(34,16,51,0.65)), url(${authSplitImage})`,
        }}
      />

      <div className="auth-split-panel">
        <motion.div
          className="auth-split-panel-inner wide"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-split-header">
            <button
              type="button"
              className="auth-split-brand border-0 bg-transparent"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="ClothCore logo" />
              <div className="text-start">
                <div className="fw-bold auth-brand-title">ClothCore</div>
                <div className="auth-brand-subtitle">Garment Productions</div>
              </div>
            </button>

            <div className="nav-auth-btn">
              <FiUser className="nav-auth-btn-icon" />
              <button
                type="button"
                className="nav-auth-btn-segment login"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <span className="nav-auth-btn-divider" aria-hidden="true">/</span>
              <button
                type="button"
                className="nav-auth-btn-segment register"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>

          <RegisterForm />
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
