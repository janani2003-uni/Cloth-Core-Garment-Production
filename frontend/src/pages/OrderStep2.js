import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import OrderStepHeader from "../components/order/OrderStepHeader";
import OrderNavButtons from "../components/order/OrderNavButtons";
import GarmentDesignPreview from "../components/order/GarmentDesignPreview";
import { ORDER_COLORS as C } from "../utils/orderTheme";
import "../styles/orderFlow.css";
import {
  IconCloudUpload,
  IconPhoto,
  IconFileText,
  IconTrash,
  IconRefresh,
  IconAlertTriangle,
  IconSparkles,
  IconWand,
  IconLoader2,
  IconCheck,
  IconPalette,
  IconBuildingStore,
  IconLock,
} from "@tabler/icons-react";

const DESIGN_UPLOAD_URL = "http://localhost:5000/api/design/upload-logo";
const MY_SHOP_URL = "http://localhost:5000/api/shops/my-shop";
const UPLOAD_BASE_URL = "http://localhost:5000";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — matches backend/middleware/upload.js
const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MIN_PROMPT_LENGTH = 8;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function persistDraft(patch) {
  const existing = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");
  localStorage.setItem("clothCoreOrderDraft", JSON.stringify({ ...existing, ...patch }));
}

// A logo/design "path" saved on the draft is always a real server path
// ("/uploads/designs/xxx.png") once the upload round-trip completes —
// resolve it against the backend to actually display it.
function resolveAssetSrc(pathOrDataUrl) {
  if (!pathOrDataUrl) return "";
  if (pathOrDataUrl.startsWith("data:") || pathOrDataUrl.startsWith("http")) return pathOrDataUrl;
  return `${UPLOAD_BASE_URL}${pathOrDataUrl}`;
}

