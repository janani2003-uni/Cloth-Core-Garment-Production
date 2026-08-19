import React from "react";
import ShopOwnerLayout from "../components/ShopOwnerLayout";
import RoleNotificationsView from "../components/RoleNotificationsView";

function Notifications() {
  return (
    <ShopOwnerLayout>
      <RoleNotificationsView
        heading="Notifications"
        subtitle="Updates about your orders, samples, payments and deliveries."
        dashboardPath="/dashboard"
        orderApprovedPath="/step5"
        orderStatusPath="/order-approval"
      />
    </ShopOwnerLayout>
  );
}

export default Notifications;
