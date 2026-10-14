const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { Jimp, JimpMime } = require("jimp");
const { verifyToken } = require("../middleware/authMiddleware");
const { uploadDesign, handleUpload, toWebPath, UPLOAD_ROOT } = require("../middleware/upload");

const router = express.Router();

router.use(verifyToken);

// POST /api/design/upload-logo
// Step 2's "Upload Your Logo" method — a real disk-backed file (JPG/JPEG/
// PNG/WEBP), the same upload architecture as Shop Logo. Returns only the
// relative web path; the frontend saves that path onto the order draft
// (design.uploadedLogoPath) rather than ever holding the raw file as
// base64. Kept as its own endpoint (distinct from the Shop Logo endpoint)
// because these are logically separate assets — an order can use a
// freshly-uploaded logo even after the shop's saved Shop Logo changes.
router.post("/upload-logo", handleUpload(uploadDesign, "logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No logo file was provided." });
  }
  return res.status(200).json({
    success: true,
    path: toWebPath(req.file, "designs"),
    fileName: req.file.originalname,
  });
});

const MIN_PROMPT_LENGTH = 8;
const MAX_PROMPT_LENGTH = 500;
const MIN_SECONDS_BETWEEN_REQUESTS = 5;

// Simple in-memory throttle per user — this is a single-process safeguard
// against a runaway frontend loop hammering the free inference API, not a
// distributed rate limiter. Good enough since the project has no shared
// rate-limit middleware yet.
const lastRequestAtByUser = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/design/generate
// Body: { prompt: string }
// Uses Hugging Face's free Inference API (no billing required — a free
// account + access token is enough). The model responds with raw image
// bytes, which we base64-encode into a data URI so the frontend can render
// it directly with no separate hosting/storage needed. The key is read only
// from the backend environment — never sent to or embedded in frontend code.
router.post("/generate", async (req, res) => {
  const prompt = (req.body?.prompt || "").trim();
  // What the shop owner actually picked in Step 1 — the preview should
  // show their design on the garment/color they're ordering, not always a
  // generic white t-shirt regardless of the real selection.
  const garmentType = (req.body?.garmentType || "").trim().slice(0, 60) || "t-shirt";
  const color = (req.body?.color || "").trim().slice(0, 60) || "white";

  if (!prompt) {
    return res.status(400).json({ success: false, message: "Please describe the design you want to generate." });
  }
  if (prompt.length < MIN_PROMPT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Please provide a bit more detail (at least ${MIN_PROMPT_LENGTH} characters).`,
    });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Description is too long (max ${MAX_PROMPT_LENGTH} characters).`,
    });
  }

  const userId = String(req.user?.id || req.user?._id || "anonymous");
  const now = Date.now();
  const lastAt = lastRequestAtByUser.get(userId) || 0;
  if (now - lastAt < MIN_SECONDS_BETWEEN_REQUESTS * 1000) {
    return res.status(429).json({ success: false, message: "Please wait a moment before generating again." });
  }
  lastRequestAtByUser.set(userId, now);

  const apiKey = process.env.HF_API_TOKEN;
  if (!apiKey) {
    console.error("Design generation requested but HF_API_TOKEN is not set.");
    return res.status(503).json({
      success: false,
      message: "AI design generation isn't configured yet. Please contact support or upload a design instead.",
    });
  }

  const model = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-3-medium-diffusers";
  // Render the customer's design as a mockup on the actual garment/color
  // they selected in Step 1 — not just the isolated logo/artwork, and not
  // always a generic white t-shirt regardless of what they're ordering.
  const enhancedPrompt = `Product photo of a ${color} ${garmentType} with the following design printed on the front and centered on the chest: ${prompt}. The garment is a realistic ${color.toLowerCase()} ${garmentType.toLowerCase()}, on a plain neutral studio background, front view, flat lay or worn mockup, professional apparel product photography, sharp focus.`;

  async function callHuggingFace() {
    return axios.post(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      { inputs: enhancedPrompt, options: { wait_for_model: true } },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );
  }

  try {
    let response;
    try {
      response = await callHuggingFace();
    } catch (firstError) {
      // Free-tier models that haven't been used recently return 503 while
      // they spin up — wait_for_model should handle this, but as a
      // safeguard, retry once after a short pause on a 503.
      if (firstError.response?.status === 503) {
        await sleep(8000);
        response = await callHuggingFace();
      } else {
        throw firstError;
      }
    }

    const contentType = response.headers["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      // The API returns JSON errors with a 200/4xx status sometimes — surface
      // whatever it said instead of guessing.
      let detail = "";
      try {
        detail = JSON.parse(Buffer.from(response.data).toString("utf8"))?.error || "";
      } catch {
        // not JSON, ignore
      }
      console.error("Design generation: unexpected response type from provider:", contentType, detail);
      return res.status(502).json({ success: false, message: "The design service returned an unexpected response. Please try again." });
    }

    const base64 = Buffer.from(response.data).toString("base64");
    const imageUrl = `data:${contentType};base64,${base64}`;

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ success: false, message: "The design service timed out. Please try again." });
    }

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.error("Design generation: provider rejected the API token.");
      return res.status(502).json({ success: false, message: "AI design generation is temporarily unavailable. Please try again later." });
    }
    if (status === 429) {
      return res.status(429).json({ success: false, message: "The design service is busy right now. Please try again shortly." });
    }
    // The provider account is out of inference credits — distinct from a
    // bad prompt, and no amount of rephrasing fixes it. Surfacing the
    // actual cause instead of the generic 4xx message below so this isn't
    // mistaken for a prompt problem.
    if (status === 402) {
      console.error("Design generation: provider account has no remaining inference credits.");
      return res.status(503).json({ success: false, message: "AI design generation is temporarily unavailable (the service account is out of credits). Please upload a design instead, or contact support." });
    }
    if (status >= 400 && status < 500) {
      console.error("Design generation: provider rejected the request.", status, (() => {
        try { return JSON.parse(Buffer.from(error.response?.data || "").toString("utf8")); } catch { return error.response?.data; }
      })());
      return res.status(400).json({ success: false, message: "The design description couldn't be processed. Try rephrasing it." });
    }

    console.error("Design generation error:", error.message);
    return res.status(502).json({ success: false, message: "Could not reach the design service. Please try again." });
  }
});

