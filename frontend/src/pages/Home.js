import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../assets/logo.png";
import factory from "../assets/factory.jpg";

function Home() {
const navigate = useNavigate();

const features = [
"Inventory Control",
"Production Scheduling",
"Materials Management",
"Analytics & Reports",
"Quality Control",
"Supplier Network",
];

return ( <div className="home">


  {/* Navbar */}
  <nav className="navbar">
    <div className="logo-section">
      <img src={logo} alt="ClothCore Logo" className="logo" />
      <div>
        <h2>ClothCore</h2>
        <p>Garment Productions</p> 
      </div>
    </div>

    <ul className="nav-links">
      <li><a href="#home">HOME</a></li>
      <li><a href="#about">WHO WE ARE</a></li>
      <li><a href="#products">PRODUCTS</a></li>
      <li><a href="#contact">CONTACT</a></li>
    </ul>

    <div className="nav-buttons">
      <button
        className="login-btn"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      <button
        className="register-btn"
        onClick={() => navigate("/register")}
      >
        Register
      </button>
    </div>
  </nav>

  {/* Hero Section */}
  <section className="hero" id="home">
    <div className="hero-left">
      <img
        src={factory}
        alt="Factory"
        className="factory-image"
      />

      <h1>
        Manage Every Thread of Your Garment Business
      </h1>

      <p>
        ClothCore streamlines garment production,
        inventory tracking, order management and
        supplier coordination in one platform.
      </p>
    </div>

    <div className="hero-right">
      <h2>Live Dashboard</h2>

      <div className="dashboard-card">
        <p>Active Orders : 284</p>
        <p>Materials In Stock : 100</p>
        <p>Garments Tracked : 500</p>
        <p>Production Rate : 97%</p>
      </div>

      <div className="small-cards">
        <div className="small-card">
          <h3>48 Rolls</h3>
          <p>Available</p>
        </div>

        <div className="small-card">
          <h3>97.4%</h3>
          <p>Efficiency</p>
        </div>
      </div>
    </div>
  </section>

  {/* Core Capabilities */}
  <section className="features-section">
    <p className="section-subtitle">
      CORE CAPABILITIES
    </p>

    <h2>Everything Your Factory Needs</h2>

    <div className="feature-grid">
      {features.map((feature, index) => (
        <div className="feature-card" key={index}>
          <h3>{feature}</h3>

          <p>
            Manage and monitor garment factory
            operations efficiently using ClothCore.
          </p>
        </div>
      ))}
    </div>
  </section>
  {/* Who We Are Section */}

<section className="about-section" id="about">

  <div className="about-left">
    <p className="section-subtitle">WHO WE ARE</p>


<h2>
  Built by Industry Experts,
  for the Garment Trade
</h2>

<p>
  ClothCore was founded to simplify garment
  production management through modern
  digital solutions.
</p>

<p>
  Our platform helps manufacturers manage
  orders, inventory, production schedules,
  suppliers and quality control in one place.
</p>

<div className="quote-box">
  "We didn't build another generic ERP.
  We built a system that speaks the
  language of the factory floor."
</div>
```

  </div>

  <div className="about-right">


<div className="info-card">
  <h3>Our Mission</h3>
  <p>
    To help garment manufacturers improve
    productivity through smart digital tools.
  </p>
</div>

<div className="info-card">
  <h3>Our Vision</h3>
  <p>
    A fully connected garment industry where
    every process is tracked and optimized.
  </p>
</div>

<div className="info-card">
  <h3>Our Values</h3>
  <p>
    Innovation, transparency, reliability
    and customer success.
  </p>
</div>


  </div>

</section>
{/* Leadership Team Section */}
<section className="team-section">

  <p className="section-subtitle">
    LEADERSHIP TEAM
  </p>

  <h2>
    The People Behind ClothCore
  </h2>

  <div className="team-grid">

    <div className="team-card">
      <div className="team-avatar ceo">AR</div>

      <h3>Chief Executive Officer</h3>

      <p>
        15 years in garment operations.
        Former production director at one
        of Sri Lanka's largest apparel groups.
      </p>
    </div>

    <div className="team-card">
      <div className="team-avatar cto">NP</div>

      <h3>Chief Technology Officer</h3>

      <p>
        Full-stack engineer with a decade
        in enterprise software. Passionate
        about simplifying industrial workflows.
      </p>
    </div>

    <div className="team-card">
      <div className="team-avatar ops">DW</div>

      <h3>Head of Operations</h3>

      <p>
        Specialist in lean manufacturing
        and quality systems. Holds certifications
        in Six Sigma and ISO 9001 implementation.
      </p>
    </div>

  </div>

</section>
{/* Products Section */}
<section className="products-section" id="products">

  <p className="section-subtitle">
    OUR PRODUCTS & MATERIALS
  </p>

  <h2>
    Garment Management, End to End
  </h2>

  <div className="product-grid">

    <div className="product-card">
      <div className="product-top">
        <span className="product-icon">📋</span>
      </div>
      <div className="product-content"></div>
      <h3>Order Management</h3>
      <p>
        Track purchase orders, work orders and delivery
      schedules from a single dashboard.
      </p>
    </div>
    

    <div className="product-card">
      <div className="product-top">
        <span className="product-icon">📦</span>
      </div>
      <div className="product-content"></div>
      <h3>Inventory Module</h3>
      <p>
        Full visibility into raw materials,
        WIP batches and finished goods stock levels.
      </p>
    </div>
    

    <div className="product-card">
      <div className="product-top">
        <span className="product-icon">🏭</span>
      </div>
      <div className="product-content"></div>
      <h3>Production Planner</h3>
      <p>
        Schedule cutting, sewing and quality
        checkpoints with ease.
      </p>
    </div>

  </div>

  <div className="material-grid">

    <div className="material-card">
      <div className="material-circle cotton"></div>
      <h3>Cotton</h3>
      <p>120 rolls in stock</p>
    </div>

    <div className="material-card">
      <div className="material-circle silk"></div>
      <h3>Silk</h3>
      <p>34 rolls in stock</p>
    </div>

    <div className="material-card">
      <div className="material-circle denim"></div>
      <h3>Denim</h3>
      <p>76 rolls in stock</p>
    </div>

    <div className="material-card">
      <div className="material-circle linen"></div>
      <h3>Linen</h3>
      <p>52 rolls in stock</p>
    </div>

  </div>

</section>
{/* Contact Section */}
<section className="contact-section" id="contact">

  <p className="section-subtitle">
    CONTACT US
  </p>

  <h2>
    Let's Start a Conversation
  </h2>

  <p className="contact-text">
    Whether you're ready to demo ClothCore or just
    exploring, our team is here to help you find
    the right fit for your factory.
  </p>

  <div className="contact-card">

    <div className="contact-item">
      <span>📧</span>
      <div>
        <h4>Email</h4>
        <p>clothcore@gmail.com</p>
      </div>
    </div>

    <div className="contact-item">
      <span>📞</span>
      <div>
        <h4>Phone</h4>
        <p>0741862226</p>
      </div>
    </div>

    <div className="contact-item">
      <span>📍</span>
      <div>
        <h4>Office</h4>
        <p>12 Kanuwa, Seeduwa, Sri Lanka</p>
      </div>
    </div>

    <div className="contact-item">
      <span>⏰</span>
      <div>
        <h4>Working Hours</h4>
        <p>Mon - Fri, 8.30 AM - 5.30 PM</p>
      </div>
    </div>

  </div>

</section>
{/* Footer */}
<footer className="footer">
  <h3>ClothCore</h3>

  <p>
    Smart Garment Production Management System
  </p>

  <p>
    © 2026 ClothCore. All Rights Reserved.
  </p>
</footer>
</div>


);
}

export default Home;
