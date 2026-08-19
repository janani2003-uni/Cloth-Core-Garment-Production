// src/utils/garmentImages.js
// Maps a garment's display name (as saved on the order draft / Order
// document, e.g. "Denim", "Shirt", "T-Shirt", "Hoodie" — see the product
// catalog seed in backend/routes/productRoutes.js) to its bundled photo, so
// the Step 2 logo-on-garment preview, Step 4 Review, and the Admin/
// Supervisor approval view can all render the ACTUAL selected garment
// instead of a generic placeholder. Same 4 bundled photos OrderStep1.js
// already uses for the catalog cards.
import denimImage from "../assets/denim.jpg.png";
import shirtImage from "../assets/shirt.jpg.png";
import tshirtImage from "../assets/tshirt.jpg.png";
import hoodieImage from "../assets/hoodie.jpg.png";

const NAME_TO_IMAGE = {
  denim: denimImage,
  shirt: shirtImage,
  "t-shirt": tshirtImage,
  tshirt: tshirtImage,
  hoodie: hoodieImage,
};

export function getGarmentImage(garmentName) {
  const key = String(garmentName || "").trim().toLowerCase();
  if (NAME_TO_IMAGE[key]) return NAME_TO_IMAGE[key];
  // Loose fallback for any future catalog entry whose name doesn't match
  // exactly (e.g. "Denim Jacket") — match by substring rather than show
  // nothing.
  if (key.includes("denim")) return denimImage;
  if (key.includes("hoodie")) return hoodieImage;
  if (key.includes("t-shirt") || key.includes("tshirt") || key.includes("tee")) return tshirtImage;
  if (key.includes("shirt")) return shirtImage;
  return tshirtImage;
}
