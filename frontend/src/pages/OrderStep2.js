import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderStep2() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("original");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleGenerateAI = () => {
    if (aiPrompt.trim()) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        alert("AI design will be generated here after backend integration.");
      }, 2000);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ 
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      minHeight: "100vh"
    }}>
      <div className="container py-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="fw-bold" style={{ fontSize: "2.2rem" }}>
            <span style={{ 
              background: "linear-gradient(45deg, #f2a100, #ff6f00)",
              padding: "5px 20px",
              borderRadius: "10px",
              color: "white",
              marginRight: "15px"
            }}>
              Step 2
            </span>
            <span style={{ color: "#0b3aa0" }}>
              Design Your Garment
            </span>
          </h1>
          <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
            🎨 Upload your design or generate one with AI
          </p>
        </div>

        <div className="row">

          {/* Left Column - Upload & AI */}
          <div className="col-lg-7">

            {/* Upload Design Card */}
            <div className="card border-0 mb-4" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    1
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Upload Your Design
                  </h4>
                </div>

                {/* Drop Zone */}
                <div
                  className="border-2 border-dashed rounded-4 p-5 text-center"
                  style={{
                    border: dragOver ? "3px solid #0b3aa0" : "2px dashed #ccc",
                    background: dragOver ? "linear-gradient(135deg, #e3f2fd, #bbdefb)" : "white",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById("fileUpload").click()}
                >
                  <div style={{ fontSize: "48px", marginBottom: "15px" }}>
                    📁
                  </div>
                  <h6 className="text-muted mb-2">
                    Drag & Drop your file here or
                  </h6>
                  <span 
                    className="text-primary fw-bold"
                    style={{ 
                      textDecoration: "underline",
                      cursor: "pointer"
                    }}
                  >
                    Browse Files
                  </span>
                  <small className="text-muted mt-2">
                    JPG, PNG, PDF, AI (Max 10MB)
                  </small>
                  {fileName && (
                    <div className="mt-3 alert alert-success py-2 px-3" style={{ borderRadius: "10px" }}>
                      ✅ {fileName}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="fileUpload"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.ai"
                />
              </div>
            </div>

            {/* AI Generation Card */}
            <div className="card border-0" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <span className="badge me-3" style={{
                    background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                    fontSize: "1.2rem",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    color: "white"
                  }}>
                    2
                  </span>
                  <h4 className="fw-bold mb-0" style={{ color: "#0b3aa0" }}>
                    Or Generate with AI
                  </h4>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Describe your design...
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Example: Navy t-shirt with white logo on chest"
                    style={{ 
                      borderRadius: "12px",
                      resize: "none"
                    }}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <button
                  className="btn px-5 py-2 fw-bold"
                  style={{
                    background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                    color: "white",
                    borderRadius: "30px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(242, 161, 0, 0.4)",
                    transition: "all 0.3s ease"
                  }}
                  onClick={handleGenerateAI}
                  disabled={!aiPrompt.trim() || isGenerating}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Generating...
                    </>
                  ) : (
                    "Generate Design"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Design Preview */}
          <div className="col-lg-5">
            <div className="card border-0" style={{ 
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
              overflow: "hidden"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #0b3aa0, #1a6bff)",
                padding: "20px",
                color: "white"
              }}>
                <h5 className="fw-bold mb-0">
                  🎨 Design Preview
                </h5>
              </div>

              <div className="card-body p-4">
                {/* Tab Buttons */}
                <div className="d-flex gap-3 mb-4">
                  <button
                    className="px-4 py-2 fw-bold"
                    style={{
                      background: selectedTab === "original" 
                        ? "linear-gradient(45deg, #0b3aa0, #1a6bff)" 
                        : "white",
                      color: selectedTab === "original" ? "white" : "#0b3aa0",
                      border: selectedTab === "original" ? "none" : "2px solid #0b3aa0",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      flex: 1
                    }}
                    onClick={() => setSelectedTab("original")}
                  >
                    Original
                  </button>
                  <button
                    className="px-4 py-2 fw-bold"
                    style={{
                      background: selectedTab === "ai" 
                        ? "linear-gradient(45deg, #f2a100, #ff6f00)" 
                        : "white",
                      color: selectedTab === "ai" ? "white" : "#f2a100",
                      border: selectedTab === "ai" ? "none" : "2px solid #f2a100",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      flex: 1
                    }}
                    onClick={() => setSelectedTab("ai")}
                  >
                    AI Generated
                  </button>
                </div>

                {/* Preview Area */}
                <div className="text-center p-4" style={{
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "16px",
                  minHeight: "300px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  {selectedTab === "original" ? (
                    <>
                      <div style={{ fontSize: "64px", marginBottom: "15px" }}>
                        👕
                      </div>
                      <h6 className="text-muted">Original Design</h6>
                      <p className="text-muted small">
                        Upload your design or generate with AI
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "64px", marginBottom: "15px" }}>
                        🤖
                      </div>
                      <h6 className="text-muted">AI Generated Design</h6>
                      <p className="text-muted small">
                        AI generated design will appear here after backend integration.
                      </p>
                      <span className="badge" style={{
                        background: "linear-gradient(45deg, #f2a100, #ff6f00)",
                        padding: "8px 20px",
                        fontSize: "14px",
                        color: "white"
                      }}>
                        Coming Soon
                      </span>
                    </>
                  )}
                </div>

                {/* "Lope" text as shown in image */}
                {selectedTab === "original" && (
                  <div className="mt-3 text-center">
                    <span style={{ 
                      fontSize: "18px", 
                      fontWeight: "bold",
                      color: "#0b3aa0",
                      letterSpacing: "10px"
                    }}>
                      Lope
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <button
            className="btn px-5 py-2"
            style={{
              background: "#6c757d",
              color: "white",
              borderRadius: "30px",
              fontWeight: "bold",
              border: "none",
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate("/step1")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            ← Back
          </button>
          <button
            className="btn px-5 py-2 fw-bold"
            style={{
              background: "linear-gradient(45deg, #0b3aa0, #1a6bff)",
              color: "white",
              borderRadius: "30px",
              border: "none",
              boxShadow: "0 4px 25px rgba(11, 58, 160, 0.4)",
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate("/step3")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Next: Quantities →
          </button>
        </div>

      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeIn 0.5s ease;
          }

          .border-dashed {
            border-style: dashed;
          }

          .rounded-4 {
            border-radius: 16px;
          }

          textarea:focus {
            border-color: #0b3aa0;
            box-shadow: 0 0 0 0.2rem rgba(11, 58, 160, 0.25);
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
}

export default OrderStep2;