// Resolves a client-supplied "/uploads/<subfolder>/<file>" web path back
// to the real file on disk, refusing anything that isn't actually inside
// backend/uploads (path traversal, absolute paths, other hosts) and
// anything that doesn't exist. Returns null rather than throwing so
// callers can return a clean 400 instead of a stack trace.
function resolveUploadedFileDiskPath(webPath) {
  if (typeof webPath !== "string" || !webPath.startsWith("/uploads/")) return null;
  const relative = webPath.slice("/uploads/".length);
  const resolved = path.join(UPLOAD_ROOT, relative);
  if (resolved !== UPLOAD_ROOT && !resolved.startsWith(UPLOAD_ROOT + path.sep)) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

// POST /api/design/mockup
// Body: { logoPath: string, garmentType?: string, color?: string }
// Step 2's "same feature as AI generation" for an uploaded logo: a
// photorealistic mockup of the actual garment/color, generated the same
// way /generate does. The key difference is deliberate — the logo/QR code
// itself is NEVER re-rendered through the AI model (diffusion models don't
// reliably preserve fine graphic detail like a QR code or exact logo
// shape; running one back through image generation risks making it
// unscannable or visibly wrong). Instead, the AI generates a plain, blank
// garment photo, and the shop owner's exact uploaded file is composited
// onto it pixel-for-pixel afterwards with Jimp — same visual quality/
// realism as AI generation, with the actual logo guaranteed unmodified.
router.post("/mockup", async (req, res) => {
  const logoPath = typeof req.body?.logoPath === "string" ? req.body.logoPath.trim() : "";
  const garmentType = (req.body?.garmentType || "").trim().slice(0, 60) || "t-shirt";
  const color = (req.body?.color || "").trim().slice(0, 60) || "white";

  const logoDiskPath = resolveUploadedFileDiskPath(logoPath);
  if (!logoDiskPath) {
    return res.status(400).json({ success: false, message: "A valid uploaded logo is required to generate a photo preview." });
  }

  const userId = String(req.user?.id || req.user?._id || "anonymous");
  const now = Date.now();
  const lastAt = lastRequestAtByUser.get(userId) || 0;
  if (now - lastAt < MIN_SECONDS_BETWEEN_REQUESTS * 1000) {
    return res.status(429).json({ success: false, message: "Please wait a moment before generating again." });
  }
  lastRequestAtByUser.set(userId, now);

  const apiKey = process.env.HF_API_TOKEN;
  if (!apiKey) {
    console.error("Photo preview requested but HF_API_TOKEN is not set.");
    return res.status(503).json({
      success: false,
      message: "Photo preview isn't configured yet — your uploaded logo is still saved and will be used for this order.",
    });
  }

  const model = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-3-medium-diffusers";
  // Deliberately asks for a BLANK garment — no print/graphic/text — since
  // the real logo is composited on afterwards, not generated.
  const blankPrompt = `Product photo of a ${color} ${garmentType}, completely plain and blank with no print, no graphic, no logo, and no text anywhere on it. The garment is a realistic ${color.toLowerCase()} ${garmentType.toLowerCase()}, worn by a model facing directly forward with the chest fully visible and centered in frame, on a plain neutral studio background, front view, professional apparel product photography, sharp focus, even lighting.`;

  async function callHuggingFace() {
    return axios.post(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      { inputs: blankPrompt, options: { wait_for_model: true } },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );
  }

  try {
    let response;
    try {
      response = await callHuggingFace();
    } catch (firstError) {
      if (firstError.response?.status === 503) {
        await sleep(8000);
        response = await callHuggingFace();
      } else {
        throw firstError;
      }
    }

    const contentType = response.headers["content-type"] || "";
    if (!contentType.startsWith("image/")) {
      console.error("Photo preview: unexpected response type from provider:", contentType);
      return res.status(502).json({ success: false, message: "The photo preview service returned an unexpected response. Please try again." });
    }

    const garmentImg = await Jimp.read(Buffer.from(response.data));
    const logoImg = await Jimp.read(logoDiskPath);

    // Same placement convention as the frontend's tint-overlay preview
    // (GarmentDesignPreview.js: centered at 50%/42%, bounded to a ~30%
    // width × ~20% height box on the garment) so both preview styles put
    // the logo in the same spot, at the same size. Bounding BOTH
    // dimensions (not just width) matters — a customer's uploaded file is
    // often a tall/wide photo rather than a square logo, and scaling
    // purely to a target width let a portrait photo's height run
    // unconstrained, stretching it most of the way down the shirt instead
    // of sitting like a normal chest print. Scaling by the smaller of the
    // two ratios keeps the whole image inside the box either way, exactly
    // like CSS `object-fit: contain`.
    const gw = garmentImg.bitmap.width;
    const gh = garmentImg.bitmap.height;
    const maxW = gw * 0.3;
    const maxH = gh * 0.2;
    const scale = Math.min(maxW / logoImg.bitmap.width, maxH / logoImg.bitmap.height);
    const targetW = Math.max(1, Math.round(logoImg.bitmap.width * scale));
    const targetH = Math.max(1, Math.round(logoImg.bitmap.height * scale));
    logoImg.resize({ w: targetW, h: targetH });
    const x = Math.round(gw * 0.5 - targetW / 2);
    const y = Math.round(gh * 0.42 - targetH / 2);
    garmentImg.composite(logoImg, x, y);

    const outBuffer = await garmentImg.getBuffer(JimpMime.png);
    const imageUrl = `data:image/png;base64,${outBuffer.toString("base64")}`;

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ success: false, message: "The photo preview service timed out. Please try again." });
    }

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.error("Photo preview: provider rejected the API token.");
      return res.status(502).json({ success: false, message: "Photo preview is temporarily unavailable. Please try again later." });
    }
    if (status === 429) {
      return res.status(429).json({ success: false, message: "The photo preview service is busy right now. Please try again shortly." });
    }
    // Same out-of-credits case as /generate — the uploaded logo itself is
    // already saved regardless, so this only affects the photorealistic
    // preview, not the order.
    if (status === 402) {
      console.error("Photo preview: provider account has no remaining inference credits.");
      return res.status(503).json({ success: false, message: "Photo preview is temporarily unavailable (the service account is out of credits). Your uploaded logo is still saved and will be used for this order." });
    }

    console.error("Photo preview error:", error.message);
    return res.status(502).json({ success: false, message: "Could not generate a photo preview. Please try again." });
  }
});

module.exports = router;
