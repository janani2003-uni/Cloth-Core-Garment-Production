import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";

import {
  People,
  Search,
  ThreeDotsVertical,
  Eye,
  Pencil,
  Trash,
  CheckCircle,
  Clock,
  Filter,
  PersonPlus,
  ArrowUp,
  ArrowDown,
  ShieldLock,
  ShieldCheck,
  ShieldSlash,
  Key,
  Eye as EyeIcon,
  EyeSlash as EyeSlashIcon,
  Copy,
} from "react-bootstrap-icons";

import {
  PASSWORD_REGEX,
  PASSWORD_REQUIREMENTS_MESSAGE,
  PASSWORD_REQUIREMENTS_LIST,
} from "../../utils/passwordPolicy";
import { API_BASE_URL } from "../../utils/apiConfig";

const API_URL = `${API_BASE_URL}/api/staff`;

function AdminStaffManagement() {
  const navigate = useNavigate();

  // Staff data must be declared before statistics use it
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStaffId, setActionStaffId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedPasswordFor, setCopiedPasswordFor] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  // Single work-status filter — "All" (default, everyone), "On Leave" or
  // "On Duty". Replaces the old Department / Status / Account-view
  // dropdowns with the two toggle buttons above the table.
  const [statusFilter, setStatusFilter] = useState("All");

  // Get all staff from backend
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      setStaff(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Get Staff Error:", err);

      setError(
        err.response?.data?.message ||
          "Could not load staff members. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Statistics from real MongoDB data
  const totalStaff = staff.length;

  const onLeaveCount = staff.filter(
    (member) => member.status === "On Leave"
  ).length;

  const getPercentage = (value) => {
    if (totalStaff === 0) {
      return "0% of total staff";
    }

    return `${Math.round(
      (value / totalStaff) * 100
    )}% of total staff`;
  };

  // Literal hex (not CSS vars) because `color` gets an alpha suffix appended
  // below (e.g. `${stat.color}15`) to build the translucent icon background.
  const stats = [
    {
      label: "Total Staff",
      value: totalStaff,
      change: `${totalStaff} staff records`,
      trend: "up",
      icon: "👥",
      color: "#854f6c",
    },
    {
      label: "On Leave",
      value: onLeaveCount,
      change: getPercentage(onLeaveCount),
      trend: "down",
      icon: "🏖️",
      color: "#d98324",
    },
  ];

  // Search and filtering
  const filteredStaff = staff.filter((member) => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    const name = String(
      member.name || ""
    ).toLowerCase();

    const staffId = String(
      member.staffId || ""
    ).toLowerCase();

    const department = String(
      member.department || ""
    ).toLowerCase();

    const matchesSearch =
      name.includes(searchValue) ||
      staffId.includes(searchValue) ||
      department.includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // All filtered staff render at once now — the table scrolls internally
  // (see the fitScreen card below) instead of paginating.
  const currentStaff = filteredStaff;

  // Status badge styling — On Leave (amber) / On Duty (green).
  const getStatusStyle = (status) => {
    if (status === "On Leave") {
      return {
        background: "var(--clothcore-warning-bg)",
        color: "var(--clothcore-warning)",
        icon: <Clock size={12} />,
      };
    }

    return {
      background:
        "var(--clothcore-success-bg)",
      color: "var(--clothcore-success)",
      icon: <CheckCircle size={12} />,
    };
  };

  // 1. View Staff
  const handleViewStaff = async (member) => {
    try {
      setActionStaffId(member._id);
      const response = await axios.get(`${API_URL}/${member._id}`);
      setSelectedStaff(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("View Staff Error:", err);
      alert(err.response?.data?.message || "Could not load staff details.");
    } finally {
      setActionStaffId(null);
    }
  };

  // 2. Edit Staff
  const handleEditStaff = (member) => {
    setEditError("");
    setEditForm({
      _id: member._id,
      staffId: member.staffId,
      name: member.name || "",
      department: member.department || "",
      position: member.position || "",
      phone: member.phone || "",
      status: member.status || "On Duty",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.department || !editForm.position || !editForm.phone.trim()) {
      setEditError("Name, department, position and phone are required.");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");
      await axios.put(`${API_URL}/${editForm._id}`, {
        name: editForm.name.trim(),
        department: editForm.department,
        position: editForm.position,
        phone: editForm.phone.trim(),
        status: editForm.status,
      });
      setShowEditModal(false);
      setEditForm(null);
      await fetchStaff();
    } catch (err) {
      console.error("Edit Staff Error:", err);
      setEditError(err.response?.data?.message || "Could not update staff member.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Status (On Duty / On Leave) is changed via the Edit Staff modal now —
  // no separate quick-action buttons for it.

  // 5. Delete Staff
  const handleDelete = async (member) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionStaffId(member._id);
      await axios.delete(`${API_URL}/${member._id}`);
      alert("Staff member deleted successfully!");
      await fetchStaff();
    } catch (err) {
      console.error("Delete Staff Error:", err);
      alert(err.response?.data?.message || "Could not delete staff member.");
    } finally {
      setActionStaffId(null);
    }
  };

  const togglePasswordReveal = (memberId) => {
    setRevealedPasswords((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const copyPassword = async (memberId, password) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(password);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = password;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPasswordFor(memberId);
      setTimeout(() => setCopiedPasswordFor((current) => (current === memberId ? "" : current)), 1500);
    } catch (err) {
      console.error("Copy Password Error:", err);
    }
  };

  // 6. Create Login (navigates to the dedicated Create Supervisor Account page)
  const handleCreateLogin = (member) => {
    navigate(`/admin/staff/${member._id}/create-account`);
  };

  // 7. Reset Password — small inline modal, same pattern as Edit Staff
  const openResetPassword = (member) => {
    setResetError("");
    setResetPassword("");
    setResetConfirm("");
    setResetTarget(member);
  };

  const handleSaveResetPassword = async () => {
    if (!resetPassword) {
      setResetError("Please enter a new password.");
      return;
    }
    if (!PASSWORD_REGEX.test(resetPassword)) {
      setResetError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }
    if (resetPassword !== resetConfirm) {
      setResetError("Passwords do not match.");
      return;
    }

    try {
      setResetSaving(true);
      setResetError("");
      await axios.patch(`${API_URL}/${resetTarget._id}/reset-password`, {
        newPassword: resetPassword,
        confirmPassword: resetConfirm,
      });
      alert("Password reset successfully.");
      setResetTarget(null);
    } catch (err) {
      console.error("Reset Password Error:", err);
      setResetError(err.response?.data?.message || "Could not reset the password.");
    } finally {
      setResetSaving(false);
    }
  };

  // 8. Disable / Enable the linked login account (Staff profile is never deleted)
  const handleToggleAccount = async (member) => {
    const isCurrentlyActive = member.userId?.isActive !== false;
    const confirmMessage = isCurrentlyActive
      ? `Disable the login account for ${member.name}? They will not be able to sign in until re-enabled.`
      : `Re-enable the login account for ${member.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionStaffId(member._id);
      await axios.patch(`${API_URL}/${member._id}/disable-account`, {
        isActive: !isCurrentlyActive,
      });
      alert(isCurrentlyActive ? "Account disabled." : "Account enabled.");
      await fetchStaff();
    } catch (err) {
      console.error("Toggle Account Error:", err);
      alert(err.response?.data?.message || "Could not update the account.");
    } finally {
      setActionStaffId(null);
    }
  };

  return (
    <AdminLayout fitScreen>
            {/* Header — kept compact (page-local override, not a change to
                the shared .admin-page-header class other pages also use)
                so the staff table below gets most of the screen. */}
            <div className="admin-page-header" style={{ flexShrink: 0, padding: "14px 22px", marginBottom: "8px" }}>
              <div>
                <h2 className="admin-page-title" style={{ fontSize: "18px" }}>Staff Management</h2>
                <p className="admin-page-subtitle" style={{ fontSize: "12px" }}>
                  All staff members — filter by On Leave or On Duty below
                </p>
              </div>

              <button
                type="button"
                className="admin-hero-btn"
                onClick={() =>
                  navigate("/staff/add")
                }
              >
                <PersonPlus size={18} />
                Add Staff Member
              </button>
            </div>

            {/* Statistics — compact strip */}
            <div className="row g-2 mb-2" style={{ flexShrink: 0 }}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="col-xl col-lg-4 col-md-6 col-sm-12"
                >
                  <div
                    className="card admin-stat-card h-100"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "var(--clothcore-shadow)",
                    }}
                  >
                    <div className="card-body px-3 py-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--clothcore-text-soft)",
                              fontWeight: "500",
                            }}
                          >
                            {stat.label}
                          </div>

                          <div
                            className="fw-bold"
                            style={{
                              fontSize: "17px",
                              color: "var(--clothcore-text)",
                            }}
                          >
                            {stat.value}
                          </div>
                        </div>

                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "9px",
                            background:
                              `${stat.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",
                            fontSize: "14px",
                            flexShrink: 0,
                          }}
                        >
                          {stat.icon}
                        </div>
                      </div>

                      <div className="d-flex align-items-center mt-1">
                        {stat.trend === "up" ? (
                          <ArrowUp
                            size={11}
                            color="var(--clothcore-success)"
                          />
                        ) : (
                          <ArrowDown
                            size={11}
                            color="var(--clothcore-danger)"
                          />
                        )}

                        <span
                          style={{
                            fontSize: "10.5px",
                            color:
                              stat.trend ===
                              "up"
                                ? "var(--clothcore-success)"
                                : "var(--clothcore-danger)",
                            fontWeight: "600",
                            marginLeft: "4px",
                          }}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters — compact */}
            <div
              className="card admin-content-card mb-2"
              style={{
                borderRadius: "14px",
                boxShadow:
                  "var(--clothcore-shadow)",
                flexShrink: 0,
              }}
            >
              <div className="card-body px-3 py-2">
                <div className="row g-2 align-items-center">
                  <div className="col-lg-4">
                    <div className="position-relative">
                      <Search
                        size={18}
                        style={{
                          position:
                            "absolute",
                          left: "14px",
                          top: "50%",
                          transform:
                            "translateY(-50%)",
                          color: "var(--clothcore-text-soft)",
                        }}
                      />

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search staff by name, ID or department..."
                        value={searchTerm}
                        onChange={(event) => {
                          setSearchTerm(
                            event.target.value
                          );
                        }}
                        style={{
                          paddingLeft: "40px",
                          borderRadius: "10px",
                          border:
                            "1.5px solid var(--clothcore-border)",
                          fontSize: "13px",
                          height: "36px",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="d-flex gap-2">
                      {["On Leave", "On Duty"].map((option) => {
                        const isActive = statusFilter === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            className="btn"
                            onClick={() => {
                              setStatusFilter(isActive ? "All" : option);
                            }}
                            style={{
                              borderRadius: "10px",
                              border: isActive
                                ? "1.5px solid var(--clothcore-purple)"
                                : "1.5px solid var(--clothcore-border)",
                              fontSize: "13px",
                              fontWeight: isActive ? "700" : "500",
                              height: "36px",
                              flex: 1,
                              background: isActive
                                ? "var(--clothcore-purple)"
                                : "rgba(82,43,91,0.06)",
                              color: isActive ? "#fff" : "var(--clothcore-text)",
                            }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="col-lg-2">
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn"
                        onClick={fetchStaff}
                        style={{
                          borderRadius: "10px",
                          border:
                            "1.5px solid var(--clothcore-border)",
                          fontSize: "13px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          gap: "6px",
                          background: "rgba(82,43,91,0.06)",
                          color: "var(--clothcore-text)",
                          flex: 1,
                        }}
                      >
                        <Filter size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* Table — fills the remaining screen space; only the table
                body scrolls internally once it overflows. */}
            <div
              className="card admin-content-card d-flex flex-column"
              style={{
                borderRadius: "16px",
                boxShadow:
                  "var(--clothcore-shadow)",
                flex: 1,
                minHeight: 0,
              }}
            >
              <div className="card-body p-0" style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div className="table-responsive" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  <table className="table table-hover admin-table mb-0" style={{ fontSize: "13px", minWidth: "1050px" }}>
                    <thead>
                      <tr>
                        <th className="px-3 py-2">
                          #
                        </th>
                        <th className="px-3 py-2">
                          Staff ID
                        </th>
                        <th className="px-3 py-2">
                          Name
                        </th>
                        <th className="px-3 py-2">
                          Email
                        </th>
                        <th className="px-3 py-2">
                          Password
                        </th>
                        <th className="px-3 py-2">
                          Department
                        </th>
                        <th className="px-3 py-2">
                          Position
                        </th>
                        <th className="px-3 py-2">
                          Phone
                        </th>
                        <th className="px-3 py-2">
                          Status
                        </th>
                        <th className="px-3 py-2 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="10"
                            className="text-center py-5"
                          >
                            Loading staff
                            members...
                          </td>
                        </tr>
                      ) : currentStaff.length >
                        0 ? (
                        currentStaff.map(
                          (member, index) => {
                            const statusStyle =
                              getStatusStyle(
                                member.status
                              );

                            const hasAccount = Boolean(member.userId);
                            const isAccountActive = member.userId?.isActive !== false;

                            const isActionLoading = actionStaffId === member._id;

                            return (
                              <tr
                                key={
                                  member._id ||
                                  member.staffId
                                }
                              >
                                <td className="px-3 py-2">
                                  {index + 1}
                                </td>

                                <td className="px-3 py-2 text-primary">
                                  {member.staffId}
                                </td>

                                <td className="px-3 py-2 fw-semibold">
                                  {member.name}
                                </td>

                                <td className="px-3 py-2" style={{ color: "var(--clothcore-text-soft)" }}>
                                  {member.email || member.userId?.email || "—"}
                                </td>

                                <td className="px-3 py-2">
                                  {member.userId?.password ? (
                                    <div className="d-flex align-items-center gap-2">
                                      <span style={{ fontFamily: "monospace", fontSize: "12.5px", color: "var(--clothcore-text)" }}>
                                        {revealedPasswords[member._id] ? member.userId.password : "••••••••"}
                                      </span>
                                      <button
                                        type="button"
                                        className="admin-link-btn"
                                        style={{ padding: 0 }}
                                        onClick={() => togglePasswordReveal(member._id)}
                                        title={revealedPasswords[member._id] ? "Hide password" : "Show password"}
                                      >
                                        {revealedPasswords[member._id] ? <EyeSlashIcon size={13} /> : <EyeIcon size={13} />}
                                      </button>
                                      <button
                                        type="button"
                                        className="admin-link-btn"
                                        style={{ padding: 0, color: copiedPasswordFor === member._id ? "var(--clothcore-success)" : undefined }}
                                        onClick={() => copyPassword(member._id, member.userId.password)}
                                        title={copiedPasswordFor === member._id ? "Copied!" : "Copy password"}
                                      >
                                        {copiedPasswordFor === member._id ? <CheckCircle size={13} /> : <Copy size={13} />}
                                      </button>
                                    </div>
                                  ) : hasAccount ? (
                                    <span style={{ fontSize: "12px", color: "var(--clothcore-text-soft)" }} title="Set before this feature was added — use Reset Password to set a retrievable one.">
                                      Not available
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--clothcore-text-soft)" }}>—</span>
                                  )}
                                </td>

                                <td className="px-3 py-2">
                                  {
                                    member.department
                                  }
                                </td>

                                <td className="px-3 py-2">
                                  {member.position}
                                </td>

                                <td className="px-3 py-2">
                                  {member.phone}
                                </td>

                                <td className="px-3 py-2">
                                  <span
                                    className="badge"
                                    style={{
                                      background:
                                        statusStyle.background,
                                      color:
                                        statusStyle.color,
                                      padding:
                                        "5px 12px",
                                      borderRadius:
                                        "20px",
                                      display:
                                        "inline-flex",
                                      alignItems:
                                        "center",
                                      gap: "4px",
                                    }}
                                  >
                                    {
                                      statusStyle.icon
                                    }
                                    {member.status}
                                  </span>
                                </td>

                                <td className="px-3 py-2 text-center">
                                  <div className="dropdown">
                                    <button
                                      type="button"
                                      className="btn btn-sm"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                      disabled={isActionLoading}
                                      style={{
                                        opacity: isActionLoading ? 0.5 : 1,
                                        cursor: isActionLoading ? "not-allowed" : "pointer"
                                      }}
                                    >
                                      {isActionLoading ? (
                                        <span className="spinner-border spinner-border-sm" style={{ width: "14px", height: "14px" }} />
                                      ) : (
                                        <ThreeDotsVertical size={18} />
                                      )}
                                    </button>

                                    <ul className="dropdown-menu dropdown-menu-end">
                                      <li>
                                        <button
                                          type="button"
                                          className="dropdown-item d-flex align-items-center gap-2"
                                          onClick={() => handleViewStaff(member)}
                                          disabled={isActionLoading}
                                        >
                                          <Eye size={14} />
                                          View Staff
                                        </button>
                                      </li>

                                      <li>
                                        <button
                                          type="button"
                                          className="dropdown-item d-flex align-items-center gap-2"
                                          onClick={() => handleEditStaff(member)}
                                          disabled={isActionLoading}
                                        >
                                          <Pencil size={14} />
                                          Edit Staff
                                        </button>
                                      </li>

                                      <li>
                                        <hr className="dropdown-divider" />
                                      </li>

                                      {!hasAccount ? (
                                        <li>
                                          <button
                                            type="button"
                                            className="dropdown-item d-flex align-items-center gap-2"
                                            onClick={() => handleCreateLogin(member)}
                                            disabled={isActionLoading}
                                          >
                                            <ShieldLock size={14} />
                                            Create Login
                                          </button>
                                        </li>
                                      ) : (
                                        <>
                                          <li>
                                            <button
                                              type="button"
                                              className="dropdown-item d-flex align-items-center gap-2"
                                              onClick={() => openResetPassword(member)}
                                              disabled={isActionLoading}
                                            >
                                              <Key size={14} />
                                              Reset Password
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              type="button"
                                              className={`dropdown-item d-flex align-items-center gap-2${isAccountActive ? " text-danger" : ""}`}
                                              onClick={() => handleToggleAccount(member)}
                                              disabled={isActionLoading}
                                            >
                                              {isAccountActive ? <ShieldSlash size={14} /> : <ShieldCheck size={14} />}
                                              {isAccountActive ? "Disable Account" : "Enable Account"}
                                            </button>
                                          </li>
                                        </>
                                      )}

                                      <li>
                                        <hr className="dropdown-divider" />
                                      </li>

                                      <li>
                                        <button
                                          type="button"
                                          className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                          onClick={() => handleDelete(member)}
                                          disabled={isActionLoading}
                                        >
                                          <Trash size={14} />
                                          Delete Staff
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="10"
                            className="text-center py-5"
                          >
                            <People
                              size={48}
                              className="mb-3"
                              style={{
                                opacity: 0.3,
                              }}
                            />

                            <p className="mb-0">
                              No staff members
                              found matching your
                              filters
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

      {/* View Staff Modal */}
      {showViewModal && selectedStaff && (
        <div 
          className="modal show d-block" 
          style={{ 
            backgroundColor: "rgba(0,0,0,0.5)", 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1050 
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-text)" }}>
                  Staff Details
                </h5>
                <button 
                  type="button"
                  className="btn-close" 
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className="modal-body" style={{ padding: "24px" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Staff ID</small>
                      <h6 className="mb-0 text-primary">{selectedStaff.staffId}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Full Name</small>
                      <h6 className="mb-0">{selectedStaff.name}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Email</small>
                      <h6 className="mb-0">{selectedStaff.email || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Phone</small>
                      <h6 className="mb-0">{selectedStaff.phone}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Department</small>
                      <h6 className="mb-0">{selectedStaff.department}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Position</small>
                      <h6 className="mb-0">{selectedStaff.position}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Starting Date</small>
                      <h6 className="mb-0">{selectedStaff.joiningDate || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Status</small>
                      <h6 className="mb-0">
                        <span className="badge" style={{
                          background: getStatusStyle(selectedStaff.status).background,
                          color: getStatusStyle(selectedStaff.status).color,
                          padding: "5px 12px",
                          borderRadius: "20px"
                        }}>
                          {selectedStaff.status}
                        </span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Emergency Contact</small>
                      <h6 className="mb-0">{selectedStaff.emergencyContact || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                      <small className="text-muted">Address</small>
                      <p className="mb-0">{selectedStaff.address || "N/A"}</p>
                    </div>
                  </div>
                  {selectedStaff.notes && (
                    <div className="col-12">
                      <div className="p-3" style={{ background: "var(--clothcore-bg)", borderRadius: "10px" }}>
                        <small className="text-muted">Notes</small>
                        <p className="mb-0">{selectedStaff.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button 
                  type="button"
                  className="btn px-4" 
                  onClick={() => setShowViewModal(false)}
                  style={{
                    borderRadius: "10px",
                    background: "var(--clothcore-bg)",
                    color: "var(--clothcore-text-soft)"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editForm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <div>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)" }}>Edit Staff Member</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>{editForm.staffId}</p>
                </div>
                <button type="button" className="btn-close" onClick={() => !savingEdit && setShowEditModal(false)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Full Name</label>
                    <input
                      className="form-control admin-select"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Phone</label>
                    <input
                      className="form-control admin-select"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Department</label>
                    <select
                      className="form-select admin-select"
                      value={editForm.department}
                      onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                    >
                      {["Cutting", "Sewing", "Quality Control", "Finishing", "Maintenance", "Packing", "Stores", "Delivery", "Administration", "HR"].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Position</label>
                    <select
                      className="form-select admin-select"
                      value={editForm.position}
                      onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                    >
                      {["Cutter", "Sewing Operator", "QC Inspector", "Finishing Operator", "Technician", "Packing Operator", "Store Keeper", "Driver", "Supervisor", "Manager", "Assistant"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Status</label>
                    <select
                      className="form-select admin-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
                {editError && (
                  <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{editError}</div>
                )}
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password modal */}
      {resetTarget && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "16px" }}>
              <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                <div>
                  <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-text)" }}>Reset Password</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
                    {resetTarget.name} ({resetTarget.userId?.email})
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => !resetSaving && setResetTarget(null)} />
              </div>
              <div className="modal-body" style={{ padding: "20px 24px" }}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>New Password</label>
                  <input
                    type="password"
                    className="form-control admin-select"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control admin-select"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                  />
                </div>
                <small className="d-block mt-2" style={{ color: "var(--clothcore-text-soft)", fontSize: "12px", lineHeight: 1.6 }}>
                  {PASSWORD_REQUIREMENTS_LIST.map((rule) => (
                    <span key={rule}>✓ {rule}<br /></span>
                  ))}
                </small>
                {resetError && (
                  <div className="mt-3" style={{ color: "var(--clothcore-danger)", fontSize: "13px" }}>{resetError}</div>
                )}
              </div>
              <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setResetTarget(null)}
                  disabled={resetSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={handleSaveResetPassword}
                  disabled={resetSaving}
                >
                  {resetSaving ? "Saving..." : "Reset Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminStaffManagement;