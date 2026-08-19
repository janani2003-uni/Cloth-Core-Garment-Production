// src/pages/Admin/AdminUserManagement.js
// Shop Owner Management — scoped to shop owner accounts only. Reads from
// /api/auth/shop-owners (joins the live Shop document onto each account), so
// whatever a Shop Owner saves on their Shop Profile page shows up here
// automatically. Account CRUD (create/edit/delete) still goes through the
// generic /api/auth/users endpoints, but every account created/edited here
// is always role "shopOwner" — Admin/Supervisor accounts are managed
// elsewhere (Staff Management), not on this page.
//
// This page now also absorbs everything the old read-only "Shop Directory"
// page (/shops, AdminShops.js — removed) used to show: shop logo, Shop ID,
// owner, address, phone. All of that was already available here except the
// logo, which is now rendered via <ShopLogo> in both the table row and the
// "View Shop Profile" modal. Shop Directory itself has been deleted —
// Admin's full read-only shop/owner picture lives here now.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import AdminLayout from "../../components/AdminLayout";

import {
  People,
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
  ChevronLeft,
  ChevronRight,
  Shop as ShopIcon,
  Building,
} from "react-bootstrap-icons";

const USERS_API_URL = "http://localhost:5000/api/auth/users";
const SHOP_OWNERS_API_URL = "http://localhost:5000/api/auth/shop-owners";
const UPLOAD_BASE_URL = "http://localhost:5000";
const USERS_PER_PAGE = 8;

function shopBadgeClass(shop) {
  if (!shop) return "admin-badge-warning";
  if (shop.approvalStatus === "Approved") return shop.isActive ? "admin-badge-success" : "admin-badge-danger";
  if (shop.approvalStatus === "Rejected") return "admin-badge-danger";
  return "admin-badge-warning";
}

function shopStatusLabel(shop) {
  if (!shop) return "No shop profile yet";
  if (shop.approvalStatus === "Approved") return shop.isActive ? "Approved · Active" : "Approved · Suspended";
  return shop.approvalStatus;
}

