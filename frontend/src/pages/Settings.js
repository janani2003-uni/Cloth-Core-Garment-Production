import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import { getUser } from "../utils/auth";
import { formatRoleLabel } from "../utils/roles";

const ME_API_URL = "http://localhost:5000/api/auth/me";
const PASSWORD_API_URL = "http://localhost:5000/api/auth/me/password";
const SETTINGS_API_URL = "http://localhost:5000/api/settings";
const BUSINESS_RULES_API_URL = "http://localhost:5000/api/settings/business-rules";

const ADMIN_TOGGLES = [
  { key: "orderUpdates", label: "New order notifications" },
  { key: "productionAlerts", label: "Production alerts" },
  { key: "deliveryAlerts", label: "Delivery alerts" },
  { key: "paymentAlerts", label: "Payment alerts" },
  { key: "reminders", label: "Reminders" },
];

const SHOP_OWNER_TOGGLES = [
  { key: "orderUpdates", label: "Order status updates" },
  { key: "productionAlerts", label: "Production progress updates" },
  { key: "deliveryAlerts", label: "Delivery updates" },
  { key: "paymentAlerts", label: "Payment verification updates" },
  { key: "reminders", label: "Reminders" },
];

// Update the cached user object in whichever storage getUser() found it in,
// so the rest of the app sees the freshly-saved profile immediately.
function updateStoredUser(updatedUser) {
  if (localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  } else if (sessionStorage.getItem("user")) {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  }
}

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get activeTab from location state or default to "profile"
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // Check if location state has activeTab
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const currentUser = getUser();
  const isAdminUser = currentUser?.role === "admin";

  // ==========================
  // System Settings (Admin only)
  // ==========================
  const [systemSettingsLoading, setSystemSettingsLoading] = useState(true);
  const [systemSettingsSaving, setSystemSettingsSaving] = useState(false);
  const [orderIdPrefixInput, setOrderIdPrefixInput] = useState("");

  useEffect(() => {
    if (!isAdminUser) {
      setSystemSettingsLoading(false);
      return;
    }

    axios
      .get(SETTINGS_API_URL)
      .then((response) => {
        setOrderIdPrefixInput(response.data.data.orderIdPrefix || "ORD");
      })
      .catch((err) => {
        console.error("Load System Settings Error:", err);
      })
      .finally(() => {
        setSystemSettingsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    try {
      setSystemSettingsSaving(true);
      const response = await axios.put(SETTINGS_API_URL, {
        orderIdPrefix: orderIdPrefixInput.trim(),
      });
      setOrderIdPrefixInput(response.data.data.orderIdPrefix);
      alert("System settings updated successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Could not update system settings.");
    } finally {
      setSystemSettingsSaving(false);
    }
  };

  // ==========================
  // Profile Settings
  // ==========================
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    factoryName: "",
  });
  const [accountInfo, setAccountInfo] = useState(null);

  useEffect(() => {
    const storedUser = getUser();

    if (!storedUser) {
      setProfileLoading(false);
      return;
    }

    axios
      .get(ME_API_URL)
      .then((response) => {
        const user = response.data;

        setProfileForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          factoryName: user.factoryName || "",
        });
        setAccountInfo({
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        });
      })
      .catch((err) => {
        console.error("Load Profile Error:", err);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    const storedUser = getUser();

    if (!storedUser) {
      alert("Could not determine your account. Please log in again.");
      return;
    }

    if (
      !profileForm.firstName.trim() ||
      !profileForm.lastName.trim() ||
      !profileForm.factoryName.trim()
    ) {
      alert("First name, last name and factory name are required.");
      return;
    }

    try {
      setProfileSaving(true);

      const response = await axios.put(ME_API_URL, {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        factoryName: profileForm.factoryName.trim(),
      });

      const updatedUser = { ...storedUser, ...response.data.user };
      updateStoredUser(updatedUser);

      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Update Profile Error:", err);

      alert(
        err.response?.data?.message || "Could not update your profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // ==========================
  // Notification Preferences (real, persisted on User.notificationPreferences)
  // ==========================
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");
  const [prefs, setPrefs] = useState(null);
  const toggles = isAdminUser ? ADMIN_TOGGLES : SHOP_OWNER_TOGGLES;

  useEffect(() => {
    axios
      .get(ME_API_URL)
      .then((response) => {
        setPrefs(response.data.notificationPreferences || {
          orderUpdates: true, productionAlerts: true, deliveryAlerts: true, paymentAlerts: true, reminders: true,
        });
      })
      .catch((err) => console.error("Load Notification Preferences Error:", err))
      .finally(() => setPrefsLoading(false));
  }, []);

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrefs = async () => {
    const storedUser = getUser();
    try {
      setPrefsSaving(true);
      setPrefsMessage("");
      const response = await axios.put(ME_API_URL, { notificationPreferences: prefs });
      updateStoredUser({ ...storedUser, notificationPreferences: response.data.user.notificationPreferences });
      setPrefsMessage("Preferences saved.");
    } catch (err) {
      setPrefsMessage(err.response?.data?.message || "Could not save preferences.");
    } finally {
      setPrefsSaving(false);
    }
  };

  // ==========================
  // Business rules (Admin-only, read-only — configured via backend env vars,
  // see backend/config/businessRules.js; shown here for visibility only)
  // ==========================
  const [businessRules, setBusinessRules] = useState(null);

  useEffect(() => {
    if (!isAdminUser) return;
    axios
      .get(BUSINESS_RULES_API_URL)
      .then((response) => setBusinessRules(response.data.data))
      .catch((err) => console.error("Load Business Rules Error:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // Browser notification permission (real browser API, no backend needed)
  // ==========================
  const getBrowserNotificationStatus = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "Not supported in this browser";
    }
    if (Notification.permission === "granted") return "Enabled";
    if (Notification.permission === "denied") return "Blocked";
    return "Disabled";
  };

  const [browserNotificationStatus, setBrowserNotificationStatus] = useState(
    getBrowserNotificationStatus()
  );

  const handleEnableBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setBrowserNotificationStatus(getBrowserNotificationStatus());

    if (permission === "granted") {
      new Notification("ClothCore", {
        body: "Browser notifications are now enabled.",
      });
    }
  };

  // ==========================
  // Security Settings (change password)
  // ==========================
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword) {
      alert("Please enter your current password.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      setPasswordSaving(true);

      await axios.put(PASSWORD_API_URL, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      alert("Password updated successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Update Password Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not update your password. Please try again later."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const settingsCard = (
          <div className="card admin-content-card" style={{
            borderRadius: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            <div className="card-body p-0">
              <div className="row g-0">
                {/* Left Menu */}
                <div
                  className="col-md-3 border-end p-4"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--clothcore-border)" }}
                >
                  <h3 className="fw-bold mb-4" style={{ color: "var(--clothcore-blush)" }}>
                    Settings
                  </h3>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "profile" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("profile")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "profile" ? "600" : "400"
                    }}
                  >
                    👤 Profile Settings
                  </button>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "security" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("security")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "security" ? "600" : "400"
                    }}
                  >
                    🔒 Security & Privacy
                  </button>

                  <button
                    className={`btn w-100 text-start mb-3 ${activeTab === "notifications" ? "btn-primary" : "btn-light"}`}
                    onClick={() => setActiveTab("notifications")}
                    style={{
                      borderRadius: "12px",
                      padding: "12px 16px",
                      fontWeight: activeTab === "notifications" ? "600" : "400"
                    }}
                  >
                    🔔 Notifications
                  </button>

                  {isAdminUser && (
                    <button
                      className={`btn w-100 text-start mb-3 ${activeTab === "system" ? "btn-primary" : "btn-light"}`}
                      onClick={() => setActiveTab("system")}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px",
                        fontWeight: activeTab === "system" ? "600" : "400"
                      }}
                    >
                      ⚙️ System Settings
                    </button>
                  )}

                  <div className="mt-5">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => navigate(isAdminUser ? "/admin-dashboard" : "/dashboard")}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px"
                      }}
                    >
                      ← Back to Dashboard
                    </button>
                  </div>
                </div>

                {/* Right Side */}
                <div className="col-md-9 p-4">
                  {activeTab === "profile" && (
                    <>
                      <div className="d-flex justify-content-between mb-4">
                        <div>
                          <h3 className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                            Profile Settings
                          </h3>
                          <p className="text-muted">
                            Manage your personal information.
                          </p>
                        </div>
                      </div>
                      <hr />

                      <div className="row mt-4">
                        {/* Profile Image */}
                        <div className="col-md-3 text-center">
                          <div
                            className="rounded-circle mx-auto mb-3"
                            style={{
                              width: "130px",
                              height: "130px",
                              background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "48px",
                              fontWeight: "bold"
                            }}
                          >
                            {`${profileForm.firstName?.[0] || ""}${profileForm.lastName?.[0] || ""}`.toUpperCase() || "?"}
                          </div>
                        </div>

                        {/* Form Section */}
                        <div className="col-md-9">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">First Name</label>
                              <input
                                type="text"
                                name="firstName"
                                className="form-control"
                                value={profileForm.firstName}
                                onChange={handleProfileChange}
                                disabled={profileLoading || profileSaving}
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid var(--clothcore-border)"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Last Name</label>
                              <input
                                type="text"
                                name="lastName"
                                className="form-control"
                                value={profileForm.lastName}
                                onChange={handleProfileChange}
                                disabled={profileLoading || profileSaving}
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid var(--clothcore-border)"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Email Address</label>
                              <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={profileForm.email}
                                disabled
                                title="Email address cannot be changed from this form."
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid var(--clothcore-border)",
                                  background: "rgba(255,255,255,0.03)",
                                  color: "var(--clothcore-text-muted)"
                                }}
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">Factory Name</label>
                              <input
                                type="text"
                                name="factoryName"
                                className="form-control"
                                value={profileForm.factoryName}
                                onChange={handleProfileChange}
                                disabled={profileLoading || profileSaving}
                                style={{
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  border: "2px solid var(--clothcore-border)"
                                }}
                              />
                            </div>
                          </div>

                          <div className="text-end">
                            <button
                              className="btn px-4"
                              onClick={handleProfileSave}
                              disabled={profileLoading || profileSaving}
                              style={{
                                background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                                color: "white",
                                borderRadius: "12px",
                                border: "none",
                                padding: "12px 32px",
                                fontWeight: "600"
                              }}>
                              {profileSaving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "security" && (
                    <>
                      <h3 className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                        Security & Privacy
                      </h3>
                      <p className="text-muted">
                        Keep your account safe.
                      </p>
                      <hr />

                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="card admin-content-card" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-4">Change Password</h5>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Current Password</label>
                                <input
                                  type="password"
                                  name="currentPassword"
                                  className="form-control"
                                  value={passwordForm.currentPassword}
                                  onChange={handlePasswordChange}
                                  disabled={passwordSaving}
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid var(--clothcore-border)"
                                  }}
                                />
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">New Password</label>
                                <input
                                  type="password"
                                  name="newPassword"
                                  className="form-control"
                                  value={passwordForm.newPassword}
                                  onChange={handlePasswordChange}
                                  disabled={passwordSaving}
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid var(--clothcore-border)"
                                  }}
                                />
                                <div className="form-text">
                                  Must be at least 8 characters long.
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="form-label fw-bold">Confirm Password</label>
                                <input
                                  type="password"
                                  name="confirmPassword"
                                  className="form-control"
                                  value={passwordForm.confirmPassword}
                                  onChange={handlePasswordChange}
                                  disabled={passwordSaving}
                                  style={{
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    border: "2px solid var(--clothcore-border)"
                                  }}
                                />
                              </div>
                              <button
                                className="btn w-100"
                                onClick={handlePasswordUpdate}
                                disabled={passwordSaving}
                                style={{
                                  background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                                  color: "white",
                                  borderRadius: "12px",
                                  border: "none",
                                  padding: "12px",
                                  fontWeight: "600"
                                }}>
                                {passwordSaving ? "Updating..." : "Update Password"}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card admin-content-card" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-4">Account Overview</h5>
                              {!accountInfo ? (
                                <div className="spinner-border spinner-border-sm" role="status" style={{ color: "var(--clothcore-mauve)" }} />
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                  {[
                                    { label: "Role", value: formatRoleLabel(accountInfo.role) },
                                    { label: "Account Status", value: accountInfo.status || "Active" },
                                    { label: "Member Since", value: accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString() : "N/A" },
                                    { label: "Last Login", value: accountInfo.lastLogin ? new Date(accountInfo.lastLogin).toLocaleString() : "N/A" },
                                  ].map((row) => (
                                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                      <span style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>{row.label}</span>
                                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--clothcore-text)" }}>{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className="text-muted small mb-0 mt-3">
                                Your role and account status are managed by an administrator.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "notifications" && (
                    <>
                      <h3 className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                        Notifications
                      </h3>
                      <p className="text-muted">
                        Choose how you want to receive notifications.
                      </p>
                      <hr />

                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="card admin-content-card" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-4">Notification Preferences</h5>
                              {prefsLoading || !prefs ? (
                                <div className="spinner-border spinner-border-sm" role="status" style={{ color: "var(--clothcore-mauve)" }} />
                              ) : (
                                <>
                                  {toggles.map((t) => (
                                    <div key={t.key} className="d-flex justify-content-between align-items-center mb-3">
                                      <span style={{ fontSize: "13.5px", color: "var(--clothcore-text)" }}>{t.label}</span>
                                      <div className="form-check form-switch mb-0">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={!!prefs[t.key]}
                                          onChange={() => togglePref(t.key)}
                                          style={{ cursor: "pointer" }}
                                        />
                                      </div>
                                    </div>
                                  ))}

                                  {prefsMessage && (
                                    <div style={{ fontSize: "12.5px", color: prefsMessage.includes("saved") ? "var(--clothcore-success)" : "var(--clothcore-danger)", marginBottom: "8px" }}>
                                      {prefsMessage}
                                    </div>
                                  )}

                                  <button
                                    className="btn"
                                    onClick={handleSavePrefs}
                                    disabled={prefsSaving}
                                    style={{
                                      background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                                      color: "white",
                                      borderRadius: "12px",
                                      border: "none",
                                      padding: "10px 24px",
                                      fontWeight: "600",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {prefsSaving ? "Saving..." : "Save Preferences"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card admin-content-card mb-3" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5>Browser Notifications</h5>
                              <p className="text-muted">
                                Status: {browserNotificationStatus}
                              </p>
                              <button
                                className="btn btn-outline-secondary"
                                style={{ borderRadius: "12px" }}
                                onClick={handleEnableBrowserNotifications}
                                disabled={browserNotificationStatus !== "Disabled"}
                              >
                                Enable
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "system" && isAdminUser && (
                    <>
                      <h3 className="fw-bold" style={{ color: "var(--clothcore-blush)" }}>
                        System Settings
                      </h3>
                      <p className="text-muted">
                        System-wide configuration for the whole ClothCore installation.
                      </p>
                      <hr />

                      <div className="row mt-4">
                        <div className="col-md-6">
                          <div className="card admin-content-card" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-3">Order ID Format</h5>
                              <p className="text-muted small">
                                Every new order gets an ID like <strong>{(orderIdPrefixInput || "ORD")}-{new Date().getFullYear()}-001</strong>.
                                Change the prefix below — it only affects orders created after saving.
                              </p>
                              <form onSubmit={handleSaveSystemSettings}>
                                <div className="mb-3">
                                  <label className="form-label fw-bold">Order ID Prefix</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={orderIdPrefixInput}
                                    onChange={(e) => setOrderIdPrefixInput(e.target.value.toUpperCase())}
                                    disabled={systemSettingsLoading || systemSettingsSaving}
                                    maxLength={10}
                                    style={{
                                      borderRadius: "12px",
                                      padding: "12px 16px",
                                      border: "2px solid var(--clothcore-border)"
                                    }}
                                  />
                                  <div className="form-text">
                                    2–10 characters, letters and numbers only (e.g. ORD, CC, GARM).
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="btn px-4"
                                  disabled={systemSettingsLoading || systemSettingsSaving}
                                  style={{
                                    background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
                                    color: "white",
                                    borderRadius: "12px",
                                    border: "none",
                                    padding: "12px 32px",
                                    fontWeight: "600"
                                  }}
                                >
                                  {systemSettingsSaving ? "Saving..." : "Save Changes"}
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="card admin-content-card" style={{
                            borderRadius: "16px",
                            boxShadow: "var(--clothcore-shadow)"
                          }}>
                            <div className="card-body">
                              <h5 className="mb-3">Business Rules</h5>
                              <p className="text-muted small">
                                Configured via environment variables on the server — see <code>MINIMUM_ORDER_QUANTITY</code> and{" "}
                                <code>ADVANCE_PAYMENT_PERCENTAGE</code> in <code>backend/.env</code>. Shown here read-only.
                              </p>
                              {!businessRules ? (
                                <div className="spinner-border spinner-border-sm" role="status" style={{ color: "var(--clothcore-mauve)" }} />
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    <span style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>Minimum Order Quantity</span>
                                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--clothcore-text)" }}>{businessRules.minimumOrderQuantity} pcs</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                                    <span style={{ fontSize: "13px", color: "var(--clothcore-text-soft)" }}>Advance Payment Percentage</span>
                                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--clothcore-text)" }}>{businessRules.advancePaymentPercentage}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
  );

  if (isAdminUser) {
    return (
      <AdminLayout>
            {settingsCard}
      </AdminLayout>
    );
  }

  return (
    <ShopOwnerLayout>
          {settingsCard}
    </ShopOwnerLayout>
  );
}

export default Settings;