// src/pages/Admin/AdminOrderApprovals.js
import React from "react";
import AdminLayout from "../../components/AdminLayout";
import ApprovalQueueView from "../../components/ApprovalQueueView";

function AdminOrderApprovals() {
  return (
    <AdminLayout>
      <ApprovalQueueView
        heading="Order Approvals"
        subtitle="Review stock and approve or reject orders submitted by shop owners."
      />
    </AdminLayout>
  );
}

export default AdminOrderApprovals;
