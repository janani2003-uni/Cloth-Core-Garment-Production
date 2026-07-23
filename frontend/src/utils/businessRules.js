import axios from "axios";

const API_URL = "http://localhost:5000/api/settings/business-rules";

// Client-side-only fallback, used purely so the UI has something sane to
// show if the request fails — the backend (backend/config/businessRules.js)
// is always the real source of truth and enforces this independently.
const FALLBACK = { minimumOrderQuantity: 100, advancePaymentPercentage: 30 };

export async function getBusinessRules() {
  try {
    const res = await axios.get(API_URL);
    return res.data.data;
  } catch (err) {
    console.error("Fetch Business Rules Error:", err);
    return FALLBACK;
  }
}
