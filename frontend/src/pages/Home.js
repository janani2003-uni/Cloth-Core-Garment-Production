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

```
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

```
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

```
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
```

  </div>

</section>

</div>


);
}

export default Home;
