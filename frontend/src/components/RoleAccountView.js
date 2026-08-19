// src/components/RoleAccountView.js
// "My Account" view for Supervisor — profile display plus
// safe self-edit (name, phone). Role, employeeId, department and account
// status are read-only: a user can never change their own role.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getUser } from "../utils/auth";

const ME_URL = "http://localhost:5000/api/auth/me";

function updateStoredUser(updatedUser) {
  if (localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(updatedUser));
  } else if (sessionStorage.getItem("user")) {
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  }
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "var(--clothcore-text-muted)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: "var(--clothcore-text-soft)" }}>{value || "—"}</div>
    </div>
  );
}

function RoleAccountView({ settingsPath }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(ME_URL);
      setUser(res.data);
      setForm({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        phone: res.data.phone || "",
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

  const initials = `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() || "U";

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setMessage("First and last name are required.");
      setMessageIsError(true);
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const res = await axios.put(ME_URL, form);
      setUser(res.data.user);
      const currentUser = getUser();
      updateStoredUser({ ...currentUser, ...res.data.user });
      setMessage("Profile updated successfully.");
      setMessageIsError(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update profile.");
      setMessageIsError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status" style={{ color: "var(--clothcore-mauve)" }} />
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">My Account</h2>
          <p className="admin-page-subtitle">View and update your profile information.</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="admin-content-card" style={{ padding: "24px", textAlign: "center" }}>
            <div style={{ width: "84px", height: "84px", borderRadius: "50%", background: "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "28px", fontWeight: 700, margin: "0 auto 16px" }}>
              {initials}
            </div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--clothcore-text)" }}>{user.firstName} {user.lastName}</div>
            <div style={{ fontSize: "13px", color: "var(--clothcore-text-soft)", marginTop: "2px" }}>{user.email}</div>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              <ReadOnlyField label="Role" value={user.role} />
              {user.employeeId && <ReadOnlyField label="Employee ID" value={user.employeeId} />}
              {user.department && <ReadOnlyField label="Department" value={user.department} />}
              <ReadOnlyField label="Account Status" value={user.status} />
            </div>

            <Link to={settingsPath} className="admin-link-btn" style={{ display: "inline-block", marginTop: "16px" }}>
              Change Password →
            </Link>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="admin-content-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--clothcore-text)", marginBottom: "16px" }}>Profile Information</h3>

            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>First Name</label>
                  <input className="form-control admin-select" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Last Name</label>
                  <input className="form-control admin-select" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Email</label>
                  <input className="form-control admin-select" value={user.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                </div>
                <div className="col-md-6">
                  <label style={{ fontSize: "12px", color: "var(--clothcore-text-soft)", marginBottom: "4px", display: "block" }}>Phone Number</label>
                  <input className="form-control admin-select" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. 077 123 4567" />
                </div>
              </div>

              {message && (
                <div style={{ marginTop: "14px", fontSize: "13px", color: messageIsError ? "var(--clothcore-danger)" : "var(--clothcore-success)" }}>
                  {message}
                </div>
              )}

              <button type="submit" className="admin-btn-primary" disabled={saving} style={{ marginTop: "18px" }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoleAccountView;
