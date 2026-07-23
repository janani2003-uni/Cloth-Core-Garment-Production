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
      />
    </ShopOwnerLayout>
  );
}

export default Notifications;
