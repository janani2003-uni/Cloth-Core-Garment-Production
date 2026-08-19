// src/utils/passwordPolicy.js
// Single source of truth for the password rule — mirrored by
// backend/utils/passwordPolicy.js. Registration and Reset Password must
// never diverge, so both import from here instead of redefining the regex.
export const PASSWORD_REGEX =
  /^(?=(.*[!@#$%^&*(),.?":{}|<>]){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be 8–20 characters and include at least 2 special characters, 1 uppercase letter, 1 lowercase letter and 1 number.";

export const PASSWORD_REQUIREMENTS_LIST = [
  "8–20 characters",
  "At least 1 uppercase letter",
  "At least 1 lowercase letter",
  "At least 1 number",
  "At least 2 special characters",
];