// Shop logo thumbnail — absorbed from the now-removed Shop Directory page,
// which was the only place a shop's logo was ever shown to Admin.
function ShopLogo({ shop, size = 34 }) {
  if (shop?.logoPath) {
    return (
      <img
        src={`${UPLOAD_BASE_URL}${shop.logoPath}`}
        alt={`${shop.shopName || "Shop"} logo`}
        style={{ width: size, height: size, borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "8px",
        background: "rgba(133,79,108,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--clothcore-purple)",
        flexShrink: 0,
      }}
    >
      <Building size={Math.round(size * 0.45)} />
    </div>
  );
}

// ==========================
// Convert backend user+shop data
// ==========================
const formatUser = (user) => {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  return {
    id: user._id,
    firstName,
    lastName,
    shopName: user.shopName || "",

    initials: `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase(),

    name:
      `${firstName} ${lastName}`.trim() ||
      "Unknown User",

    email: user.email || "No email",
    role: user.role || "shopOwner",
    status: user.status || "Active",

    // "Start Date" column — when the account was created.
    joinedDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A",

    lastLogin: user.lastLogin
      ? new Date(user.lastLogin).toLocaleString()
      : "Not available",

    createdAt: user.createdAt || null,

    // Order-activity, from GET /api/auth/shop-owners's Order aggregation —
    // backs the "Active"/"Inactive" stat tiles (see AdminUserManagement's
    // stats block below for exactly how).
    orderCount: user.orderCount || 0,
    hasOrderInLast3Months: Boolean(user.hasOrderInLast3Months),

    // Live Shop Profile snapshot — null until the shop owner has saved a
    // profile for the first time. Populated by GET /api/auth/shop-owners.
    shop: user.shop || null,
  };
};

function AdminUserManagement() {
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState("All Status");
  const [selectedShopStatus, setSelectedShopStatus] =
    useState("All Shop Status");
  const [selectedPeriod, setSelectedPeriod] =
  useState("This Year");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] =
    useState(null);
  const [viewing, setViewing] = useState(null);

  // ==========================
  // Load shop owners (with joined shop data) from backend
  // ==========================
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(SHOP_OWNERS_API_URL);

      const formattedUsers = Array.isArray(response.data?.data)
        ? response.data.data.map(formatUser)
        : [];

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error loading shop owners:", err);

      setError(
        err.response?.data?.message ||
          "Could not load shop owners. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================
  // View shop owner + their saved Shop Profile
  // ==========================
  const handleViewUser = (user) => {
    setViewing(user);
  };

  // ==========================
  // Update shop owner account (account fields only — role is always
  // shopOwner here; shop profile fields are edited by the owner themselves
  // on their own Shop Profile page, not from this admin table).
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

    // Prompts for the account's registered shop name (User.shopName) — not
    // the full Shop Profile shown in the "Shop" column, which is a separate
    // record the shop owner manages themselves and isn't editable here.
    const shopName = window.prompt(
      "Enter registered shop name:",
      user.shopName
    );

    if (shopName === null) {
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
        `${USERS_API_URL}/${user.id}`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          shopName: shopName.trim(),
          role: "shopOwner",
          status: status.trim() || "Active",
        }
      );

      const updatedUser = formatUser({
        ...response.data.user,
        shop: user.shop,
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? updatedUser
            : currentUser
        )
      );

      alert("Account updated successfully.");
    } catch (err) {
      console.error("Update User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not update the account."
      );
    }
  };

  // ==========================
  // Delete shop owner account
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

      await axios.delete(`${USERS_API_URL}/${user.id}`);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== user.id
        )
      );

      alert("Account deleted successfully.");
    } catch (err) {
      console.error("Delete User Error:", err);

      alert(
        err.response?.data?.message ||
          "Could not delete the account."
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // ==========================
  // Dynamic statistics
  // ==========================
  // Total Shop Owners: every registered shop-owner account, shop profile
  // saved or not — this is exactly what GET /api/auth/shop-owners already
  // returns (role: "shopOwner"), so no extra filtering needed here.
  const totalShopOwnersCount = users.length;

  // Active: has placed at least one order, ever.
  const activeUsersCount = users.filter(
    (user) => user.orderCount > 0
  ).length;

  // Inactive: no orders in the last 3 months — this also covers shop
  // owners who have never placed an order at all, not just ones who've
  // gone quiet after ordering before.
  const inactiveUsersCount = users.filter(
    (user) => !user.hasOrderInLast3Months
  ).length;

  // Pending Shop Approval: strictly shops actually sitting in the Shop
  // Approvals queue awaiting an Admin/Supervisor decision — not shop
  // owners who simply haven't registered a shop yet (those never entered
  // the approval queue in the first place).
  const pendingApprovalCount = users.filter(
    (user) => user.shop?.approvalStatus === "Pending"
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
      label: "Total Shop Owners",
      value: totalShopOwnersCount,
      change: `${totalShopOwnersCount} registered`,
      trend: "up",
      color: "var(--clothcore-purple)",
    },
    {
      label: "Active Shop Owners",
      value: activeUsersCount,
      change: `${activeUsersCount} with an order`,
      trend: "up",
      color: "var(--clothcore-success)",
    },
    {
      label: "Inactive Shop Owners",
      value: inactiveUsersCount,
      change: `${inactiveUsersCount} quiet 3+ months`,
      trend: "down",
      color: "var(--clothcore-danger)",
    },
    {
      label: "Pending Shop Approval",
      value: pendingApprovalCount,
      change: `${pendingApprovalCount} awaiting`,
      trend: pendingApprovalCount > 0 ? "down" : "up",
      color: "var(--clothcore-warning, #D98324)",
    },
    {
      label: "New Users",
      value: newUsersThisMonthCount,
      change: `${newUsersThisMonthCount} this month`,
      trend: "up",
      color: "var(--clothcore-mauve)",
    },
  ];

  // ==========================
  // Date-period filter
  // ==========================
  const matchesSelectedPeriod = useCallback(
    (user) => {
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
    },
    [selectedPeriod]
  );

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
        String(user.shop?.shopName || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        selectedStatus === "All Status" ||
        user.status === selectedStatus;

      const matchesShopStatus =
        selectedShopStatus === "All Shop Status" ||
        (selectedShopStatus === "No Shop Yet" && !user.shop) ||
        user.shop?.approvalStatus === selectedShopStatus;

      const matchesPeriod =
        matchesSelectedPeriod(user);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesShopStatus &&
        matchesPeriod
      );
    });
  }, [
    users,
    searchTerm,
    selectedStatus,
    selectedShopStatus,
    matchesSelectedPeriod,
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
  const statuses = [
    "All Status",
    "Active",
    "Inactive",
  ];

  const shopStatuses = [
    "All Shop Status",
    "No Shop Yet",
    "Pending",
    "Approved",
    "Rejected",
  ];


  return (
    <AdminLayout>
            {/* Page Header */}
            <div className="admin-page-header">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h2 className="admin-page-title mb-0">Shop Owner Management</h2>

                  <span
                    className="badge"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {filteredUsers.length} Shop Owners
                  </span>
                </div>

                <p className="admin-page-subtitle">
                  Shop owner accounts and the live Shop Profile details they've saved
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
                    className="card admin-stat-card h-100"
                    style={{
                      borderRadius: "14px",
                      boxShadow:
                        "var(--clothcore-shadow)",
                    }}
                  >
                    <div className="card-body p-3 p-xl-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "var(--clothcore-text-soft)",
                              fontWeight: "500",
                            }}
                          >
                            {stat.label}
                          </div>

                          <div
                            className="fw-bold"
                            style={{
                              fontSize: "24px",
                              color: "var(--clothcore-text)",
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
                            color="var(--clothcore-success)"
                          />
                        ) : (
                          <ArrowDown
                            size={14}
                            color="var(--clothcore-danger)"
                          />
                        )}

                        <span
                          style={{
                            fontSize: "12px",
                            color:
                              stat.trend === "up"
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

            {/* Search and Filters */}
            <div
              className="card admin-content-card mb-4"
              style={{
                borderRadius: "16px",
                boxShadow:
                  "var(--clothcore-shadow)",
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
                          color: "var(--clothcore-text-soft)",
                        }}
                      />

                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email or shop..."
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
                            "1.5px solid var(--clothcore-border)",
                          fontSize: "14px",
                          height: "42px",
                        }}
                      />
                    </div>
                  </div>
                                    <div className="col-lg-2">
                    <select
                      className="form-select"
                      value={selectedShopStatus}
                      onChange={(event) => {
                        setSelectedShopStatus(event.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: "10px",
                        border: "1.5px solid var(--clothcore-border)",
                        fontSize: "14px",
                        height: "42px",
                      }}
                    >
                      {shopStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
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
                        border: "1.5px solid var(--clothcore-border)",
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
                        border: "1.5px solid var(--clothcore-border)",
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
                        border: "1.5px solid var(--clothcore-border)",
                        fontSize: "14px",
                        height: "42px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        background: "rgba(82,43,91,0.06)",
                        color: "var(--clothcore-text)",
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
              className="card admin-content-card"
              style={{
                borderRadius: "16px",
                boxShadow: "var(--clothcore-shadow)",
              }}
            >
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover admin-table mb-0">
                    <thead style={{ background: "var(--clothcore-peach)" }}>
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
                          Shop
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Shop Status
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Account Status
                        </th>

                        <th className="px-4 py-3 small text-uppercase text-muted fw-bold">
                          Start Date
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
                              Loading shop owners...
                            </p>
                          </td>
                        </tr>
                      ) : currentUsers.length > 0 ? (
                        currentUsers.map((user, index) => {
                          return (
                            <tr key={user.id}>
                              <td
                                className="px-4 py-3 fw-bold"
                                style={{
                                  color: "var(--clothcore-text-soft)",
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
                                        "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))",
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
                                      color: "var(--clothcore-text)",
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
                                  color: "var(--clothcore-text-soft)",
                                }}
                              >
                                {user.email}
                              </td>

                              <td
                                className="px-4 py-3"
                                style={{
                                  fontSize: "13px",
                                  color: "var(--clothcore-text)",
                                }}
                              >
                                {user.shop ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <ShopLogo shop={user.shop} size={28} />
                                    {user.shop.shopName || "—"}
                                  </div>
                                ) : (
                                  "—"
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span className={`admin-badge ${shopBadgeClass(user.shop)}`}>
                                  {shopStatusLabel(user.shop)}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className="badge"
                                  style={{
                                    background:
                                      user.status === "Active"
                                        ? "var(--clothcore-success-bg)"
                                        : "var(--clothcore-danger-bg)",
                                    color:
                                      user.status === "Active"
                                        ? "var(--clothcore-success)"
                                        : "var(--clothcore-danger)",
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
                                  color: "var(--clothcore-text-soft)",
                                }}
                              >
                                {user.joinedDate}
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
                                      color: "var(--clothcore-text-soft)",
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
                                        View Shop Profile
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
                                        Edit Account
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
                                          : "Delete Account"}
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
                                No shop owners found matching your filters
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
                      color: "var(--clothcore-text-soft)",
                    }}
                  >
                    Showing {indexOfFirstUser + 1} to{" "}
                    {Math.min(
                      indexOfLastUser,
                      filteredUsers.length
                    )}{" "}
                    of {filteredUsers.length} shop owners
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
                            border: "1px solid var(--clothcore-border)",
                            color: "var(--clothcore-text)",
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
                                  : "1px solid var(--clothcore-border)",
                              background:
                                currentPage === pageNumber
                                  ? "linear-gradient(135deg, var(--clothcore-purple), var(--clothcore-mauve))"
                                  : "transparent",
                              color:
                                currentPage === pageNumber
                                  ? "white"
                                  : "var(--clothcore-text)",
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
                            border: "1px solid var(--clothcore-border)",
                            color: "var(--clothcore-text)",
                            padding: "6px 12px",
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* Shop Profile detail modal — mirrors exactly what the shop
                owner sees/edits on their own Shop Profile page. */}
            {viewing && (
              <div
                className="modal show d-block"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}
                onClick={() => setViewing(null)}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-content" style={{ borderRadius: "16px" }}>
                    <div className="modal-header border-0" style={{ padding: "24px 24px 0" }}>
                      <h5 className="modal-title fw-bold" style={{ color: "var(--clothcore-purple)", display: "flex", alignItems: "center", gap: "10px" }}>
                        {viewing.shop ? <ShopLogo shop={viewing.shop} size={32} /> : <ShopIcon size={16} />}
                        {viewing.shop?.shopName || `${viewing.name}'s Shop`}
                      </h5>
                      <button type="button" className="btn-close" onClick={() => setViewing(null)} />
                    </div>

                    <div className="modal-body" style={{ padding: "20px 24px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--clothcore-text-soft)", textTransform: "uppercase", marginBottom: "10px" }}>
                        Owner Account
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px", marginBottom: "20px" }}>
                        <div><div style={{ color: "var(--clothcore-text-muted)" }}>Name</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.name}</div></div>
                        <div><div style={{ color: "var(--clothcore-text-muted)" }}>Email</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.email}</div></div>
                        <div><div style={{ color: "var(--clothcore-text-muted)" }}>Account Status</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.status}</div></div>
                        <div><div style={{ color: "var(--clothcore-text-muted)" }}>Start Date</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.joinedDate}</div></div>
                      </div>

                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--clothcore-text-soft)", textTransform: "uppercase", marginBottom: "10px", borderTop: "1px solid var(--clothcore-border)", paddingTop: "16px" }}>
                        Shop Profile
                      </div>

                      {viewing.shop ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Shop Name</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.shopName || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Shop Code</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.shopCode || "Not assigned"}</div></div>
                          <div style={{ gridColumn: "1 / -1" }}><div style={{ color: "var(--clothcore-text-muted)" }}>Address</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.shopAddress || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Phone</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.phone || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Email</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.email || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>City</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.city || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>District</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.district || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Postal Code</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.postalCode || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Business Type</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.businessType || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Business Reg. No.</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.businessRegistrationNumber || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Garment Categories</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.garmentCategories || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Est. Monthly Volume</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.estimatedMonthlyVolume || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Preferred Payment</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.preferredPaymentMethod || "—"}</div></div>
                          <div><div style={{ color: "var(--clothcore-text-muted)" }}>Approval Status</div><div><span className={`admin-badge ${shopBadgeClass(viewing.shop)}`}>{shopStatusLabel(viewing.shop)}</span></div></div>
                          <div style={{ gridColumn: "1 / -1" }}><div style={{ color: "var(--clothcore-text-muted)" }}>Delivery Instructions</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.deliveryInstructions || "—"}</div></div>
                          <div style={{ gridColumn: "1 / -1" }}><div style={{ color: "var(--clothcore-text-muted)" }}>Description</div><div style={{ color: "var(--clothcore-text)" }}>{viewing.shop.businessDescription || "—"}</div></div>
                        </div>
                      ) : (
                        <div className="text-muted" style={{ fontSize: "13px" }}>
                          This shop owner hasn't set up their Shop Profile yet.
                        </div>
                      )}
                    </div>

                    <div className="modal-footer border-0" style={{ padding: "0 24px 24px" }}>
                      <button type="button" className="admin-btn-secondary" onClick={() => setViewing(null)}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
    </AdminLayout>
  );
}

export default AdminUserManagement;
