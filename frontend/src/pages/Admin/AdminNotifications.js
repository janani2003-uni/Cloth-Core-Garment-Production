import React from "react";
import AdminLayout from "../../components/AdminLayout";
import RoleNotificationsView from "../../components/RoleNotificationsView";

function AdminNotifications() {
  return (
    <AdminLayout>
      <RoleNotificationsView
        heading="Notifications"
        subtitle="System-wide alerts about orders, payments, shops and support tickets."
        dashboardPath="/admin-dashboard"
        feedPath=""
        orderQueuePath="/admin/order-approvals"
      />
    </AdminLayout>
  );
}

export default AdminNotifications;
