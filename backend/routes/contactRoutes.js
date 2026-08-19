// backend/routes/contactRoutes.js
// Public "Get In Touch" endpoint for the Home Page — deliberately has no
// verifyToken (unlike ticketRoutes.js, which is for logged-in Shop Owners
// raising support tickets). A site visitor is never authenticated here.
const express = require("express");
const router = express.Router();

const Inquiry = require("../models/Inquiry");
const { sendContactInquiryEmail, isEmailConfigured } = require("../utils/mailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTHS = { name: 100, email: 150, phone: 30, shopName: 150, subject: 150, message: 3000 };

function clean(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

// POST /api/contact — receives a Home Page "Get In Touch" submission,
// validates it, and sends it to the ClothCore inbox via the same
// Nodemailer transporter Forgot Password OTP already uses (see
// backend/utils/mailer.js — one shared configuration, not a duplicate).
router.post("/", async (req, res) => {
  const name = clean(req.body?.name, MAX_LENGTHS.name);
  const email = clean(req.body?.email, MAX_LENGTHS.email).toLowerCase();
  const phone = clean(req.body?.phone, MAX_LENGTHS.phone);
  const shopName = clean(req.body?.shopName, MAX_LENGTHS.shopName);
  const subject = clean(req.body?.subject, MAX_LENGTHS.subject);
  const message = clean(req.body?.message, MAX_LENGTHS.message);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Please fill in your name, email and message." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  if (!isEmailConfigured) {
    console.error("[contact] Inquiry submitted but EMAIL_USER/EMAIL_PASS are not configured.");
    return res.status(503).json({ success: false, message: "We couldn't send your inquiry right now. Please try again later or email us directly." });
  }

  try {
    // The email send is the actual source of truth for "did ClothCore
    // receive this" — success is only ever returned once this resolves.
    await sendContactInquiryEmail({ name, email, phone, shopName, subject, message });
  } catch (error) {
    console.error("Send Contact Inquiry Email Error:", error.message);

    // The email failed, but don't lose the visitor's message — save it
    // anyway (best effort) so an Admin can still follow up manually.
    try {
      await Inquiry.create({ name, email, phone, shopName, subject, message, emailDelivered: false });
    } catch (dbError) {
      console.error("Save Inquiry Error (after email failure):", dbError.message);
    }

    return res.status(502).json({ success: false, message: "We couldn't send your inquiry right now. Please try again." });
  }

  // Email succeeded — store the record too (best effort; never blocks or
  // downgrades the success response the visitor already earned).
  try {
    await Inquiry.create({ name, email, phone, shopName, subject, message, emailDelivered: true });
  } catch (dbError) {
    console.error("Save Inquiry Error:", dbError.message);
  }

  return res.status(201).json({ success: true, message: "Your message has been sent. Our team will get back to you soon." });
});

module.exports = router;
