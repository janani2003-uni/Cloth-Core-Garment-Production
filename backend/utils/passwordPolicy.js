// backend/utils/passwordPolicy.js
// Single source of truth for the password rule, mirrored by
// frontend/src/utils/passwordPolicy.js. Registration and password reset
// must never diverge, so both frontend forms and every backend route that
// sets a password import from one of these two files instead of redefining
// the regex locally.
const PASSWORD_REGEX =
  /^(?=(.*[!@#$%^&*(),.?":{}|<>]){2,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;

const PASSWORD_REQUIREMENTS_MESSAGE =
  "Password must be 8-20 characters and include at least 2 special characters, 1 uppercase letter, 1 lowercase letter and 1 number.";

module.exports = { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE };
