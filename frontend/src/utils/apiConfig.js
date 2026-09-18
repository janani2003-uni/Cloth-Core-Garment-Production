// Central place for the backend's base URL. Every page used to hardcode
// "http://localhost:5000" individually (50+ files) — this keeps the same
// default behavior but makes it overridable per environment via
// REACT_APP_API_URL (e.g. a real deployment, or a different port) without
// touching every file that calls the API.
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
