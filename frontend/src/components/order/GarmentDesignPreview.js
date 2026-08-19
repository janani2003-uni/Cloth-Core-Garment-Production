// src/components/order/GarmentDesignPreview.js
// Composites an uploaded logo onto the actual garment/color the shop owner
// selected in Step 1 — a real visual preview (not a bare file icon, not
// always a generic T-Shirt), using a simple, sensible default placement
// (centered, chest-height) rather than a full graphic editor. Reused on
// Step 2 (design selection), Step 4 (Review), and the Admin/Supervisor
// order-approval view so all three show the exact same preview.
//
// AI-generated designs don't use this component — the AI prompt already
// bakes the selected garment/color into the generated image itself (see
// backend/routes/designRoutes.js), so that image is shown directly as-is.
import React from "react";
import { getGarmentImage } from "../../utils/garmentImages";

const UPLOAD_BASE_URL = "http://localhost:5000";

// A logo path can be either a real server path ("/uploads/designs/xxx.png",
// resolved against the backend) or a client-only data URL (instant preview
// right after choosing a file, before the upload round-trip resolves).
function resolveLogoSrc(path) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `${UPLOAD_BASE_URL}${path}`;
}

function GarmentDesignPreview({ garmentName, colorLabel, colorHex, logoPath, height = 300 }) {
  const garmentImage = getGarmentImage(garmentName);
  const logoSrc = resolveLogoSrc(logoPath);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 16,
        overflow: "hidden",
        background: "#f1eeee",
      }}
    >
      {/* The bundled garment photos are portrait model shots (head down to
          roughly the waist) — with a short/landscape preview box, cropping
          from the top ("top center") only ever shows the model's face and
          never reaches the chest, which is where the logo below is placed.
          Centering the crop instead reliably keeps the chest/torso in view
          (where a printed logo actually belongs) regardless of the exact
          box height a caller passes in. */}
      <img
        src={garmentImage}
        alt={garmentName || "Garment"}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
      />

      {/* Subtle color wash so the preview reflects the selected color
          without needing a per-color photo of every garment. */}
      {colorHex && colorHex.toLowerCase() !== "#ffffff" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: colorHex,
            opacity: 0.32,
            mixBlendMode: "multiply",
            pointerEvents: "none",
          }}
        />
      )}

      {logoSrc && (
        <img
          src={logoSrc}
          alt="Logo preview on garment"
          style={{
            position: "absolute",
            // Lands mid-chest with the centered crop above — verified
            // against the actual bundled T-Shirt photo's proportions
            // (collar ~visible near the top of the crop, chest ~centered).
            top: "42%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "30%",
            maxHeight: "20%",
            objectFit: "contain",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(25,0,25,0.55) 0%, rgba(25,0,25,0) 45%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        <span>{garmentName || "Garment"}</span>
        <span>{colorLabel || ""}</span>
      </div>
    </div>
  );
}

export default GarmentDesignPreview;
