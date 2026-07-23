import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import {
  FiArrowRight,
  FiUser,
  FiGrid,
  FiShoppingBag,
  FiBox,
  FiCreditCard,
  FiActivity,
  FiUsers,
  FiSmile,
  FiPackage,
  FiHome,
  FiBarChart2,
  FiCheckCircle,
  FiTarget,
  FiEye,
  FiHeart,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiTrendingUp,
  FiFileText,
} from "react-icons/fi";
import {
  GiSewingMachine,
  GiCottonFlower,
  GiRolledCloth,
  GiTrousers,
  GiLeafSwirl,
} from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import "./Home.css";
import logo from "../assets/logo-new.png.jpeg";
import heroGallery1 from "../assets/hero-gallery-1.jpg.png";
import heroGallery2 from "../assets/hero-gallery-2.jpg.png";
import heroGallery3 from "../assets/hero-gallery-3.jpg.png";
import heroGallery4 from "../assets/hero-gallery-4.jpg.png";
import cottonImage from "../assets/material-cotton.jpg.png";
import silkImage from "../assets/material-silk.jpg.png";
import denimImage from "../assets/material-denim.jpg.png";
import linenImage from "../assets/material-linen.jpg.png";

const materials = [
  {
    name: "Cotton",
    stock: 120,
    unit: "rolls",
    image: cottonImage,
    alt: "Cotton processing material",
    icon: GiCottonFlower,
    className: "cotton",
  },
  {
    name: "Silk",
    stock: 34,
    unit: "rolls",
    image: silkImage,
    alt: "Silk fabric production",
    icon: GiRolledCloth,
    className: "silk",
  },
  {
    name: "Denim",
    stock: 76,
    unit: "rolls",
    image: denimImage,
    alt: "Denim garment production",
    icon: GiTrousers,
    className: "denim",
  },
  {
    name: "Linen",
    stock: 52,
    unit: "rolls",
    image: linenImage,
    alt: "Linen garment production",
    icon: GiLeafSwirl,
    className: "linen",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 50, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
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

function Home() {
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About Us", href: "#about" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroGalleryImages = [
    { src: heroGallery1, position: "center 20%" },
    { src: heroGallery2, position: "center" },
    { src: heroGallery3, position: "center" },
    { src: heroGallery4, position: "center" },
  ];

  const [galleryParallax, setGalleryParallax] = useState({ x: 0, y: 0 });

  const handleGalleryMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    setGalleryParallax({ x: relX * 14, y: relY * 14 });
  };

  const handleGalleryMouseLeave = () => setGalleryParallax({ x: 0, y: 0 });

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

  const processSteps = [
    { icon: <FiShoppingBag />, title: "Order Submitted", desc: "A shop places a bulk order request through the platform." },
    { icon: <FiCheckCircle />, title: "Admin Review", desc: "An administrator reviews the order details before approving it." },
    { icon: <FiBox />, title: "Material Check", desc: "Raw material availability is checked against current stock." },
    { icon: <GiSewingMachine />, title: "Production Starts", desc: "Once approved, the order enters the production queue." },
    { icon: <FiActivity />, title: "Progress Updates", desc: "Production status is updated as the order moves through each stage." },
    { icon: <FiTrendingUp />, title: "Order Tracking", desc: "The shop can track the order's status until it's complete." },
  ];

  const whyChooseCards = [
    {
      icon: <FiShoppingBag />,
      title: "Centralized Bulk Order Management",
      desc: "Submit and manage bulk orders from one platform instead of scattered spreadsheets and calls.",
    },
    {
      icon: <FiActivity />,
      title: "Real-time Production Tracking",
      desc: "Follow a production job through cutting, sewing, quality check and packing as it happens.",
    },
    {
      icon: <FiBox />,
      title: "Raw Material Availability Checking",
      desc: "Check raw material stock before approving an order, reducing mid-production shortages.",
    },
    {
      icon: <FiEye />,
      title: "Improved Order Visibility",
      desc: "Shops and admins see the same order status, cutting down on status-check back-and-forth.",
    },
    {
      icon: <FiUsers />,
      title: "Better Department Coordination",
      desc: "Keep production, inventory and order teams working from the same up-to-date information.",
    },
    {
      icon: <FiFileText />,
      title: "Accurate Digital Records",
      desc: "Replace paper logs with structured digital records for orders, stock and production stages.",
    },
  ];

  const [inquiry, setInquiry] = useState({ name: "", email: "", subject: "", message: "" });
  const [inquiryErrors, setInquiryErrors] = useState({});
  const [inquiryStatus, setInquiryStatus] = useState(null);

  const handleInquiryChange = (event) => {
    const { name, value } = event.target;
    setInquiry((current) => ({ ...current, [name]: value }));
    setInquiryErrors((current) => ({ ...current, [name]: undefined }));
    setInquiryStatus(null);
  };

  const handleInquirySubmit = (event) => {
    event.preventDefault();

    const errors = {};
    if (!inquiry.name.trim()) errors.name = "Please enter your name.";
    if (!inquiry.email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!inquiry.subject.trim()) errors.subject = "Please enter a subject.";
    if (!inquiry.message.trim()) errors.message = "Please enter a message.";

    if (Object.keys(errors).length > 0) {
      setInquiryErrors(errors);
      setInquiryStatus("error");
      return;
    }

    const body = `Name: ${inquiry.name}\nEmail: ${inquiry.email}\n\n${inquiry.message}`;
    const mailtoUrl = `mailto:clothcore@gmail.com?subject=${encodeURIComponent(
      inquiry.subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setInquiryStatus("success");
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="home">
      {/* Navbar */}
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-section">
          <div className="logo-mark logo-mark-image">
            <img src={logo} alt="ClothCore logo" />
          </div>
          <div>
            <span className="logo-title">CLOTHCORE</span>
            <p>Garment Order &amp; Production Management System</p>
          </div>
        </div>

        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={activeSection === link.href.slice(1) ? "active" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-buttons">
          <div className="nav-auth-btn">
            <FiUser className="nav-auth-btn-icon" />
            <button
              type="button"
              className="nav-auth-btn-segment"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <span className="nav-auth-btn-divider" aria-hidden="true">/</span>
            <button
              type="button"
              className="nav-auth-btn-segment"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
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
        </motion.div>

        <div
          className="hero-gallery-wrap"
          onMouseMove={handleGalleryMouseMove}
          onMouseLeave={handleGalleryMouseLeave}
        >
          <div className="hero-gallery-glow" />
          <span className="hero-gallery-deco hero-gallery-deco-1" />
          <span className="hero-gallery-deco hero-gallery-deco-2" />
          <div className="hero-gallery-glass" />

          <motion.div
            className="hero-gallery"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <div
              className="hero-gallery-parallax"
              style={{
                transform: `translate3d(${galleryParallax.x}px, ${galleryParallax.y}px, 0)`,
              }}
            >
              <div className="hero-gallery-track">
                {[...heroGalleryImages, ...heroGalleryImages].map((item, index) => (
                  <div className="hero-gallery-item" key={index}>
                    <img
                      src={item.src}
                      alt="ClothCore garment showcase"
                      style={{ objectPosition: item.position }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-strip" id="features">
        <div className="features-strip-blob features-strip-blob-1" />
        <div className="features-strip-blob features-strip-blob-2" />
        <div className="fx-particles">
          {Array.from({ length: 6 }).map((_, i) => (
            <span className="fx-particle" key={i} />
          ))}
        </div>

        <motion.div
          className="feature-strip-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {featureCards.map((feature) => (
            <motion.div
              className="feature-strip-card cc-card"
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -16, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="feature-strip-icon cc-icon-badge">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <p className="stats-bar-note">Sample metrics shown for demonstration purposes</p>
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

        <div className="section-divider">
          <span className="section-divider-line" />
          <span className="section-divider-dot" />
          <span className="section-divider-line" />
        </div>
      </section>

      {/* Core Capabilities */}
      <motion.section
        className="features-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="features-section-blob features-section-blob-1" />
        <div className="features-section-blob features-section-blob-2" />
        <div className="fx-particles">
          {Array.from({ length: 6 }).map((_, i) => (
            <span className="fx-particle" key={i} />
          ))}
        </div>

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
            {
              icon: <FiBox />,
              title: "Inventory Control",
              desc: "Track raw material and finished goods stock levels, with low-stock alerts so nothing runs out mid-order.",
            },
            {
              icon: <FiActivity />,
              title: "Production Scheduling",
              desc: "Move an order through cutting, sewing, quality check and packing, with each stage's progress visible in real time.",
            },
            {
              icon: <FiPackage />,
              title: "Materials Management",
              desc: "Keep a record of fabric and material categories on hand, organized by type for quick lookup.",
            },
            {
              icon: <FiBarChart2 />,
              title: "Analytics & Reports",
              desc: "See order volume and production status at a glance from a single dashboard view.",
            },
            {
              icon: <FiCheckCircle />,
              title: "Quality Control",
              desc: "Flag an order's quality-check stage so issues are caught before packing and delivery.",
            },
            {
              icon: <FiUsers />,
              title: "Supplier Network",
              desc: "Maintain a directory of shops and suppliers connected to your factory's orders.",
            },
          ].map((feature) => (
            <motion.div
              className="feature-card cc-card"
              key={feature.title}
              variants={fadeUp}
              whileHover={{ y: -16, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="feature-card-icon cc-icon-badge">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
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

          <h2>Designed to Simplify Garment Order &amp; Production Coordination</h2>

          <p>
            ClothCore is a project built to explore how garment manufacturers
            and shops could manage bulk orders, inventory and production
            tracking in one connected system.
          </p>

          <p>
            The platform focuses on three core workflows: placing and
            tracking bulk orders, monitoring inventory levels, and following
            a production job from cutting through to completion.
          </p>

          <div className="quote-box">
            "A focused tool for the parts of garment coordination that
            spreadsheets make difficult — orders, stock and production
            status, in one place."
          </div>
        </motion.div>

        <motion.div
          className="about-right"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="info-card"
            variants={fadeUp}
            whileHover={{ y: -14, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="info-card-icon"><FiTarget /></div>
            <h3>Our Mission</h3>
            <p>To help garment manufacturers improve productivity through smart digital tools.</p>
          </motion.div>

          <motion.div
            className="info-card"
            variants={fadeUp}
            whileHover={{ y: -14, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="info-card-icon"><FiEye /></div>
            <h3>Our Vision</h3>
            <p>A fully connected garment industry where every process is tracked and optimized.</p>
          </motion.div>

          <motion.div
            className="info-card"
            variants={fadeUp}
            whileHover={{ y: -14, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="info-card-icon"><FiHeart /></div>
            <h3>Our Values</h3>
            <p>Innovation, transparency, reliability and customer success.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* How ClothCore Works */}
      <section className="workflow-section" id="how-it-works">
        <p className="section-subtitle">HOW IT WORKS</p>
        <h2>How ClothCore Works</h2>
        <p className="workflow-intro">
          From order submission to delivery tracking — here's how a bulk order moves through ClothCore.
        </p>

        <motion.div
          className="workflow-timeline"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {processSteps.map((step, index) => (
            <motion.div className="workflow-step" key={step.title} variants={fadeUp}>
              <span className="workflow-step-number">STEP {index + 1}</span>
              <div className="workflow-step-icon cc-icon-badge">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Choose ClothCore Section */}
      <section className="why-choose-section">
        <p className="section-subtitle">WHY CHOOSE CLOTHCORE</p>
        <h2>Built Around What Garment Factories Actually Need</h2>

        <motion.div
          className="why-choose-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {whyChooseCards.map((card) => (
            <motion.div
              className="why-choose-card cc-card"
              key={card.title}
              variants={fadeUp}
              whileHover={{ y: -16, scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="why-choose-icon cc-icon-badge">{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Products Section */}
      <section className="products-section" id="products">
        <p className="section-subtitle">MODULES &amp; MATERIALS</p>
        <h2>What ClothCore Manages</h2>

        <h3 className="products-subheading">ClothCore Modules</h3>

        <motion.div
          className="product-grid"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            className="product-card"
            variants={fadeUp}
            whileHover={{ y: -16, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
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

          <motion.div
            className="product-card"
            variants={fadeUp}
            whileHover={{ y: -16, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
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

          <motion.div
            className="product-card"
            variants={fadeUp}
            whileHover={{ y: -16, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
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

        <div className="materials-showcase">
          <div className="materials-blob materials-blob-1" />
          <div className="materials-blob materials-blob-2" />

          <div className="materials-header">
            <p className="materials-eyebrow">OUR MATERIALS</p>
            <h3 className="products-subheading materials-heading">Supported Material Categories</h3>
            <p className="materials-subtitle">
              Premium materials selected for quality garment production.
            </p>
            <span className="materials-badge-pill">
              <HiSparkles aria-hidden="true" />
              Example stock figures for demonstration only
            </span>
          </div>

          <motion.div
            className="material-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {materials.map((material) => {
              const CategoryIcon = material.icon;
              return (
                <motion.div
                  key={material.name}
                  className={`material-card cc-card material-card-${material.className}`}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <span className="material-category-icon" aria-hidden="true">
                    <CategoryIcon />
                  </span>

                  <div className={`material-image-frame material-image-frame-${material.className}`}>
                    <span className="material-frame-dot material-frame-dot-1" aria-hidden="true" />
                    <span className="material-frame-dot material-frame-dot-2" aria-hidden="true" />
                    <span className="material-frame-dot material-frame-dot-3" aria-hidden="true" />
                    <img src={material.image} alt={material.alt} loading="lazy" />
                  </div>

                  <h3>{material.name}</h3>

                  <span className="material-stock-pill">
                    <FiPackage aria-hidden="true" />
                    Sample stock: <strong>{material.stock}</strong> {material.unit}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <p className="section-subtitle">CONTACT US</p>
        <h2>Let's Start a Conversation</h2>

        <p className="contact-text">
          Whether you're ready to demo ClothCore or just exploring, our team
          is here to help you find the right fit for your factory.
        </p>

        <div className="contact-layout">
          <motion.div
            className="contact-card cc-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -10, scale: 1.015 }}
          >
            <div className="contact-item">
              <span className="contact-icon cc-icon-badge"><FiMail /></span>
              <div>
                <h4>Email</h4>
                <p>clothcore@gmail.com</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon cc-icon-badge"><FiPhone /></span>
              <div>
                <h4>Phone</h4>
                <p>0741862226</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon cc-icon-badge"><FiMapPin /></span>
              <div>
                <h4>Office</h4>
                <p>12 Kanuwa, Seeduwa, Sri Lanka</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon cc-icon-badge"><FiClock /></span>
              <div>
                <h4>Working Hours</h4>
                <p>Mon - Fri, 8.30 AM - 5.30 PM</p>
              </div>
            </div>
          </motion.div>

          <motion.form
            className="inquiry-card cc-card"
            onSubmit={handleInquirySubmit}
            noValidate
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="inquiry-title">Send a Quick Inquiry</h3>
            <p className="inquiry-subtitle">
              This opens your email app with the message pre-filled — ClothCore
              doesn't have a live inbox connected to this form yet.
            </p>

            <div className="inquiry-field">
              <label htmlFor="inquiryName">Full Name</label>
              <input
                id="inquiryName"
                name="name"
                type="text"
                className="form-control auth-input"
                value={inquiry.name}
                onChange={handleInquiryChange}
                aria-invalid={!!inquiryErrors.name}
                aria-describedby={inquiryErrors.name ? "inquiryName-error" : undefined}
              />
              {inquiryErrors.name && (
                <span className="inquiry-error" id="inquiryName-error">{inquiryErrors.name}</span>
              )}
            </div>

            <div className="inquiry-field">
              <label htmlFor="inquiryEmail">Email</label>
              <input
                id="inquiryEmail"
                name="email"
                type="email"
                className="form-control auth-input"
                value={inquiry.email}
                onChange={handleInquiryChange}
                aria-invalid={!!inquiryErrors.email}
                aria-describedby={inquiryErrors.email ? "inquiryEmail-error" : undefined}
              />
              {inquiryErrors.email && (
                <span className="inquiry-error" id="inquiryEmail-error">{inquiryErrors.email}</span>
              )}
            </div>

            <div className="inquiry-field">
              <label htmlFor="inquirySubject">Subject</label>
              <input
                id="inquirySubject"
                name="subject"
                type="text"
                className="form-control auth-input"
                value={inquiry.subject}
                onChange={handleInquiryChange}
                aria-invalid={!!inquiryErrors.subject}
                aria-describedby={inquiryErrors.subject ? "inquirySubject-error" : undefined}
              />
              {inquiryErrors.subject && (
                <span className="inquiry-error" id="inquirySubject-error">{inquiryErrors.subject}</span>
              )}
            </div>

            <div className="inquiry-field">
              <label htmlFor="inquiryMessage">Message</label>
              <textarea
                id="inquiryMessage"
                name="message"
                rows="4"
                className="form-control auth-input"
                value={inquiry.message}
                onChange={handleInquiryChange}
                aria-invalid={!!inquiryErrors.message}
                aria-describedby={inquiryErrors.message ? "inquiryMessage-error" : undefined}
              />
              {inquiryErrors.message && (
                <span className="inquiry-error" id="inquiryMessage-error">{inquiryErrors.message}</span>
              )}
            </div>

            <button type="submit" className="get-started-btn inquiry-submit">
              Send Message <FiArrowRight />
            </button>

            {inquiryStatus === "success" && (
              <p className="inquiry-feedback inquiry-feedback-success" role="status">
                Your email app should now be open with this message ready to send.
              </p>
            )}
            {inquiryStatus === "error" && (
              <p className="inquiry-feedback inquiry-feedback-error" role="alert">
                Please fix the highlighted fields above.
              </p>
            )}
          </motion.form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark footer-logo-mark-image">
                <img src={logo} alt="ClothCore logo" />
              </span>
              <span className="footer-brand-name">ClothCore</span>
            </div>
            <p className="footer-tagline">
              A centralized platform for garment order, inventory and
              production coordination.
            </p>
          </div>

          <nav className="footer-col" aria-label="Footer navigation">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:clothcore@gmail.com">clothcore@gmail.com</a></li>
              <li><a href="tel:+94741862226">074 186 2226</a></li>
              <li>Seeduwa, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ClothCore. All Rights Reserved.</p>
          <p className="footer-note">
            Built to simplify garment order and production management.
          </p>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}

export default Home;
