// src/components/RoleSettingsView.js
// Settings view for Supervisor — notification preferences only. Account
// Security (password change) has been removed from this page per request;
// Notification Preferences is the main relevant settings section here.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ME_URL = "http://localhost:5000/api/auth/me";

// Update the cached user object in whichever storage the session lives in
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
      const stored = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : JSON.parse(sessionStorage.getItem("user") || "null");
      updateStoredUser({ ...stored, notificationPreferences: res.data.user.notificationPreferences });
      setPrefsMessage("Preferences saved.");
    } catch (err) {
      setPrefsMessage(err.response?.data?.message || "Could not save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">{heading}</h2>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="row g-3 justify-content-center">
        <div className="col-lg-7">
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Notification Preferences</h3>

            {loading || !prefs ? (
              <div className="spinner-border spinner-border-sm" role="status" style={{ color: "var(--clothcore-mauve)" }} />
            ) : (
              <>
                {toggles.map((t) => (
                  <label key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(82,43,91,0.07)", cursor: "pointer" }}>
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
      </div>
    </>
  );
}

export default RoleSettingsView;
