import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiUser,
  FiBell,
  FiGrid,
  FiShoppingBag,
  FiBox,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiActivity,
  FiShield,
  FiCheckCircle,
  FiUsers,
  FiSmile,
  FiAlertTriangle,
  FiChevronDown,
  FiPackage,
  FiHome,
} from "react-icons/fi";
import { GiHanger, GiSewingMachine } from "react-icons/gi";
import "./Home.css";
import factory from "../assets/factory.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

function AnimatedCounter({ value, suffix = "", duration = 1.6 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let raf;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, amount: 0.6 }}
    >
      {count}
      {suffix}
    </motion.span>
  );
}

function buildConicGradient(slices) {
  let cumulative = 0;
  const stops = slices.map((slice) => {
    const start = cumulative;
    cumulative += slice.value;
    return `${slice.color} ${start}% ${cumulative}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function Home() {
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About Us", href: "#about" },
    { label: "How It Works", href: "#products" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  const heroHighlights = [
    { icon: <FiPackage />, label: "Bulk Order Management" },
    { icon: <FiActivity />, label: "Real-time Production Tracking" },
    { icon: <FiShield />, label: "Secure & Transparent Payments" },
    { icon: <FiBox />, label: "Inventory Control" },
  ];

  const sidebarNav = [
    { icon: <FiGrid />, label: "Dashboard", active: true },
    { icon: <FiShoppingBag />, label: "Orders" },
    { icon: <GiSewingMachine />, label: "Production" },
    { icon: <FiBox />, label: "Inventory" },
    { icon: <FiCreditCard />, label: "Payments" },
    { icon: <FiBarChart2 />, label: "Reports" },
    { icon: <FiBell />, label: "Notifications" },
    { icon: <FiSettings />, label: "Settings" },
  ];

  const dashboardStats = [
    { label: "Total Orders", value: "128", change: "+12% from last month", icon: <FiShoppingBag />, tone: "purple" },
    { label: "In Production", value: "64", change: "+8% from last month", icon: <FiActivity />, tone: "pink" },
    { label: "Completed Orders", value: "32", change: "+15% from last month", icon: <FiCheckCircle />, tone: "green" },
    { label: "Pending Payments", value: "12", change: "+5% from last month", icon: <FiCreditCard />, tone: "peach" },
  ];

  const productionSlices = [
    { label: "Cutting", value: 20, color: "#6d3aa8" },
    { label: "Sewing", value: 40, color: "#e14f8a" },
    { label: "Quality Check", value: 20, color: "#f5a25a" },
    { label: "Packing", value: 20, color: "#f6cf6b" },
  ];

  const recentOrders = [
    { id: "ORD-2024-125", client: "Zara Fashions", status: "In Production" },
    { id: "ORD-2024-124", client: "Style Hub", status: "Pending" },
    { id: "ORD-2024-123", client: "Trend Wear", status: "Completed" },
    { id: "ORD-2024-122", client: "Fashion Point", status: "Pending" },
  ];

  const featureCards = [
    {
      icon: <FiShoppingBag />,
      title: "Order Management",
      desc: "Handle bulk orders from shops with ease and track every step.",
    },
    {
      icon: <FiBox />,
      title: "Inventory Control",
      desc: "Monitor raw materials and get alerts for low stock.",
    },
    {
      icon: <GiSewingMachine />,
      title: "Production Tracking",
      desc: "Track production stages in real-time and improve efficiency.",
    },
    {
      icon: <FiCreditCard />,
      title: "Payments & Invoices",
      desc: "Manage payments, generate invoices and maintain transparency.",
    },
  ];

  const statsBar = [
    { icon: <FiUsers />, value: 50, suffix: "+", label: "Registered Shops" },
    { icon: <FiBox />, value: 500, suffix: "+", label: "Orders Managed" },
    { icon: <FiHome />, value: 100, suffix: "+", label: "Products Created" },
    { icon: <FiSmile />, value: 98, suffix: "%", label: "Customer Satisfaction" },
  ];

  return (
    <div className="home">
      {/* Navbar */}
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-section">
          <div className="logo-mark">
            <GiHanger />
          </div>
          <div>
            <h2>CLOTHCORE</h2>
            <p>Garment Order &amp; Production Management System</p>
          </div>
        </div>

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-buttons">
          <button className="login-register-btn" onClick={() => navigate("/login")}>
            <FiUser />
            Login / Register
          </button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <motion.div
          className="hero-left"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span className="hero-badge" variants={fadeUp}>
            Smart. Simple. Seamless.
          </motion.span>

          <motion.h1 variants={fadeUp}>
            Manage Orders.
            <br />
            Streamline Production.
            <br />
            <span className="hero-highlight">Grow Your Business.</span>
          </motion.h1>

          <motion.p variants={fadeUp}>
            ClothCore helps garment manufacturers and shops manage bulk
            orders, inventory, production, and payments — all in one place.
          </motion.p>

          <motion.div className="hero-cta" variants={fadeUp}>
            <button className="get-started-btn" onClick={() => navigate("/register")}>
              Get Started <FiArrowRight />
            </button>
            <button
              className="explore-btn"
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <FiGrid /> Explore Features
            </button>
          </motion.div>

          <motion.div className="hero-highlights" variants={fadeUp}>
            {heroHighlights.map((item) => (
              <div className="hero-highlight-item" key={item.label}>
                <span className="hero-highlight-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-right"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            className="dashboard-mock"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="mock-sidebar">
              <div className="mock-logo">
                <GiHanger />
                <span>CLOTHCORE</span>
              </div>

              <ul className="mock-nav">
                {sidebarNav.map((item) => (
                  <li key={item.label} className={item.active ? "active" : ""}>
                    <span className="mock-nav-icon">{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="mock-user">
                <div className="mock-avatar">A</div>
                <div className="mock-user-info">
                  <strong>Admin User</strong>
                  <span>Super Admin</span>
                </div>
                <FiChevronDown />
              </div>
            </div>

            <div className="mock-main">
              <div className="mock-topbar">
                <div>
                  <h4>Dashboard</h4>
                  <p>Welcome back, Admin!</p>
                </div>
                <div className="mock-topbar-icons">
                  <span className="mock-bell">
                    <FiBell />
                    <i className="mock-bell-dot" />
                  </span>
                  <span className="mock-avatar small">A</span>
                </div>
              </div>

              <div className="mock-stats">
                {dashboardStats.map((stat) => (
                  <div className={`mock-stat-card tone-${stat.tone}`} key={stat.label}>
                    <div className="mock-stat-top">
                      <span>{stat.label}</span>
                      <span className="mock-stat-icon">{stat.icon}</span>
                    </div>
                    <h5>{stat.value}</h5>
                    <p>{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className="mock-panels">
                <div className="mock-panel">
                  <h6>Production Overview</h6>
                  <div className="mock-donut-wrap">
                    <motion.div
                      className="mock-donut"
                      style={{ background: buildConicGradient(productionSlices) }}
                      initial={{ scale: 0, rotate: -80 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div className="mock-donut-hole">
                        <strong>64</strong>
                        <span>Total</span>
                      </div>
                    </motion.div>

                    <ul className="mock-legend">
                      {productionSlices.map((slice) => (
                        <li key={slice.label}>
                          <i style={{ background: slice.color }} />
                          {slice.label}
                          <span>{slice.value}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mock-panel">
                  <div className="mock-panel-header">
                    <h6>Recent Orders</h6>
                    <span className="mock-view-all">View All</span>
                  </div>
                  <ul className="mock-orders">
                    {recentOrders.map((order) => (
                      <li key={order.id}>
                        <div>
                          <strong>{order.id}</strong>
                          <span>{order.client}</span>
                        </div>
                        <span className={`mock-status status-${order.status.replace(/\s/g, "").toLowerCase()}`}>
                          {order.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mock-alert">
                <span className="mock-alert-icon">
                  <FiAlertTriangle />
                </span>
                <span>Low Stock Alerts — 8 items are running low on stock</span>
                <span className="mock-view-all">View Inventory</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-strip" id="features">
        <motion.div
          className="feature-strip-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featureCards.map((feature) => (
            <motion.div className="feature-strip-card" key={feature.title} variants={fadeUp}>
              <div className="feature-strip-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <motion.div
          className="stats-bar-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {statsBar.map((stat) => (
            <motion.div className="stats-bar-item" key={stat.label} variants={fadeUp}>
              <span className="stats-bar-icon">{stat.icon}</span>
              <h3>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Core Capabilities */}
      <motion.section
        className="features-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <p className="section-subtitle">CORE CAPABILITIES</p>
        <h2>Everything Your Factory Needs</h2>

        <motion.div
          className="feature-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {[
            "Inventory Control",
            "Production Scheduling",
            "Materials Management",
            "Analytics & Reports",
            "Quality Control",
            "Supplier Network",
          ].map((feature) => (
            <motion.div className="feature-card" key={feature} variants={fadeUp}>
              <h3>{feature}</h3>
              <p>Manage and monitor garment factory operations efficiently using ClothCore.</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Who We Are Section */}
      <section className="about-section" id="about">
        <motion.div
          className="about-left"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-subtitle">WHO WE ARE</p>

          <h2>Built by Industry Experts, for the Garment Trade</h2>

          <p>
            ClothCore was founded to simplify garment production management
            through modern digital solutions.
          </p>

          <p>
            Our platform helps manufacturers manage orders, inventory,
            production schedules, suppliers and quality control in one
            place.
          </p>

          <div className="quote-box">
            "We didn't build another generic ERP. We built a system that
            speaks the language of the factory floor."
          </div>
        </motion.div>

        <motion.div
          className="about-right"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="info-card" variants={fadeUp}>
            <h3>Our Mission</h3>
            <p>To help garment manufacturers improve productivity through smart digital tools.</p>
          </motion.div>

          <motion.div className="info-card" variants={fadeUp}>
            <h3>Our Vision</h3>
            <p>A fully connected garment industry where every process is tracked and optimized.</p>
          </motion.div>

          <motion.div className="info-card" variants={fadeUp}>
            <h3>Our Values</h3>
            <p>Innovation, transparency, reliability and customer success.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Factory Image Section */}
      <section className="factory-section">
        <motion.img
          src={factory}
          alt="Factory"
          className="factory-image"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        />
      </section>

      {/* Leadership Team Section */}
      <section className="team-section">
        <p className="section-subtitle">LEADERSHIP TEAM</p>
        <h2>The People Behind ClothCore</h2>

        <motion.div
          className="team-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="team-card" variants={fadeUp}>
            <div className="team-avatar ceo">AR</div>
            <h3>Chief Executive Officer</h3>
            <p>
              15 years in garment operations. Former production director at
              one of Sri Lanka's largest apparel groups.
            </p>
          </motion.div>

          <motion.div className="team-card" variants={fadeUp}>
            <div className="team-avatar cto">NP</div>
            <h3>Chief Technology Officer</h3>
            <p>
              Full-stack engineer with a decade in enterprise software.
              Passionate about simplifying industrial workflows.
            </p>
          </motion.div>

          <motion.div className="team-card" variants={fadeUp}>
            <div className="team-avatar ops">DW</div>
            <h3>Head of Operations</h3>
            <p>
              Specialist in lean manufacturing and quality systems. Holds
              certifications in Six Sigma and ISO 9001 implementation.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Products Section */}
      <section className="products-section" id="products">
        <p className="section-subtitle">OUR PRODUCTS &amp; MATERIALS</p>
        <h2>Garment Management, End to End</h2>

        <motion.div
          className="product-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="product-card" variants={fadeUp}>
            <div className="product-top">
              <span className="product-icon">
                <FiShoppingBag />
              </span>
            </div>
            <div className="product-content">
              <h3>Order Management</h3>
              <p>Track purchase orders, work orders and delivery schedules from a single dashboard.</p>
            </div>
          </motion.div>

          <motion.div className="product-card" variants={fadeUp}>
            <div className="product-top">
              <span className="product-icon">
                <FiBox />
              </span>
            </div>
            <div className="product-content">
              <h3>Inventory Module</h3>
              <p>Full visibility into raw materials, WIP batches and finished goods stock levels.</p>
            </div>
          </motion.div>

          <motion.div className="product-card" variants={fadeUp}>
            <div className="product-top">
              <span className="product-icon">
                <GiSewingMachine />
              </span>
            </div>
            <div className="product-content">
              <h3>Production Planner</h3>
              <p>Schedule cutting, sewing and quality checkpoints with ease.</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="material-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className="material-card" variants={fadeUp}>
            <div className="material-circle cotton"></div>
            <h3>Cotton</h3>
            <p>120 rolls in stock</p>
          </motion.div>

          <motion.div className="material-card" variants={fadeUp}>
            <div className="material-circle silk"></div>
            <h3>Silk</h3>
            <p>34 rolls in stock</p>
          </motion.div>

          <motion.div className="material-card" variants={fadeUp}>
            <div className="material-circle denim"></div>
            <h3>Denim</h3>
            <p>76 rolls in stock</p>
          </motion.div>

          <motion.div className="material-card" variants={fadeUp}>
            <div className="material-circle linen"></div>
            <h3>Linen</h3>
            <p>52 rolls in stock</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <p className="section-subtitle">CONTACT US</p>
        <h2>Let's Start a Conversation</h2>

        <p className="contact-text">
          Whether you're ready to demo ClothCore or just exploring, our team
          is here to help you find the right fit for your factory.
        </p>

        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <h3>ClothCore</h3>
        <p>Smart Garment Production Management System</p>
        <p>© 2026 ClothCore. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
