// src/pages/Admin/AdminUserManagement.js

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";

import {
  People,
  PersonPlus,
  Search,
  ArrowUp,
  ArrowDown,
  ThreeDotsVertical,
  Eye,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/auth/users";
const USERS_PER_PAGE = 8;

function AdminUserManagement() {
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] =
    useState("All Status");
  const [selectedPeriod, setSelectedPeriod] =
  useState("This Year");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] =
    useState(null);

  // ==========================
  // Convert backend user data
  // ==========================
  const formatUser = (user) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    return {
      id: user._id,
      firstName,
      lastName,
      factoryName: user.factoryName || "",

      initials: `${firstName.charAt(0)}${lastName.charAt(
        0
      )}`.toUpperCase(),

      name:
        `${firstName} ${lastName}`.trim() ||
        "Unknown User",

      email: user.email || "No email",
      role: user.role || "User",
      status: user.status || "Active",

      joinedDate: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",

      lastLogin: user.lastLogin
        ? new Date(user.lastLogin).toLocaleString()
        : "Not available",

      createdAt: user.createdAt || null,
    };
  };

  // ==========================
  // Load users from backend
  // ==========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      const formattedUsers = Array.isArray(response.data)
        ? response.data.map(formatUser)
        : [];

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error loading users:", err);

      setError(
        err.response?.data?.message ||
          "Could not load users. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================
  // Create user
  // ==========================
  const handleAddUser = async () => {
    const firstName = window.prompt("Enter first name:");

    if (firstName === null) {
      return;
    }

    const lastName = window.prompt("Enter last name:");

    if (lastName === null) {
      return;
    }

    const email = window.prompt("Enter email address:");

    if (email === null) {
      return;
    }

    const factoryName = window.prompt(
      "Enter factory name:"
    );

    if (factoryName === null) {
      return;
    }

    const password = window.prompt(
      "Enter a temporary password:"
    );

    if (password === null) {
      return;
    }

    const role = window.prompt(
      "Enter role: Admin, Staff, Viewer or User",
      "User"
    );

    if (role === null) {
      return;
    }

    const status = window.prompt(
      "Enter status: Active or Inactive",
      "Active"
    );

    if (status === null) {
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !factoryName.trim() ||
      !password.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(API_URL, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        factoryName: factoryName.trim(),
        password: password.trim(),
        role: role.trim() || "User",
        status: status.trim() || "Active",
      });

      const createdUser = formatUser(
        response.data.user
      );

      setUsers((currentUsers) => [
        createdUser,
        ...currentUsers,
      ]);

      setCurrentPage(1);

      alert("User created successfully.");
    } catch (err) {
      console.error("Create User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not create the user."
      );
    }
  };

  // ==========================
  // View one user
  // ==========================
  const handleViewUser = async (user) => {
    try {
      const response = await axios.get(
        `${API_URL}/${user.id}`
      );

      const selectedUser = response.data;

      const fullName = `${
        selectedUser.firstName || ""
      } ${selectedUser.lastName || ""}`.trim();

      alert(
        `USER PROFILE\n\n` +
          `Name: ${fullName || "N/A"}\n` +
          `Email: ${selectedUser.email || "N/A"}\n` +
          `Factory: ${
            selectedUser.factoryName || "N/A"
          }\n` +
          `Role: ${selectedUser.role || "User"}\n` +
          `Status: ${
            selectedUser.status || "Active"
          }\n` +
          `Last Login: ${
            selectedUser.lastLogin
              ? new Date(
                  selectedUser.lastLogin
                ).toLocaleString()
              : "Not available"
          }`
      );
    } catch (err) {
      console.error("View User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not load the user profile."
      );
    }
  };

  // ==========================
  // Update user
  // ==========================
  const handleEditUser = async (user) => {
    const firstName = window.prompt(
      "Enter first name:",
      user.firstName
    );

    if (firstName === null) {
      return;
    }

    const lastName = window.prompt(
      "Enter last name:",
      user.lastName
    );

    if (lastName === null) {
      return;
    }

    const email = window.prompt(
      "Enter email address:",
      user.email
    );

    if (email === null) {
      return;
    }

    const factoryName = window.prompt(
      "Enter factory name:",
      user.factoryName
    );

    if (factoryName === null) {
      return;
    }

    const role = window.prompt(
      "Enter role: Admin, Staff, Viewer or User",
      user.role
    );

    if (role === null) {
      return;
    }

    const status = window.prompt(
      "Enter status: Active or Inactive",
      user.status
    );

    if (status === null) {
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim()
    ) {
      alert(
        "First name, last name and email are required."
      );
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/${user.id}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          factoryName: factoryName.trim(),
          role: role.trim() || "User",
          status: status.trim() || "Active",
        }
      );

      const updatedUser = formatUser(
        response.data.user
      );

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? updatedUser
            : currentUser
        )
      );

      alert("User updated successfully.");
    } catch (err) {
      console.error("Update User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not update the user."
      );
    }
  };

  // ==========================
  // Delete user
  // ==========================
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(user.id);

      await axios.delete(`${API_URL}/${user.id}`);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== user.id
        )
      );

      alert("User deleted successfully.");
    } catch (err) {
      console.error("Delete User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not delete the user."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // ==========================
  // Dynamic statistics
  // ==========================
  const activeUsersCount = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsersCount = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const adminUsersCount = users.filter(
    (user) => user.role === "Admin"
  ).length;

  const newUsersThisMonthCount = users.filter(
    (user) => {
      if (!user.createdAt) {
        return false;
      }

      const joinedDate = new Date(user.createdAt);
      const currentDate = new Date();

      return (
        joinedDate.getMonth() ===
          currentDate.getMonth() &&
        joinedDate.getFullYear() ===
          currentDate.getFullYear()
      );
    }
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      change: `${users.length} records`,
      trend: "up",
      color: "#6366f1",
    },
    {
      label: "Active Users",
      value: activeUsersCount,
      change: `${activeUsersCount} active`,
      trend: "up",
      color: "#10b981",
    },
    {
      label: "Inactive Users",
      value: inactiveUsersCount,
      change: `${inactiveUsersCount} inactive`,
      trend: "down",
      color: "#ef4444",
    },
    {
      label: "Admins",
      value: adminUsersCount,
      change: `${adminUsersCount} administrators`,
      trend: "up",
      color: "#8b5cf6",
    },
    {
      label: "New This Month",
      value: newUsersThisMonthCount,
      change: `${newUsersThisMonthCount} new users`,
      trend: "up",
      color: "#f59e0b",
    },
  ];

  // ==========================
  // Date-period filter
  // ==========================
  const matchesSelectedPeriod = (user) => {
    if (!user.createdAt) {
      return true;
    }

    const joinedDate = new Date(user.createdAt);
    const currentDate = new Date();

    if (selectedPeriod === "Today") {
      return (
        joinedDate.toDateString() ===
        currentDate.toDateString()
      );
    }

    if (selectedPeriod === "This Week") {
      const firstDayOfWeek = new Date(currentDate);

      firstDayOfWeek.setDate(
        currentDate.getDate() -
          currentDate.getDay()
      );

      firstDayOfWeek.setHours(0, 0, 0, 0);

      return joinedDate >= firstDayOfWeek;
    }

    if (selectedPeriod === "This Month") {
      return (
        joinedDate.getMonth() ===
          currentDate.getMonth() &&
        joinedDate.getFullYear() ===
          currentDate.getFullYear()
      );
    }

    if (selectedPeriod === "This Year") {
      return (
        joinedDate.getFullYear() ===
        currentDate.getFullYear()
      );
    }

    return true;
  };

  // ==========================
  // Search and filters
  // ==========================
  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        String(user.name || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(user.email || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(user.role || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        selectedRole === "All Roles" ||
        user.role === selectedRole;

      const matchesStatus =
        selectedStatus === "All Status" ||
        user.status === selectedStatus;

      const matchesPeriod =
        matchesSelectedPeriod(user);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesPeriod
      );
    });
  }, [
    users,
    searchTerm,
    selectedRole,
    selectedStatus,
    selectedPeriod,
  ]);

  // ==========================
  // Pagination
  // ==========================
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length / USERS_PER_PAGE
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const indexOfLastUser =
    currentPage * USERS_PER_PAGE;

  const indexOfFirstUser =
    indexOfLastUser - USERS_PER_PAGE;

  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const paginate = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================
  // Filter values
  // ==========================
  const roles = [
    "All Roles",
    ...new Set(
      users
        .map((user) => user.role)
        .filter(Boolean)
    ),
  ];

  const statuses = [
    "All Status",
    "Active",
    "Inactive",
  ];

  const getRoleBadgeStyle = (role) => {
    const colors = {
      Admin: {
        bg: "rgba(139,92,246,0.15)",
        color: "#8b5cf6",
      },
      Staff: {
        bg: "rgba(6,182,212,0.15)",
        color: "#06b6d4",
      },
      Viewer: {
        bg: "rgba(148,163,184,0.15)",
        color: "#64748b",
      },
      User: {
        bg: "rgba(99,102,241,0.15)",
        color: "#6366f1",
      },
    };

    return (
      colors[role] || {
        bg: "rgba(100,116,139,0.15)",
        color: "#64748b",
      }
    );
  };

  // ==========================
  // Export users as CSV
  // ==========================
  const handleExport = () => {
    if (filteredUsers.length === 0) {
      alert("There are no users to export.");
      return;
    }

    const headings = [
      "Name",
      "Email",
      "Factory",
      "Role",
      "Status",
      "Joined Date",
      "Last Login",
    ];

    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.factoryName,
      user.role,
      user.status,
      user.joinedDate,
      user.lastLogin,
    ]);

    const csvContent = [headings, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value || "").replaceAll(
                '"',
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const fileUrl = URL.createObjectURL(blob);

    const downloadLink =
      document.createElement("a");

    downloadLink.href = fileUrl;

    downloadLink.setAttribute(
      "download",
      "clothcore-users.csv"
    );

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    URL.revokeObjectURL(fileUrl);
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
            {/* Page Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h2
                    className="fw-bold mb-0"
                    style={{
                      color: "#1a1a2e",
                      fontSize: "28px",
                    }}
                  >
                    User Management
                  </h2>

                  <span
                    className="badge"
                    style={{
                      background:
                        "rgba(99,102,241,0.1)",
                      color: "#6366f1",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {filteredUsers.length} Users
                  </span>
                </div>

                <p
                  className="text-muted mb-0"
                  style={{ fontSize: "14px" }}
                >
                  Manage users, roles and permissions
                </p>
              </div>

              
            </div>

            {/* Statistics Cards */}
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
                          }}
                        >
                          <People
                            size={20}
                            style={{
                              color: stat.color,
                            }}
                          />
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
                              stat.trend === "up"
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

            {/* Search and Filters */}
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
                  <div className="col-lg-4">
                    <div className="position-relative">
                      <Search
                        size={18}
                        style={{
                          position: "absolute",
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
                        placeholder="Search users by name, email or role..."
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
                      value={selectedRole}
                      onChange={(event) => {
                        setSelectedRole(event.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(event.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={selectedPeriod}
                      onChange={(event) => {
                        setSelectedPeriod(event.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="This Year">This Year</option>
                    </select>
                  </div>

                  <div className="col-lg-2">
                    <button
                      type="button"
                      className="btn w-100"
                      onClick={fetchUsers}
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                        fontSize: "14px",
                        height: "42px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "white",
                        color: "#1a1a2e",
                      }}
                    >
                      <Filter size={16} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="alert alert-danger d-flex justify-content-between align-items-center"
                role="alert"
              >
                <span>{error}</span>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={fetchUsers}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Users Table */}
            <div
              className="card border-0"
              style={{
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ background: "#f8f9fa" }}>
                      <tr>
                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          #
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          User
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Email
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Role
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Status
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Joined Date
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Last Login
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-5"
                          >
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>

                            <p className="text-muted mt-3 mb-0">
                              Loading users...
                            </p>
                          </td>
                        </tr>
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map((user, index) => {
                          const roleStyle =
                            getRoleBadgeStyle(user.role);

                          return (
                            <tr key={user.id}>
                              <td
                                className="px-4 py-3 fw-bold"
                                style={{
                                  color: "#94a3b8",
                                  fontSize: "13px",
                                }}
                              >
                                {indexOfFirstUser + index + 1}
                              </td>

                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                      color: "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {user.initials || "U"}
                                  </div>

                                  <span
                                    className="fw-medium"
                                    style={{
                                      fontSize: "14px",
                                      color: "#1a1a2e",
                                    }}
                                  >
                                    {user.name}
                                  </span>
                                </div>
                              </td>

                              <td
                                className="px-4 py-3"
                                style={{
                                  fontSize: "13px",
                                  color: "#64748b",
                                }}
                              >
                                {user.email}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className="badge"
                                  style={{
                                    background: roleStyle.bg,
                                    color: roleStyle.color,
                                    padding: "5px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {user.role}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      user.status === "Active"
                                        ? "rgba(16,185,129,0.15)"
                                        : "rgba(239,68,68,0.15)",
                                    color:
                                      user.status === "Active"
                                        ? "#10b981"
                                        : "#ef4444",
                                    padding: "5px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  {user.status === "Active" ? (
                                    <CheckCircle size={12} />
                                  ) : (
                                    <XCircle size={12} />
                                  )}

                                  {user.status}
                                </span>
                              </td>

                              <td
  className="px-4 py-3"
  style={{
    fontSize: "13px",
    color: "#64748b",
  }}
>
  {user.joinedDate
    ? new Date(user.joinedDate).toLocaleDateString()
    : "N/A"}
</td>

<td
  className="px-4 py-3"
  style={{
    fontSize: "13px",
    color: "#64748b",
  }}
>
  {user.lastLogin
    ? new Date(user.lastLogin).toLocaleString()
    : "Not available"}
</td>

                              <td className="px-4 py-3 text-center">
                                <div className="dropdown">
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      padding: "4px 8px",
                                      borderRadius: "8px",
                                      color: "#64748b",
                                    }}
                                  >
                                    <ThreeDotsVertical size={18} />
                                  </button>

                                  <ul
                                    className="dropdown-menu dropdown-menu-end"
                                    style={{
                                      borderRadius: "12px",
                                      padding: "8px",
                                      minWidth: "180px",
                                    }}
                                  >
                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2"
                                        onClick={() =>
                                          handleViewUser(user)
                                        }
                                        style={{
                                          borderRadius: "8px",
                                          fontSize: "13px",
                                        }}
                                      >
                                        <Eye size={14} />
                                        View Profile
                                      </button>
                                    </li>

                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2"
                                        onClick={() =>
                                          handleEditUser(user)
                                        }
                                        style={{
                                          borderRadius: "8px",
                                          fontSize: "13px",
                                        }}
                                      >
                                        <Pencil size={14} />
                                        Edit User
                                      </button>
                                    </li>

                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>

                                    <li>
                                      <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center gap-2 text-danger"
                                        disabled={
                                          deletingUserId === user.id
                                        }
                                        onClick={() =>
                                          handleDeleteUser(user)
                                        }
                                        style={{
                                          borderRadius: "8px",
                                          fontSize: "13px",
                                        }}
                                      >
                                        <Trash size={14} />

                                        {deletingUserId === user.id
                                          ? "Deleting..."
                                          : "Delete User"}
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center py-5"
                          >
                            <div className="text-muted">
                              <People
                                size={48}
                                className="mb-3"
                                style={{ opacity: 0.3 }}
                              />

                              <p className="mb-0">
                                No users found matching your filters
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {!loading && filteredUsers.length > 0 && (
                <div className="card-footer bg-white border-0 px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                    }}
                  >
                    Showing {indexOfFirstUser + 1} to{" "}
                    {Math.min(
                      indexOfLastUser,
                      filteredUsers.length
                    )}{" "}
                    of {filteredUsers.length} users
                  </div>

                  <nav aria-label="User pagination">
                    <ul className="pagination mb-0 gap-1">
                      <li
                        className={`page-item ${
                          currentPage === 1
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() =>
                            paginate(currentPage - 1)
                          }
                          disabled={currentPage === 1}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                            color: "#1a1a2e",
                            padding: "6px 12px",
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                      </li>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((pageNumber) => (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            currentPage === pageNumber
                              ? "active"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() =>
                              paginate(pageNumber)
                            }
                            style={{
                              borderRadius: "8px",
                              border:
                                currentPage === pageNumber
                                  ? "none"
                                  : "1px solid #e9ecef",
                              background:
                                currentPage === pageNumber
                                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                  : "transparent",
                              color:
                                currentPage === pageNumber
                                  ? "white"
                                  : "#1a1a2e",
                              padding: "6px 12px",
                              minWidth: "36px",
                              textAlign: "center",
                            }}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      ))}

                      <li
                        className={`page-item ${
                          currentPage === totalPages
                            ? "disabled"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() =>
                            paginate(currentPage + 1)
                          }
                          disabled={
                            currentPage === totalPages
                          }
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e9ecef",
                            color: "#1a1a2e",
                            padding: "6px 12px",
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </li>
                    </ul>
                  </nav>

                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={handleExport}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      fontSize: "13px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={14} />
                    Export
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagement;