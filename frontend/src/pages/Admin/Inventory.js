import React, { useState, useEffect } from "react";
import Adminsidebar from "../../components/Adminsidebar";
import Admintopbar from "../../components/Admintopbar";
import axios from "axios";

import {
  Search,
  BoxSeam,
  CheckCircle,
  ExclamationTriangle,
  XCircle,
  Eye,
  PencilSquare,
  Trash,
  PlusCircle,
  Wallet2,
  Box,
  Folder2Open,
  Palette,
  CircleFill,
  ArrowCounterclockwise,
  X,
} from "react-bootstrap-icons";

const API_URL = "http://localhost:5000/api/inventory";

// Main Inventory Management Component
function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedColor, setSelectedColor] = useState("All Colors");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Inventory");
  const [currentPage, setCurrentPage] = useState(1);

  // MongoDB states
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingItem, setSavingItem] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  // Add Item form state
  const emptyInventoryForm = {
    itemName: "",
    sku: "",
    category: "Fabrics",
    color: "White",
    stockQuantity: "",
    unit: "Meter",
    unitCost: "",
    minimumStock: 100,
    description: ""
  };

  const [formData, setFormData] = useState(emptyInventoryForm);

  // Edit Item form state
  const [editFormData, setEditFormData] = useState({
    itemName: "",
    sku: "",
    category: "",
    color: "",
    stockQuantity: "",
    unit: "",
    unitCost: "",
    minimumStock: 100,
    description: ""
  });

  const itemsPerPage = 7;

  // Color options
  const colorOptions = ["White", "Black", "Navy Blue", "Red", "Grey", "Yellow", "Green"];
  
  const colorHexMap = {
    "White": "#FFFFFF",
    "Black": "#1A1A1A",
    "Navy Blue": "#1B2A4A",
    "Red": "#DC3545",
    "Grey": "#808080",
    "Yellow": "#FFD700",
    "Green": "#2E8B57",
  };

  const statuses = ["In Stock", "Low Stock", "Out of Stock"];

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API_URL);
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch Inventory Error:", err);
      setError(err.response?.data?.message || "Could not load inventory items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calculate statistics from real backend data
  const totalItems = items.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
  const inStockItems = items
    .filter(item => item.status === "In Stock")
    .reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
  const lowStockItems = items
    .filter(item => item.status === "Low Stock")
    .reduce((sum, item) => sum + (item.stockQuantity || 0), 0);
  const outOfStockItems = items
    .filter(item => item.status === "Out of Stock")
    .length;
  const totalValue = items.reduce((sum, item) => sum + ((item.stockQuantity || 0) * (item.unitCost || 0)), 0);

  // Categories with counts
  const categories = {
    "All Categories": items.length,
    "Fabrics": items.filter(item => item.category === "Fabrics").length,
    "Threads": items.filter(item => item.category === "Threads").length,
    "Zippers": items.filter(item => item.category === "Zippers").length,
    "Buttons": items.filter(item => item.category === "Buttons").length,
    "Labels & Tags": items.filter(item => item.category === "Labels & Tags").length,
    "Accessories": items.filter(item => item.category === "Accessories").length,
  };

  // Filter items
  const filteredData = items.filter((item) => {
    const searchValue = searchTerm.trim().toLowerCase();
    const matchesSearch =
      String(item.itemName || "").toLowerCase().includes(searchValue) ||
      String(item.sku || "").toLowerCase().includes(searchValue) ||
      String(item.category || "").toLowerCase().includes(searchValue);
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    const matchesColor = selectedColor === "All Colors" || item.color === selectedColor;
    const matchesStatus = selectedStatus === "All Status" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesColor && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedColor, selectedStatus]);

  // Handle Add Item form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Add Item Submit
  const handleAddItem = async () => {
    // Validate
    if (!formData.itemName.trim()) {
      alert("Item Name is required");
      return;
    }
    if (!formData.sku.trim()) {
      alert("SKU is required");
      return;
    }
    if (!formData.category) {
      alert("Category is required");
      return;
    }
    if (formData.stockQuantity === "" || Number(formData.stockQuantity) < 0) {
      alert("Stock Quantity must be 0 or more");
      return;
    }
    if (!formData.unit) {
      alert("Unit is required");
      return;
    }
    if (formData.unitCost === "" || Number(formData.unitCost) < 0) {
      alert("Unit Cost must be 0 or more");
      return;
    }

    const payload = {
      itemName: formData.itemName.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,
      color: formData.color,
      stockQuantity: Number(formData.stockQuantity),
      unit: formData.unit,
      unitCost: Number(formData.unitCost),
      minimumStock: Number(formData.minimumStock || 100),
      description: formData.description.trim()
    };

    try {
      setSavingItem(true);
      const response = await axios.post(API_URL, payload);
      alert(response.data.message || "Item added successfully!");
      setShowAddModal(false);
      setFormData(emptyInventoryForm);
      await fetchInventory();
    } catch (err) {
      console.error("Add Item Error:", err);
      alert(err.response?.data?.message || "Failed to add item.");
    } finally {
      setSavingItem(false);
    }
  };

  // View Item
  const handleView = async (item) => {
    try {
      const response = await axios.get(`${API_URL}/${item._id}`);
      setSelectedItem(response.data);
      setShowViewModal(true);
    } catch (err) {
      console.error("View Item Error:", err);
      alert(err.response?.data?.message || "Could not load item details.");
    }
  };

  // Edit Item
  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditFormData({
      itemName: item.itemName || "",
      sku: item.sku || "",
      category: item.category || "",
      color: item.color || "",
      stockQuantity: item.stockQuantity ?? "",
      unit: item.unit || "",
      unitCost: item.unitCost ?? "",
      minimumStock: item.minimumStock ?? 100,
      description: item.description || ""
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedItem?._id) {
      alert("No item selected");
      return;
    }

    // Validate
    if (!editFormData.itemName.trim()) {
      alert("Item Name is required");
      return;
    }
    if (!editFormData.sku.trim()) {
      alert("SKU is required");
      return;
    }
    if (!editFormData.category) {
      alert("Category is required");
      return;
    }
    if (editFormData.stockQuantity === "" || Number(editFormData.stockQuantity) < 0) {
      alert("Stock Quantity must be 0 or more");
      return;
    }
    if (!editFormData.unit) {
      alert("Unit is required");
      return;
    }
    if (editFormData.unitCost === "" || Number(editFormData.unitCost) < 0) {
      alert("Unit Cost must be 0 or more");
      return;
    }

    const payload = {
      itemName: editFormData.itemName.trim(),
      sku: editFormData.sku.trim().toUpperCase(),
      category: editFormData.category,
      color: editFormData.color,
      stockQuantity: Number(editFormData.stockQuantity),
      unit: editFormData.unit,
      unitCost: Number(editFormData.unitCost),
      minimumStock: Number(editFormData.minimumStock || 100),
      description: editFormData.description.trim()
    };

    try {
      setUpdatingItem(true);
      const response = await axios.put(`${API_URL}/${selectedItem._id}`, payload);
      alert(response.data.message || "Item updated successfully!");
      setShowEditModal(false);
      setSelectedItem(null);
      await fetchInventory();
    } catch (err) {
      console.error("Edit Item Error:", err);
      alert(err.response?.data?.message || "Failed to update item.");
    } finally {
      setUpdatingItem(false);
    }
  };

  // Delete Item
  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.itemName}"?`);
    if (!confirmed) return;

    try {
      setDeletingItemId(item._id);
      const response = await axios.delete(`${API_URL}/${item._id}`);
      alert(response.data.message || "Item deleted successfully!");
      await fetchInventory();
    } catch (err) {
      console.error("Delete Item Error:", err);
      alert(err.response?.data?.message || "Failed to delete item.");
    } finally {
      setDeletingItemId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "In Stock":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      case "Low Stock":
        return { bg: "#fff3e0", color: "#e65100" };
      case "Out of Stock":
        return { bg: "#fce4ec", color: "#c62828" };
      default:
        return { bg: "#f5f5f5", color: "#616161" };
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f0f2f7",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <Adminsidebar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div style={{
        flex: 1,
        transition: "margin-left 0.3s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}>
        <Admintopbar />

        <div style={{ padding: "20px 24px", flex: 1 }}>
          {/* Loading State */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 style={{ marginTop: "16px", color: "#1a2332" }}>Loading inventory...</h5>
            </div>
          ) : error ? (
            <div style={{ 
              backgroundColor: "#fce4ec", 
              color: "#c62828", 
              padding: "16px 20px", 
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              {error}
              <button 
                onClick={fetchInventory}
                style={{
                  marginLeft: "16px",
                  padding: "6px 16px",
                  backgroundColor: "#c62828",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(5, 1fr)", 
                gap: "14px",
                marginBottom: "20px"
              }}>
                {[
                  { label: "Total Items", value: totalItems.toLocaleString(), icon: BoxSeam, color: "#2d4a8a", bg: "#e8edf5" },
                  { label: "In Stock", value: inStockItems.toLocaleString(), icon: CheckCircle, color: "#2e7d32", bg: "#e8f5e9" },
                  { label: "Low Stock", value: lowStockItems.toLocaleString(), icon: ExclamationTriangle, color: "#e65100", bg: "#fff3e0" },
                  { label: "Out of Stock", value: outOfStockItems.toLocaleString(), icon: XCircle, color: "#c62828", bg: "#fce4ec" },
                  { label: "Total Value", value: `Rs. ${totalValue.toLocaleString()}`, icon: Wallet2, color: "#2d4a8a", bg: "#e8edf5" },
                ].map((stat, index) => (
                  <div key={index} style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid #e8ecf1"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ color: "#6b7a8f", fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>
                          {stat.label}
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a2332" }}>
                          {stat.value}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: stat.bg,
                        borderRadius: "8px",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <stat.icon size={18} color={stat.color} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                {/* Left Sidebar */}
                <div style={{ 
                  width: "220px", 
                  flexShrink: 0,
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border: "1px solid #e8ecf1",
                  height: "fit-content"
                }}>
                  {/* Categories */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a2332",
                      marginBottom: "8px"
                    }}>
                      <Folder2Open size={16} color="#2d4a8a" /> Categories
                    </div>
                    {Object.entries(categories).map(([category, count]) => (
                      <div
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          backgroundColor: selectedCategory === category ? "#e8edf5" : "transparent",
                          color: selectedCategory === category ? "#2d4a8a" : "#4a5568",
                          fontWeight: selectedCategory === category ? "600" : "400",
                          fontSize: "13px",
                          transition: "all 0.2s"
                        }}
                      >
                        <span>{category}</span>
                        <span style={{
                          backgroundColor: selectedCategory === category ? "#2d4a8a" : "#e8ecf1",
                          color: selectedCategory === category ? "white" : "#4a5568",
                          padding: "0 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "500"
                        }}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Colors */}
                  <div>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1a2332",
                      marginBottom: "8px"
                    }}>
                      <Palette size={16} color="#2d4a8a" /> Colors
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            padding: "4px 10px",
                            backgroundColor: selectedColor === color ? "#2d4a8a" : "white",
                            color: selectedColor === color ? "white" : "#4a5568",
                            border: selectedColor === color ? "none" : "1px solid #dce0e6",
                            borderRadius: "4px",
                            fontSize: "12px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <CircleFill size={10} color={colorHexMap[color] || "#000"} />
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Content */}
                <div style={{ flex: 1 }}>
                  {/* Search and Filters */}
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid #e8ecf1"
                  }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                        <Search size={16} style={{ 
                          position: "absolute", 
                          left: "10px", 
                          top: "50%", 
                          transform: "translateY(-50%)",
                          color: "#6b7a8f"
                        }} />
                        <input
                          type="text"
                          placeholder="Search by item name, SKU or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 34px",
                            border: "1px solid #dce0e6",
                            borderRadius: "4px",
                            fontSize: "14px",
                            outline: "none"
                          }}
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #dce0e6",
                          borderRadius: "4px",
                          fontSize: "14px",
                          backgroundColor: "white",
                          minWidth: "120px",
                          outline: "none"
                        }}
                      >
                        <option>All Categories</option>
                        <option>Fabrics</option>
                        <option>Threads</option>
                        <option>Zippers</option>
                        <option>Buttons</option>
                        <option>Labels & Tags</option>
                        <option>Accessories</option>
                      </select>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #dce0e6",
                          borderRadius: "4px",
                          fontSize: "14px",
                          backgroundColor: "white",
                          minWidth: "110px",
                          outline: "none"
                        }}
                      >
                        <option>All Colors</option>
                        {colorOptions.map(color => (
                          <option key={color}>{color}</option>
                        ))}
                      </select>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #dce0e6",
                          borderRadius: "4px",
                          fontSize: "14px",
                          backgroundColor: "white",
                          minWidth: "110px",
                          outline: "none"
                        }}
                      >
                        <option>All Status</option>
                        {statuses.map(status => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setSelectedColor("All Colors");
                          setSelectedStatus("All Status");
                          setSearchTerm("");
                        }}
                        style={{
                          padding: "8px 14px",
                          backgroundColor: "white",
                          border: "1px solid #dce0e6",
                          borderRadius: "4px",
                          color: "#4a5568",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "14px"
                        }}
                      >
                        <ArrowCounterclockwise size={14} /> Reset
                      </button>
                      <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                          padding: "8px 18px",
                          backgroundColor: "#2d4a8a",
                          border: "none",
                          borderRadius: "4px",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <PlusCircle size={14} /> Add Item
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid #e8ecf1",
                    overflow: "hidden"
                  }}>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px"
                      }}>
                        <thead>
                          <tr style={{
                            backgroundColor: "#f8f9fb",
                            borderBottom: "1px solid #e8ecf1"
                          }}>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>#</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Item</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Item Name</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>SKU</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Category</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Color</th>
                            <th style={{ padding: "10px 14px", textAlign: "right", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Stock Qty</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Unit</th>
                            <th style={{ padding: "10px 14px", textAlign: "right", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Unit Cost</th>
                            <th style={{ padding: "10px 14px", textAlign: "right", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Total Value</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Status</th>
                            <th style={{ padding: "10px 14px", textAlign: "center", color: "#4a5568", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length === 0 ? (
                            <tr>
                              <td colSpan="12" style={{ textAlign: "center", padding: "40px 20px", color: "#6b7a8f" }}>
                                <Box size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
                                <div style={{ fontSize: "16px", fontWeight: "500" }}>No inventory items found</div>
                                <div style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your search or filters</div>
                              </td>
                            </tr>
                          ) : (
                            currentItems.map((item, index) => {
                              const statusStyle = getStatusStyle(item.status);
                              const totalValue = (item.stockQuantity || 0) * (item.unitCost || 0);
                              return (
                                <tr key={item._id} style={{
                                  borderBottom: "1px solid #f0f2f7",
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fb"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                  <td style={{ padding: "10px 14px", color: "#4a5568", fontSize: "13px" }}>
                                    {indexOfFirstItem + index + 1}
                                  </td>
                                  <td style={{ padding: "10px 14px" }}>
                                    <div style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "4px",
                                      backgroundColor: "#e8ecf1",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "16px",
                                      fontWeight: "600",
                                      color: "#4a5568"
                                    }}>
                                      {item.itemName ? item.itemName.charAt(0).toUpperCase() : "?"}
                                    </div>
                                  </td>
                                  <td style={{ padding: "10px 14px" }}>
                                    <div style={{ fontWeight: "600", color: "#1a2332", fontSize: "14px" }}>{item.itemName}</div>
                                    <div style={{ fontSize: "11px", color: "#6b7a8f" }}>{item.description}</div>
                                  </td>
                                  <td style={{ padding: "10px 14px", color: "#6b7a8f", fontSize: "12px" }}>{item.sku}</td>
                                  <td style={{ padding: "10px 14px", color: "#4a5568", fontSize: "13px" }}>{item.category}</td>
                                  <td style={{ padding: "10px 14px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <CircleFill size={11} color={colorHexMap[item.color] || "#000"} />
                                      <span style={{ fontSize: "13px" }}>{item.color}</span>
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600", color: "#1a2332", fontSize: "14px" }}>
                                    {item.stockQuantity}
                                  </td>
                                  <td style={{ padding: "10px 14px", color: "#4a5568", fontSize: "13px" }}>{item.unit}</td>
                                  <td style={{ padding: "10px 14px", textAlign: "right", color: "#4a5568", fontSize: "13px" }}>
                                    Rs. {item.unitCost?.toFixed(2) || "0.00"}
                                  </td>
                                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: "600", color: "#1a2332", fontSize: "14px" }}>
                                    Rs. {totalValue.toLocaleString()}
                                  </td>
                                  <td style={{ padding: "10px 14px" }}>
                                    <span style={{
                                      padding: "3px 10px",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      backgroundColor: statusStyle.bg,
                                      color: statusStyle.color
                                    }}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                    <Eye
                                      size={16}
                                      style={{ 
                                        color: "#2d4a8a", 
                                        cursor: "pointer", 
                                        marginRight: "8px",
                                        transition: "all 0.2s"
                                      }}
                                      onClick={() => handleView(item)}
                                    />
                                    <PencilSquare
                                      size={16}
                                      style={{ 
                                        color: "#2e7d32", 
                                        cursor: "pointer", 
                                        marginRight: "8px",
                                        transition: "all 0.2s"
                                      }}
                                      onClick={() => handleEdit(item)}
                                    />
                                    <Trash
                                      size={16}
                                      style={{ 
                                        color: deletingItemId === item._id ? "#6b7a8f" : "#c62828", 
                                        cursor: deletingItemId === item._id ? "not-allowed" : "pointer",
                                        transition: "all 0.2s",
                                        opacity: deletingItemId === item._id ? 0.5 : 1
                                      }}
                                      onClick={() => handleDelete(item)}
                                    />
                                    {deletingItemId === item._id && (
                                      <span style={{ marginLeft: "4px", fontSize: "11px", color: "#6b7a8f" }}>
                                        <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }} />
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderTop: "1px solid #e8ecf1",
                      backgroundColor: "#f8f9fb"
                    }}>
                      <span style={{ color: "#6b7a8f", fontSize: "13px" }}>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} items
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          style={{
                            padding: "6px 14px",
                            border: "1px solid #dce0e6",
                            borderRadius: "4px",
                            backgroundColor: "white",
                            color: currentPage === 1 ? "#adb5bd" : "#6b7a8f",
                            fontSize: "13px",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer"
                          }}
                        >
                          Previous
                        </button>
                        <button style={{
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "4px",
                          backgroundColor: "#2d4a8a",
                          color: "white",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: "500"
                        }}>
                          {currentPage}
                        </button>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: "6px 14px",
                            border: "1px solid #dce0e6",
                            borderRadius: "4px",
                            backgroundColor: "white",
                            color: currentPage === totalPages ? "#adb5bd" : "#6b7a8f",
                            fontSize: "13px",
                            cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "600px",
            maxWidth: "95%",
            maxHeight: "90vh",
            overflow: "auto",
            padding: "0"
          }}>
            <div style={{
              padding: "22px 28px",
              borderBottom: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#1a2332" }}>
                Add New Inventory Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "26px",
                  cursor: "pointer",
                  color: "#6b7a8f"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    placeholder="Enter item name"
                    value={formData.itemName}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px", backgroundColor: "white" }}
                  >
                    <option value="Fabrics">Fabrics</option>
                    <option value="Threads">Threads</option>
                    <option value="Zippers">Zippers</option>
                    <option value="Buttons">Buttons</option>
                    <option value="Labels & Tags">Labels & Tags</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Color
                  </label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px", backgroundColor: "white" }}
                  >
                    {colorOptions.map(color => (
                      <option key={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    placeholder="Enter quantity"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px", backgroundColor: "white" }}
                  >
                    <option value="Meter">Meter</option>
                    <option value="Piece">Piece</option>
                    <option value="Roll">Roll</option>
                    <option value="Cone">Cone</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Unit Cost (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="unitCost"
                    placeholder="Enter cost"
                    value={formData.unitCost}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    placeholder="Enter minimum stock"
                    value={formData.minimumStock}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={handleFormChange}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #dce0e6", borderRadius: "4px", fontSize: "14px", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              backgroundColor: "#f8f9fb",
              borderRadius: "0 0 12px 12px"
            }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "white",
                  border: "1px solid #dce0e6",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#4a5568"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={savingItem}
                style={{
                  padding: "8px 20px",
                  backgroundColor: savingItem ? "#6b7a8f" : "#2d4a8a",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: savingItem ? "not-allowed" : "pointer",
                  color: "white",
                  opacity: savingItem ? 0.7 : 1
                }}
              >
                {savingItem ? "Saving..." : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {showViewModal && selectedItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={(e) => {
          if (e.target === e.currentTarget) setShowViewModal(false);
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "420px",
            maxWidth: "95%",
            padding: "0"
          }}>
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a2332" }}>
                Item Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7a8f"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "6px",
                  backgroundColor: "#e8ecf1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "#4a5568"
                }}>
                  {selectedItem.itemName ? selectedItem.itemName.charAt(0).toUpperCase() : "?"}
                </div>
                <h4 style={{ margin: "4px 0", fontSize: "16px", fontWeight: "600", color: "#1a2332" }}>
                  {selectedItem.itemName}
                </h4>
                <span style={{ fontSize: "12px", color: "#6b7a8f" }}>{selectedItem.sku}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Category</div>
                  <div style={{ fontWeight: "500", color: "#1a2332", fontSize: "14px" }}>{selectedItem.category}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "500", color: "#1a2332", fontSize: "14px" }}>
                    <CircleFill size={11} color={colorHexMap[selectedItem.color] || "#000"} />
                    {selectedItem.color}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Quantity</div>
                  <div style={{ fontWeight: "500", color: "#1a2332", fontSize: "14px" }}>{selectedItem.stockQuantity} {selectedItem.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Unit Cost</div>
                  <div style={{ fontWeight: "500", color: "#1a2332", fontSize: "14px" }}>Rs. {selectedItem.unitCost?.toFixed(2) || "0.00"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Total Value</div>
                  <div style={{ fontWeight: "600", color: "#1a2332", fontSize: "16px" }}>
                    Rs. {((selectedItem.stockQuantity || 0) * (selectedItem.unitCost || 0)).toLocaleString()}
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Status</div>
                  <span style={{
                    padding: "3px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    backgroundColor: getStatusStyle(selectedItem.status).bg,
                    color: getStatusStyle(selectedItem.status).color
                  }}>
                    {selectedItem.status}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#6b7a8f", marginBottom: "2px" }}>Description</div>
                  <div style={{ color: "#4a5568", fontSize: "14px" }}>{selectedItem.description}</div>
                </div>
              </div>
            </div>
            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#f8f9fb",
              borderRadius: "0 0 12px 12px"
            }}>
              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "white",
                  border: "1px solid #dce0e6",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#4a5568"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={(e) => {
          if (e.target === e.currentTarget) setShowEditModal(false);
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "540px",
            maxWidth: "95%",
            maxHeight: "90vh",
            overflow: "auto",
            padding: "0"
          }}>
            <div style={{
              padding: "18px 24px",
              borderBottom: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a2332" }}>
                Edit Inventory Item
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#6b7a8f",
                  padding: "4px"
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={editFormData.itemName}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8f9fb"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Category *
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      outline: "none"
                    }}
                  >
                    <option value="Fabrics">Fabrics</option>
                    <option value="Threads">Threads</option>
                    <option value="Zippers">Zippers</option>
                    <option value="Buttons">Buttons</option>
                    <option value="Labels & Tags">Labels & Tags</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={editFormData.sku}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8f9fb"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Color
                  </label>
                  <select
                    name="color"
                    value={editFormData.color}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      outline: "none"
                    }}
                  >
                    {colorOptions.map(color => (
                      <option key={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={editFormData.unit}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      outline: "none"
                    }}
                  >
                    <option value="Meter">Meter</option>
                    <option value="Piece">Piece</option>
                    <option value="Roll">Roll</option>
                    <option value="Cone">Cone</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={editFormData.stockQuantity}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8f9fb"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Unit Cost (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="unitCost"
                    value={editFormData.unitCost}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8f9fb"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={editFormData.minimumStock}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "#f8f9fb"
                    }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "500", color: "#1a2332" }}>
                    Description / Notes
                  </label>
                  <textarea
                    name="description"
                    rows="2"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dce0e6",
                      borderRadius: "4px",
                      fontSize: "14px",
                      resize: "vertical",
                      outline: "none",
                      backgroundColor: "#f8f9fb",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid #e8ecf1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              backgroundColor: "#f8f9fb",
              borderRadius: "0 0 12px 12px"
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "white",
                  border: "1px solid #dce0e6",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#4a5568",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={updatingItem}
                style={{
                  padding: "8px 20px",
                  backgroundColor: updatingItem ? "#6b7a8f" : "#2d4a8a",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: updatingItem ? "not-allowed" : "pointer",
                  color: "white",
                  opacity: updatingItem ? 0.7 : 1
                }}
              >
                {updatingItem ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;