function OrderStep2() {
  const navigate = useNavigate();

  const initialDraft = JSON.parse(localStorage.getItem("clothCoreOrderDraft") || "{}");

  // design shape: { designSource: "uploaded_logo" | "ai_generated",
  //   uploadedLogoPath, uploadedLogoSource: "shop_logo" | "order_upload", fileName,
  //   prompt, generatedDesignPath }
  const [design, setDesign] = useState(initialDraft.design || null);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [aiPrompt, setAiPrompt] = useState(
    initialDraft.design?.designSource === "ai_generated" ? initialDraft.design.prompt : ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const [designNotes, setDesignNotes] = useState(initialDraft.designNotes || "");

  const [shopLogo, setShopLogo] = useState(null); // { logoPath, logoOriginalName } | null
  const [shopLogoChecked, setShopLogoChecked] = useState(false);
  // Whether to show the upload dropzone even though a Shop Logo exists —
  // set true by "Upload Different Logo".
  const [forceOwnUpload, setForceOwnUpload] = useState(false);

  useEffect(() => {
    axios
      .get(MY_SHOP_URL)
      .then((res) => {
        if (res.data?.logoPath) {
          setShopLogo({ logoPath: res.data.logoPath, logoOriginalName: res.data.logoOriginalName || "Shop Logo" });
        }
      })
      .catch(() => {
        // No shop / no logo yet — the "Use Shop Logo" option simply won't show.
      })
      .finally(() => setShopLogoChecked(true));
  }, []);

  // A garment must be picked at Step 1 before there's anything meaningful
  // to design onto — without this, a shop owner could jump straight to
  // /step2 (bookmark, back button, direct URL) with no garment selected.
  const hasGarmentSelected = Boolean(
    initialDraft.garment && initialDraft.fabric && initialDraft.color
  );

  // Logo upload / AI design generation only makes sense on a T-Shirt for
  // now — every preview/composite asset (GarmentDesignPreview, the AI
  // prompt template) is built around a T-Shirt. For any other garment,
  // Step 2 still shows (never skipped/hidden), but its two customization
  // actions are locked, and any design saved from an earlier T-Shirt
  // selection is dropped as soon as the garment changes to something else.
  const isTShirt = initialDraft.garment === "T-Shirt";

  // Once this draft has a real orderId, it's already been submitted for
  // approval — nothing about it (including the design) can be changed from
  // here anymore. See the matching comment in OrderStep1.js.
  const isLocked = Boolean(initialDraft.orderId);
  const canEditDesign = isTShirt && !isLocked;

  useEffect(() => {
    if (hasGarmentSelected && !isTShirt && !isLocked && design) {
      setDesign(null);
      persistDraft({ design: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function processFile(file) {
    if (!file) return;

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setUploadError("Unsupported file type. Please use JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File is too large. Maximum size is 5MB.");
      return;
    }

    setUploadError("");
    setAiError("");
    setIsUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await axios.post(DESIGN_UPLOAD_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nextDesign = {
        designSource: "uploaded_logo",
        uploadedLogoPath: res.data.path,
        uploadedLogoSource: "order_upload",
        fileName: file.name,
        fileSize: file.size,
      };
      setDesign(nextDesign);
      setForceOwnUpload(false);
      persistDraft({ design: nextDesign });
    } catch (err) {
      setUploadError(err.response?.data?.message || "Could not upload the file. Please try again.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleRemoveDesign = () => {
    setDesign(null);
    setUploadError("");
    setForceOwnUpload(false);
    persistDraft({ design: null });
  };

  const handleUseShopLogo = () => {
    if (!shopLogo) return;
    const nextDesign = {
      designSource: "uploaded_logo",
      uploadedLogoPath: shopLogo.logoPath,
      uploadedLogoSource: "shop_logo",
      fileName: shopLogo.logoOriginalName,
    };
    setDesign(nextDesign);
    setUploadError("");
    persistDraft({ design: nextDesign });
  };

  async function handleGenerateAI() {
    const prompt = aiPrompt.trim();
    if (prompt.length < MIN_PROMPT_LENGTH) {
      setAiError(`Please provide a bit more detail (at least ${MIN_PROMPT_LENGTH} characters).`);
      return;
    }

    setIsGenerating(true);
    setAiError("");

    try {
      const response = await axios.post("http://localhost:5000/api/design/generate", {
        prompt,
        garmentType: initialDraft.garment,
        color: initialDraft.color,
      });
      const nextDesign = {
        designSource: "ai_generated",
        prompt,
        generatedDesignPath: response.data.imageUrl,
      };
      setDesign(nextDesign);
      persistDraft({ design: nextDesign });
    } catch (err) {
      setAiError(
        err.response?.data?.message || "Could not generate a design right now. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const handleNext = () => {
    persistDraft({ designNotes, design });
    navigate("/step3");
  };

  const cardStyle = {
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(25,0,25,0.08)",
    background: "#fff",
  };

  if (!hasGarmentSelected) {
    return (
      <ShopOwnerLayout
        shellStyle={{ background: C.cream100 }}
        contentClassName="container py-4 order-flow-page"
        contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
      >
        <OrderStepHeader
          stepIndex={2}
          title="Upload Your Logo"
          subtitle="Upload your logo to preview it on your selected garment."
          icon={<IconPalette size={26} stroke={1.75} color={C.mauve500} />}
        />
        <div className="card border-0 text-center p-5" style={cardStyle}>
          <h4 className="fw-bold mb-3" style={{ color: C.plum900 }}>
            Please select a garment first
          </h4>
          <p className="mb-4" style={{ color: C.mauve500 }}>
            Choose a garment, fabric, and color in Step 1 before uploading a logo —
            the preview needs to know what you're ordering.
          </p>
          <button
            className="btn px-5 py-2 fw-bold mx-auto"
            style={{
              background: `linear-gradient(45deg, ${C.plum700}, ${C.mauve500})`,
              color: "white",
              borderRadius: "30px",
              border: "none",
              maxWidth: "220px",
            }}
            onClick={() => navigate("/step1")}
          >
            Go to Step 1
          </button>
        </div>
      </ShopOwnerLayout>
    );
  }

  const showShopLogoOption = shopLogoChecked && shopLogo && !forceOwnUpload &&
    !(design?.designSource === "uploaded_logo" && design.uploadedLogoSource === "order_upload");

  return (
    <ShopOwnerLayout
      shellStyle={{ background: C.cream100 }}
      contentClassName="container py-4 order-flow-page"
      contentStyle={{ paddingLeft: "20px", paddingRight: "20px" }}
    >
      <OrderStepHeader
        stepIndex={2}
        title="Upload Your Logo"
        subtitle="Upload your logo to preview it on your selected garment."
        icon={<IconPalette size={26} stroke={1.75} color={C.mauve500} />}
      />

      {isLocked ? (
        <div
          className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ background: "rgba(217,155,168,0.16)", border: `1.5px solid ${C.mauve500}`, borderRadius: 16 }}
          role="status"
        >
          <span
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", color: C.plum700 }}
          >
            <IconLock size={20} stroke={1.75} />
          </span>
          <div>
            <div className="fw-bold" style={{ color: C.plum900, fontSize: 14 }}>
              This order has already been submitted
            </div>
            <div style={{ color: C.mauve500, fontSize: 12.5 }}>
              You're viewing what was submitted for approval — the design can no longer be changed here. Use "Place New Order" on the Approval page to start a separate order.
            </div>
          </div>
        </div>
      ) : !isTShirt && (
        <div
          className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{ background: "rgba(217,155,168,0.16)", border: `1.5px solid ${C.mauve500}`, borderRadius: 16 }}
          role="status"
        >
          <span
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", color: C.plum700 }}
          >
            <IconLock size={20} stroke={1.75} />
          </span>
          <div>
            <div className="fw-bold" style={{ color: C.plum900, fontSize: 14 }}>
              Design customization is only available for T-Shirts
            </div>
            <div style={{ color: C.mauve500, fontSize: 12.5 }}>
              You selected {initialDraft.garment}, so logo upload and AI design generation are locked for this order.
              Click Next to continue — no design will be attached to this garment.
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Left Column - Upload, AI, Notes */}
        <div className="col-lg-7">
          {/* Upload Logo Card */}
          <div className="card border-0 mb-4" style={cardStyle}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span
                  className="badge me-3"
                  style={{
                    background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                    fontSize: "1.1rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  1
                </span>
                <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                  Upload Your Logo
                </h4>
              </div>

              {!canEditDesign && design?.designSource === "uploaded_logo" ? (
                // Locked (already submitted, or garment isn't a T-Shirt) but
                // this order already has a logo saved — show what was
                // actually submitted, read-only, instead of either a bare
                // "locked" message or (worse) still-live Replace/Remove
                // controls.
                <div
                  className="d-flex align-items-center gap-3 p-3"
                  style={{ background: C.cream100, borderRadius: 14, opacity: 0.85 }}
                >
                  <span
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 52, height: 52, borderRadius: 12, background: "#fff", overflow: "hidden" }}
                  >
                    <img
                      src={resolveAssetSrc(design.uploadedLogoPath)}
                      alt={design.fileName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-bold text-truncate" style={{ color: C.plum900, fontSize: 14 }} title={design.fileName}>
                      {design.fileName}
                    </div>
                    <div style={{ color: C.mauve500, fontSize: 12 }}>
                      {design.uploadedLogoSource === "shop_logo" ? "From your Shop Logo" : design.fileSize ? formatFileSize(design.fileSize) : "Uploaded"}
                    </div>
                  </div>
                  <span
                    className="d-flex align-items-center gap-1"
                    style={{ color: C.mauve500, fontWeight: 600, fontSize: 12 }}
                  >
                    <IconLock size={13} stroke={2} /> Locked
                  </span>
                </div>
              ) : !canEditDesign ? (
                <div
                  className="text-center p-5 d-flex flex-column align-items-center justify-content-center"
                  style={{ border: "2px dashed rgba(82,43,91,0.18)", borderRadius: 16, background: C.cream100, minHeight: 200, opacity: 0.75 }}
                >
                  <IconLock size={36} stroke={1.5} color={C.mauve500} style={{ marginBottom: 10 }} />
                  <div style={{ color: C.plum800, fontWeight: 600 }}>
                    {isLocked ? "Logo upload is locked — this order was already submitted." : `Logo upload is locked for ${initialDraft.garment}`}
                  </div>
                  <small style={{ color: C.mauve500, marginTop: 4 }}>
                    {isLocked ? "Design can't be changed after submission." : "Only available when the garment is a T-Shirt."}
                  </small>
                </div>
              ) : (
                <>
                  {showShopLogoOption && (
                    <div
                      className="d-flex align-items-center gap-3 p-3 mb-3"
                      style={{ background: C.cream100, borderRadius: 14 }}
                    >
                      <span
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, borderRadius: 12, background: "#fff", overflow: "hidden" }}
                      >
                        <img
                          src={resolveAssetSrc(shopLogo.logoPath)}
                          alt="Shop Logo"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </span>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-bold" style={{ color: C.plum900, fontSize: 14 }}>
                          Use your saved Shop Logo
                        </div>
                        <div style={{ color: C.mauve500, fontSize: 12 }}>Skip re-uploading — apply it to this order.</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm fw-bold cc-pill-cta"
                        style={{ background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`, color: "#fff", borderRadius: 20, border: "none", padding: "8px 16px" }}
                        onClick={handleUseShopLogo}
                      >
                        Use Shop Logo
                      </button>
                    </div>
                  )}

                  {design?.designSource === "uploaded_logo" ? (
                    <div
                      className="d-flex align-items-center gap-3 p-3"
                      style={{ background: C.cream100, borderRadius: 14 }}
                    >
                      <span
                        className="d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 52, height: 52, borderRadius: 12, background: "#fff", overflow: "hidden" }}
                      >
                        <img
                          src={resolveAssetSrc(design.uploadedLogoPath)}
                          alt={design.fileName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </span>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-bold text-truncate" style={{ color: C.plum900, fontSize: 14 }} title={design.fileName}>
                          {design.fileName}
                        </div>
                        <div style={{ color: C.mauve500, fontSize: 12 }}>
                          {design.uploadedLogoSource === "shop_logo" ? "From your Shop Logo" : design.fileSize ? formatFileSize(design.fileSize) : "Uploaded"}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm d-flex align-items-center gap-1 cc-outline-btn"
                        style={{ color: C.plum700, fontWeight: 600, border: `1.5px solid ${C.mauve500}`, borderRadius: 20 }}
                        onClick={() => { setForceOwnUpload(true); document.getElementById("logoUpload")?.click(); }}
                      >
                        <IconRefresh size={14} stroke={2} /> Replace
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm d-flex align-items-center gap-1 cc-outline-btn"
                        style={{ color: "#b3261e", fontWeight: 600, border: "1.5px solid rgba(179,38,30,0.35)", borderRadius: 20 }}
                        onClick={handleRemoveDesign}
                        aria-label="Remove logo"
                      >
                        <IconTrash size={14} stroke={2} />
                      </button>
                      <input
                        type="file"
                        id="logoUpload"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                      />
                    </div>
                  ) : (
                    <>
                  {showShopLogoOption && (
                    <div className="text-center mb-2">
                      <button
                        type="button"
                        className="btn btn-sm cc-text-btn"
                        style={{ background: "transparent", border: "none", color: C.mauve500, textDecoration: "underline", fontSize: 12.5 }}
                        onClick={() => setForceOwnUpload(true)}
                      >
                        or upload a different logo
                      </button>
                    </div>
                  )}
                  <div
                    className="text-center p-5"
                    style={{
                      border: dragOver ? `2px dashed ${C.mauve500}` : "2px dashed rgba(82,43,91,0.25)",
                      borderRadius: "16px",
                      background: dragOver ? C.cream100 : "#fffaf7",
                      transition: "all 0.25s ease",
                      cursor: isUploadingLogo ? "wait" : "pointer",
                      minHeight: "200px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                    onDrop={handleFileDrop}
                    onClick={() => !isUploadingLogo && document.getElementById("logoUpload").click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload your logo"
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !isUploadingLogo) {
                        document.getElementById("logoUpload").click();
                      }
                    }}
                  >
                    {isUploadingLogo ? (
                      <>
                        <IconLoader2 size={40} className="pms-spin" color={C.mauve500} style={{ marginBottom: 12 }} />
                        <div style={{ color: C.plum800, fontWeight: 600 }}>Uploading…</div>
                      </>
                    ) : (
                      <>
                        <IconCloudUpload size={44} stroke={1.5} color={C.mauve500} style={{ marginBottom: 12 }} />
                        <div style={{ color: C.plum800, fontWeight: 600 }}>Drag &amp; Drop your logo here or</div>
                        <span style={{ color: C.plum700, fontWeight: 700, textDecoration: "underline" }}>
                          Browse Files
                        </span>
                        <small style={{ color: C.mauve500, marginTop: 8 }}>JPG, JPEG, PNG, WEBP (Max 5MB)</small>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="logoUpload"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    aria-label="Logo file input"
                  />
                  {uploadError && (
                    <div
                      className="d-flex align-items-center gap-2 mt-3"
                      style={{ color: "#b3261e", fontSize: 13, fontWeight: 600 }}
                      role="alert"
                    >
                      <IconAlertTriangle size={16} stroke={2} /> {uploadError}
                    </div>
                  )}
                </>
              )}
                </>
              )}
            </div>
          </div>

          {/* AI Generation Card */}
          <div className="card border-0 mb-4" style={cardStyle}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <span
                  className="badge me-3"
                  style={{
                    background: `linear-gradient(135deg, ${C.plum700}, ${C.mauve500})`,
                    fontSize: "1.1rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white",
                  }}
                >
                  2
                </span>
                <h4 className="fw-bold mb-0" style={{ color: C.plum900 }}>
                  Create Shirt Design
                </h4>
              </div>
              <p style={{ color: C.mauve500, fontSize: 13.5, marginTop: -8, marginBottom: 16 }}>
                {canEditDesign
                  ? <>Describe the artwork or logo you have in mind and we'll generate a preview of it on your{" "}
                      {initialDraft.color} {initialDraft.garment}.</>
                  : isLocked
                  ? "This order has already been submitted, so AI design generation is locked."
                  : `AI design generation is only available when the garment is a T-Shirt. You selected ${initialDraft.garment}.`}
              </p>

              <div className="mb-3">
                <label htmlFor="aiPrompt" className="form-label fw-semibold" style={{ color: C.plum800 }}>
                  Design description
                </label>
                <textarea
                  id="aiPrompt"
                  className="form-control"
                  rows="3"
                  placeholder={canEditDesign ? "Example: A minimal cream-colored ClothCore logo, small and centered on the chest." : "Locked — only available for T-Shirt orders."}
                  style={{
                    borderRadius: "12px",
                    resize: "none",
                    background: canEditDesign ? "#fff" : C.cream100,
                    color: C.plum900,
                    border: "1.5px solid rgba(82,43,91,0.18)",
                    cursor: canEditDesign ? "text" : "not-allowed",
                  }}
                  value={aiPrompt}
                  disabled={!canEditDesign}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    if (aiError) setAiError("");
                  }}
                />
                {aiError && (
                  <div
                    className="d-flex align-items-center gap-2 mt-2"
                    style={{ color: "#b3261e", fontSize: 13, fontWeight: 600 }}
                    role="alert"
                  >
                    <IconAlertTriangle size={16} stroke={2} /> {aiError}
                  </div>
                )}
              </div>

              <button
                className="btn px-5 py-2 fw-bold d-flex align-items-center gap-2"
                style={{
                  background: `linear-gradient(45deg, ${C.plum800}, ${C.plum700})`,
                  color: "white",
                  borderRadius: "30px",
                  border: "none",
                  boxShadow: `0 4px 20px rgba(82,43,91,0.35)`,
                  opacity: canEditDesign ? 1 : 0.5,
                }}
                onClick={handleGenerateAI}
                disabled={!canEditDesign || aiPrompt.trim().length < MIN_PROMPT_LENGTH || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <IconLoader2 size={18} className="pms-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <IconWand size={18} stroke={1.75} /> Create Shirt Design
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Design Notes Card */}
          <div className="card border-0" style={cardStyle}>
            <div className="card-body p-4">
              <h4 className="fw-bold mb-1" style={{ color: C.plum900, fontSize: "1.1rem" }}>
                Design Notes / Special Instructions
              </h4>
              <p style={{ color: C.mauve500, fontSize: 12.5, marginBottom: 12 }}>
                Optional — help production get the details right.
              </p>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add placement, sizing, print method, embroidery, or other production instructions."
                style={{ borderRadius: "12px", resize: "none" }}
                value={designNotes}
                onChange={(e) => setDesignNotes(e.target.value)}
                aria-label="Design notes"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Design Preview */}
        <div className="col-lg-5">
          <div
            className="card border-0"
            style={{ ...cardStyle, boxShadow: "0 10px 40px rgba(25,0,25,0.12)", overflow: "hidden" }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${C.plum900}, ${C.plum700})`,
                padding: "20px",
                color: C.cream100,
              }}
            >
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <IconPalette size={18} stroke={1.75} /> Garment Preview
              </h5>
            </div>

            <div className="card-body p-4">
              {!isTShirt ? (
                <div
                  className="text-center p-4"
                  style={{ background: C.cream100, borderRadius: "16px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <IconLock size={48} stroke={1.25} color={C.mauve500} style={{ marginBottom: 15 }} />
                  <h6 className="fw-bold mb-1" style={{ color: C.plum900 }}>Preview not available for {initialDraft.garment}</h6>
                  <p className="small mb-0" style={{ color: C.mauve500 }}>
                    Logo and AI design previews are only shown for T-Shirt orders.
                  </p>
                </div>
              ) : isGenerating ? (
                <div
                  className="text-center p-4"
                  style={{ background: C.cream100, borderRadius: "16px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <IconLoader2 size={48} stroke={1.5} className="pms-spin" color={C.mauve500} style={{ marginBottom: 15 }} />
                  <h6 className="fw-bold mb-1" style={{ color: C.plum900 }}>Generating your design…</h6>
                  <p className="small mb-0" style={{ color: C.mauve500 }}>This can take up to a minute.</p>
                </div>
              ) : aiError ? (
                <div
                  className="text-center p-4"
                  style={{ background: C.cream100, borderRadius: "16px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <IconAlertTriangle size={48} stroke={1.5} color="#b3261e" style={{ marginBottom: 15 }} />
                  <h6 className="fw-bold mb-1" style={{ color: C.plum900 }}>Generation failed</h6>
                  <p className="small mb-3" style={{ color: C.mauve500 }}>{aiError}</p>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold cc-pill-cta"
                    style={{ background: `linear-gradient(45deg, ${C.plum800}, ${C.plum700})`, color: "white", borderRadius: 20, border: "none", padding: "8px 20px" }}
                    onClick={handleGenerateAI}
                  >
                    Retry
                  </button>
                </div>
              ) : design?.designSource === "ai_generated" ? (
                <>
                  <img
                    src={design.generatedDesignPath}
                    alt={`AI generated design: ${design.prompt}`}
                    style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 16, marginBottom: 12, boxShadow: "0 8px 24px rgba(25,0,25,0.15)" }}
                  />
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <IconSparkles size={16} stroke={2} color={C.mauve500} />
                    <h6 className="fw-bold mb-0" style={{ color: C.plum900 }}>AI Generated Design</h6>
                  </div>
                  {canEditDesign ? (
                    <button
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1 fw-bold cc-outline-btn"
                      style={{ color: C.plum700, border: `1.5px solid ${C.mauve500}`, borderRadius: 20, padding: "6px 16px" }}
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                    >
                      <IconRefresh size={14} stroke={2} /> Regenerate
                    </button>
                  ) : (
                    <span className="d-flex align-items-center gap-1" style={{ color: C.mauve500, fontWeight: 600, fontSize: 12 }}>
                      <IconLock size={13} stroke={2} /> Locked — this order has already been submitted.
                    </span>
                  )}
                </>
              ) : design?.designSource === "uploaded_logo" ? (
                <>
                  <GarmentDesignPreview
                    garmentName={initialDraft.garment}
                    colorLabel={initialDraft.color}
                    colorHex={initialDraft.colorHex}
                    logoPath={design.uploadedLogoPath}
                  />
                  <div className="d-flex align-items-center gap-2 mt-3">
                    {design.uploadedLogoSource === "shop_logo" ? (
                      <IconBuildingStore size={16} stroke={2} color={C.mauve500} />
                    ) : (
                      <IconFileText size={16} stroke={2} color={C.mauve500} />
                    )}
                    <h6 className="fw-bold mb-0" style={{ color: C.plum900, fontSize: 13.5 }}>
                      {design.uploadedLogoSource === "shop_logo" ? "Using Shop Logo" : "Uploaded Logo"}
                    </h6>
                  </div>
                </>
              ) : (
                <div
                  className="text-center p-4"
                  style={{ background: C.cream100, borderRadius: "16px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <IconPhoto size={64} stroke={1.25} color={C.mauve500} style={{ marginBottom: 15 }} />
                  <h6 className="fw-bold mb-1" style={{ color: C.plum900 }}>Your garment preview will appear here</h6>
                  <p className="small mb-0" style={{ color: C.mauve500 }}>
                    Upload your logo or generate one with AI to see it here.
                  </p>
                </div>
              )}

              {design && !isGenerating && !aiError && (
                <div
                  className="d-flex align-items-center gap-2 mt-3"
                  style={{ color: "#1f7a44", fontSize: 12.5, fontWeight: 600 }}
                >
                  <IconCheck size={14} stroke={2.5} /> Saved to your order
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OrderNavButtons
        backLabel="Back"
        nextLabel="Next: Quantities"
        onBack={() => navigate("/step1")}
        onNext={handleNext}
      />
    </ShopOwnerLayout>
  );
}

export default OrderStep2;
