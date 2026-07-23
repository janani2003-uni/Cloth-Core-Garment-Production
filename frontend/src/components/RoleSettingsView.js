// src/components/RoleSettingsView.js
// Settings view for Supervisor — password change and notification
// preferences. `toggles` lets only the relevant preference rows show,
// backed by the User.notificationPreferences sub-document.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getUser } from "../utils/auth";

const ME_URL = "http://localhost:5000/api/auth/me";
const PASSWORD_URL = "http://localhost:5000/api/auth/me/password";

// Update the cached user object in whichever storage getUser() found it in
// (localStorage for "remember me", sessionStorage otherwise), so the rest of
// the app sees the freshly-saved preferences immediately without switching
// which storage the session lives in.
function updateStoredUser(updatedUser) {
  if (localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  } else if (sessionStorage.getItem("user")) {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  }
}

function RoleSettingsView({ heading, subtitle, toggles }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ME_URL);
      setPrefs(res.data.notificationPreferences || {
        orderUpdates: true, productionAlerts: true, deliveryAlerts: true, paymentAlerts: true, reminders: true,
      });
    } catch (err) {
      console.error("Fetch Me Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePrefs = async () => {
    try {
      setSavingPrefs(true);
      setPrefsMessage("");
      const res = await axios.put(ME_URL, { notificationPreferences: prefs });
      const currentUser = getUser();
      updateStoredUser({ ...currentUser, notificationPreferences: res.data.user.notificationPreferences });
      setPrefsMessage("Preferences saved.");
    } catch (err) {
      setPrefsMessage(err.response?.data?.message || "Could not save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      await axios.put(PASSWORD_URL, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--clothcore-text)", marginBottom: "4px" }}>{heading}</h2>
        <p style={{ fontSize: "14px", color: "var(--clothcore-text-soft)", marginBottom: "0" }}>{subtitle}</p>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Notification Preferences</h3>

            {loading || !prefs ? (
              <div className="spinner-border spinner-border-sm" role="status" style={{ color: "var(--clothcore-mauve)" }} />
            ) : (
              <>
                {toggles.map((t) => (
                  <label key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                    <span style={{ fontSize: "13.5px", color: "var(--clothcore-text)" }}>{t.label}</span>
                    <input type="checkbox" checked={!!prefs[t.key]} onChange={() => togglePref(t.key)} style={{ width: "18px", height: "18px", accentColor: "var(--clothcore-mauve)" }} />
                  </label>
                ))}

                {prefsMessage && (
                  <div style={{ marginTop: "12px", fontSize: "12.5px", color: prefsMessage.includes("saved") ? "var(--clothcore-success)" : "var(--clothcore-danger)" }}>
                    {prefsMessage}
                  </div>
                )}

                <button className="admin-btn-primary" style={{ marginTop: "16px" }} onClick={savePrefs} disabled={savingPrefs}>
                  {savingPrefs ? "Saving..." : "Save Preferences"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Account Security</h3>

            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Current Password</label>
                <input
                  type="password"
                  className="form-control admin-select"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>New Password</label>
                <input
                  type="password"
                  className="form-control admin-select"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control admin-select"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>

              {passwordError && <div style={{ fontSize: "12.5px", color: "var(--clothcore-danger)" }}>{passwordError}</div>}
              {passwordMessage && <div style={{ fontSize: "12.5px", color: "var(--clothcore-success)" }}>{passwordMessage}</div>}

              <button type="submit" className="admin-btn-primary" disabled={savingPassword} style={{ alignSelf: "flex-start" }}>
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoleSettingsView;
