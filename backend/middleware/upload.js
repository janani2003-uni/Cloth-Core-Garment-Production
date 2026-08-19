// backend/middleware/upload.js
// Real disk-backed file uploads for Shop Logo, Step 2 design uploads, and
// payment proof — a deliberate departure from this project's older
// base64-data-URL-in-MongoDB convention. Files are saved under
// backend/uploads/<kind>/ and served statically (see server.js's
// app.use("/uploads", ...)); only the relative web path
// ("/uploads/logos/xxx.png") is ever stored in MongoDB, never the file
// bytes themselves.
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PROOF_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

function makeStorage(subfolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
      const uniqueName = `${req.user?.id || "anon"}-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, uniqueName);
    },
  });
}

function fileFilterFor(allowedMimeTypes, label) {
  return (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Unsupported file type for ${label}. Allowed: ${allowedMimeTypes.join(", ")}`));
    }
    cb(null, true);
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, matches the frontend's own limit

// Shop Logo — JPG/JPEG/PNG/WEBP only, one file per request.
const uploadLogo = multer({
  storage: makeStorage("logos"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilterFor(IMAGE_MIME_TYPES, "shop logo"),
});

// Step 2 design/logo upload — same image formats as Shop Logo.
const uploadDesign = multer({
  storage: makeStorage("designs"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilterFor(IMAGE_MIME_TYPES, "design upload"),
});

// Payment proof — JPG/JPEG/PNG/PDF.
const uploadPaymentProof = multer({
  storage: makeStorage("payment-proofs"),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilterFor(PROOF_MIME_TYPES, "payment proof"),
});

// Converts a saved file's absolute disk path into the relative web path
// that gets stored in MongoDB and served via /uploads/...
function toWebPath(file, subfolder) {
  if (!file) return "";
  return `/uploads/${subfolder}/${file.filename}`;
}

// Wraps a multer single-file middleware so its errors (wrong type, too
// large, no file) come back as a normal { success:false, message } JSON
// response instead of an unhandled exception / raw multer error page.
function handleUpload(multerMiddleware, fieldName) {
  return (req, res, next) => {
    multerMiddleware.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || "Could not upload file." });
      }
      next();
    });
  };
}

module.exports = {
  uploadLogo,
  uploadDesign,
  uploadPaymentProof,
  toWebPath,
  handleUpload,
  UPLOAD_ROOT,
};
