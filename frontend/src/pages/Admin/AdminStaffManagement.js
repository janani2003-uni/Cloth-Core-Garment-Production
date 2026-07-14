import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";

import {
  People,
  Search,
  ChevronLeft,
  ChevronRight,
  ThreeDotsVertical,
  Eye,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  PersonPlus,
  ArrowUp,
  ArrowDown,
  Calendar,
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/staff";

function AdminStaffManagement() {
  const navigate = useNavigate();

  // Staff data must be declared before statistics use it
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStaffId, setActionStaffId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] =
    useState("All Departments");
  const [selectedStatus, setSelectedStatus] =
    useState("All Status");

  const staffPerPage = 8;

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

  const presentToday = staff.filter(
    (member) => member.attendance === "Present"
  ).length;

  const absentToday = staff.filter(
    (member) => member.attendance === "Absent"
  ).length;

  const onLeave = staff.filter(
    (member) => member.attendance === "On Leave"
  ).length;

  const departmentsCount = new Set(
    staff
      .map((member) => member.department)
      .filter(Boolean)
  ).size;

  const getPercentage = (value) => {
    if (totalStaff === 0) {
      return "0% of total staff";
    }

    return `${Math.round(
      (value / totalStaff) * 100
    )}% of total staff`;
  };

  const stats = [
    {
      label: "Total Staff",
      value: totalStaff,
      change: `${totalStaff} staff records`,
      trend: "up",
      icon: "👥",
      color: "#6366f1",
    },
    {
      label: "Present Today",
      value: presentToday,
      change: getPercentage(presentToday),
      trend: "up",
      icon: "✅",
      color: "#10b981",
    },
    {
      label: "Absent Today",
      value: absentToday,
      change: getPercentage(absentToday),
      trend: "down",
      icon: "❌",
      color: "#ef4444",
    },
    {
      label: "On Leave",
      value: onLeave,
      change: getPercentage(onLeave),
      trend: "down",
      icon: "🏖️",
      color: "#f59e0b",
    },
    {
      label: "Departments",
      value: departmentsCount,
      change: "Active departments",
      trend: "up",
      icon: "🏢",
      color: "#8b5cf6",
    },
  ];

  // Department dropdown values
  const departments = [
    "All Departments",
    ...new Set(
      staff
        .map((member) => member.department)
        .filter(Boolean)
    ),
  ];

  const statuses = [
    "All Status",
    "Active",
    "Inactive",
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

    const matchesDepartment =
      selectedDepartment === "All Departments" ||
      member.department === selectedDepartment;

    const matchesStatus =
      selectedStatus === "All Status" ||
      member.status === selectedStatus;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });

  // Pagination
  const indexOfLastStaff =
    currentPage * staffPerPage;

  const indexOfFirstStaff =
    indexOfLastStaff - staffPerPage;

  const currentStaff = filteredStaff.slice(
    indexOfFirstStaff,
    indexOfLastStaff
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStaff.length / staffPerPage
    )
  );

  const paginate = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  };

  // Attendance badge styling
  const getAttendanceStyle = (attendance) => {
    const styles = {
      Present: {
        background: "rgba(16,185,129,0.15)",
        color: "#10b981",
        icon: <CheckCircle size={12} />,
      },

      Absent: {
        background: "rgba(239,68,68,0.15)",
        color: "#ef4444",
        icon: <XCircle size={12} />,
      },

      "On Leave": {
        background: "rgba(245,158,11,0.15)",
        color: "#f59e0b",
        icon: <Clock size={12} />,
      },
    };

    return (
      styles[attendance] ||
      styles.Present
    );
  };

  // Status badge styling
  const getStatusStyle = (status) => {
    if (status === "Inactive") {
      return {
        background:
          "rgba(239,68,68,0.15)",
        color: "#ef4444",
        icon: <XCircle size={12} />,
      };
    }

    return {
      background:
        "rgba(16,185,129,0.15)",
      color: "#10b981",
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
    navigate(`/staff/edit/${member._id}`);
  };

  // 3. Mark as On Leave
  const handleMarkOnLeave = async (member) => {
    if (!window.confirm(`Mark ${member.name} as On Leave?`)) return;

    try {
      setActionStaffId(member._id);
      await axios.put(`${API_URL}/${member._id}`, {
        status: "On Leave",
        attendance: "On Leave"
      });
      alert("Staff member marked as On Leave successfully!");
      await fetchStaff();
    } catch (err) {
      console.error("Mark On Leave Error:", err);
      alert(err.response?.data?.message || "Could not update staff status.");
    } finally {
      setActionStaffId(null);
    }
  };

  // 4. Mark as Inactive
  const handleMarkInactive = async (member) => {
    if (!window.confirm(`Mark ${member.name} as Inactive?`)) return;

    try {
      setActionStaffId(member._id);
      await axios.put(`${API_URL}/${member._id}`, {
        status: "Inactive"
      });
      alert("Staff member marked as Inactive successfully!");
      await fetchStaff();
    } catch (err) {
      console.error("Mark Inactive Error:", err);
      alert(err.response?.data?.message || "Could not update staff status.");
    } finally {
      setActionStaffId(null);
    }
  };

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

  // Export currently filtered staff
  const handleExport = () => {
    if (filteredStaff.length === 0) {
      alert(
        "There are no staff records to export."
      );
      return;
    }

    const headings = [
      "Staff ID",
      "Name",
      "Department",
      "Position",
      "Phone",
      "Attendance",
      "Status",
    ];

    const rows = filteredStaff.map(
      (member) => [
        member.staffId,
        member.name,
        member.department,
        member.position,
        member.phone,
        member.attendance,
        member.status,
      ]
    );

    const csvContent = [
      headings,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value || ""
              ).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      "clothcore-staff.csv"
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: "#f0f0f5",
      }}
    >
      <Adminsidebar />

      <div className="flex-grow-1">
        <Admintopbar />

        <div style={{ padding: "24px" }}>
          <div className="container-fluid px-0">
            {/* Breadcrumb */}
            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  color: "#6c757d",
                  fontSize: "14px",
                }}
              >
                Dashboard
              </span>

              <span
                style={{
                  color: "#6c757d",
                  margin: "0 8px",
                }}
              >
                &gt;
              </span>

              <span
                style={{
                  color: "#0b3aa0",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Staff Management
              </span>
            </div>

            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2
                  className="fw-bold mb-0"
                  style={{
                    color: "#1a1a2e",
                    fontSize: "28px",
                  }}
                >
                  Staff Management
                </h2>

                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: "14px",
                  }}
                >
                  Manage staff, attendance,
                  and departments
                </p>
              </div>

              <button
                type="button"
                className="btn px-4 py-2"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  borderRadius: "10px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() =>
                  navigate("/staff/add")
                }
              >
                <PersonPlus size={18} />
                Add Staff Member
              </button>
            </div>

            {/* Statistics */}
            <div className="row g-3 mb-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="col-xl col-lg-4 col-md-6 col-sm-12"
                >
                  <div
                    className="card border-0 h-100"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="card-body p-3 p-xl-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6c757d",
                              fontWeight: "500",
                            }}
                          >
                            {stat.label}
                          </div>

                          <div
                            className="fw-bold"
                            style={{
                              fontSize: "24px",
                              color: "#1a1a2e",
                              marginTop: "4px",
                            }}
                          >
                            {stat.value}
                          </div>
                        </div>

                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background:
                              `${stat.color}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",
                            fontSize: "20px",
                          }}
                        >
                          {stat.icon}
                        </div>
                      </div>

                      <div className="d-flex align-items-center mt-1">
                        {stat.trend === "up" ? (
                          <ArrowUp
                            size={14}
                            color="#10b981"
                          />
                        ) : (
                          <ArrowDown
                            size={14}
                            color="#ef4444"
                          />
                        )}

                        <span
                          style={{
                            fontSize: "12px",
                            color:
                              stat.trend ===
                              "up"
                                ? "#10b981"
                                : "#ef4444",
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

            {/* Filters */}
            <div
              className="card border-0 mb-4"
              style={{
                borderRadius: "16px",
                boxShadow:
                  "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="card-body p-4">
                <div className="row g-3 align-items-center">
                  <div className="col-lg-5">
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
                          color: "#94a3b8",
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
                          setCurrentPage(1);
                        }}
                        style={{
                          paddingLeft: "40px",
                          borderRadius: "10px",
                          border:
                            "2px solid #e9ecef",
                          fontSize: "14px",
                          height: "42px",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={
                        selectedDepartment
                      }
                      onChange={(event) => {
                        setSelectedDepartment(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border:
                          "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      {departments.map(
                        (department) => (
                          <option
                            key={department}
                            value={department}
                          >
                            {department}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border:
                          "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      {statuses.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-lg-3">
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn"
                        onClick={fetchStaff}
                        style={{
                          borderRadius: "10px",
                          border:
                            "2px solid #e9ecef",
                          fontSize: "14px",
                          height: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          gap: "6px",
                          background: "white",
                          color: "#1a1a2e",
                          flex: 1,
                        }}
                      >
                        <Filter size={16} />
                        Refresh
                      </button>

                      <button
                        type="button"
                        className="btn"
                        onClick={handleExport}
                        style={{
                          borderRadius: "10px",
                          border:
                            "2px solid #e9ecef",
                          fontSize: "14px",
                          height: "42px",
                          background: "white",
                          color: "#1a1a2e",
                          padding: "0 16px",
                        }}
                      >
                        <Download size={16} />
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

            {/* Table */}
            <div
              className="card border-0"
              style={{
                borderRadius: "16px",
                boxShadow:
                  "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead
                      style={{
                        background: "#f8f9fa",
                      }}
                    >
                      <tr>
                        <th className="px-4 py-3">
                          #
                        </th>
                        <th className="px-4 py-3">
                          Staff ID
                        </th>
                        <th className="px-4 py-3">
                          Name
                        </th>
                        <th className="px-4 py-3">
                          Department
                        </th>
                        <th className="px-4 py-3">
                          Position
                        </th>
                        <th className="px-4 py-3">
                          Phone
                        </th>
                        <th className="px-4 py-3">
                          Attendance
                        </th>
                        <th className="px-4 py-3">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="9"
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
                            const attendanceStyle =
                              getAttendanceStyle(
                                member.attendance
                              );

                            const statusStyle =
                              getStatusStyle(
                                member.status
                              );

                            const isActionLoading = actionStaffId === member._id;

                            return (
                              <tr
                                key={
                                  member._id ||
                                  member.staffId
                                }
                              >
                                <td className="px-4 py-3">
                                  {indexOfFirstStaff +
                                    index +
                                    1}
                                </td>

                                <td className="px-4 py-3 text-primary">
                                  {member.staffId}
                                </td>

                                <td className="px-4 py-3 fw-semibold">
                                  {member.name}
                                </td>

                                <td className="px-4 py-3">
                                  {
                                    member.department
                                  }
                                </td>

                                <td className="px-4 py-3">
                                  {member.position}
                                </td>

                                <td className="px-4 py-3">
                                  {member.phone}
                                </td>

                                <td className="px-4 py-3">
                                  <span
                                    className="badge"
                                    style={{
                                      background:
                                        attendanceStyle.background,
                                      color:
                                        attendanceStyle.color,
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
                                      attendanceStyle.icon
                                    }
                                    {
                                      member.attendance
                                    }
                                  </span>
                                </td>

                                <td className="px-4 py-3">
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

                                <td className="px-4 py-3 text-center">
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
                            colSpan="9"
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

              {!loading &&
                filteredStaff.length > 0 && (
                  <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <div>
                      Showing{" "}
                      {indexOfFirstStaff + 1} to{" "}
                      {Math.min(
                        indexOfLastStaff,
                        filteredStaff.length
                      )}{" "}
                      of {filteredStaff.length} staff
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-light"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          paginate(
                            currentPage - 1
                          )
                        }
                      >
                        <ChevronLeft
                          size={16}
                        />
                      </button>

                      <span className="btn btn-primary">
                        {currentPage}
                      </span>

                      <button
                        type="button"
                        className="btn btn-light"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          paginate(
                            currentPage + 1
                          )
                        }
                      >
                        <ChevronRight
                          size={16}
                        />
                      </button>
                    </div>
                  </div>
                )}
            </div>
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
                <h5 className="modal-title fw-bold" style={{ color: "#1a1a2e" }}>
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
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Staff ID</small>
                      <h6 className="mb-0 text-primary">{selectedStaff.staffId}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Full Name</small>
                      <h6 className="mb-0">{selectedStaff.name}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Email</small>
                      <h6 className="mb-0">{selectedStaff.email || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Phone</small>
                      <h6 className="mb-0">{selectedStaff.phone}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Department</small>
                      <h6 className="mb-0">{selectedStaff.department}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Position</small>
                      <h6 className="mb-0">{selectedStaff.position}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Joining Date</small>
                      <h6 className="mb-0">{selectedStaff.joiningDate || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Attendance</small>
                      <h6 className="mb-0">
                        <span className="badge" style={{
                          background: getAttendanceStyle(selectedStaff.attendance).background,
                          color: getAttendanceStyle(selectedStaff.attendance).color,
                          padding: "5px 12px",
                          borderRadius: "20px"
                        }}>
                          {selectedStaff.attendance}
                        </span>
                      </h6>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
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
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Emergency Contact</small>
                      <h6 className="mb-0">{selectedStaff.emergencyContact || "N/A"}</h6>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
                      <small className="text-muted">Address</small>
                      <p className="mb-0">{selectedStaff.address || "N/A"}</p>
                    </div>
                  </div>
                  {selectedStaff.notes && (
                    <div className="col-12">
                      <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "10px" }}>
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
                    background: "#f8f9fa",
                    color: "#495057"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaffManagement;