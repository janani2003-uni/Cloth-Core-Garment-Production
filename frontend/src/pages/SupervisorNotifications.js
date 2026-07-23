// src/pages/SupervisorNotifications.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import RoleNotificationsView from "../components/RoleNotificationsView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorNotifications() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <RoleNotificationsView
        heading="Notifications"
        subtitle="Stage updates, delivery scheduling and payment issues that need your attention."
        dashboardPath="/supervisor-dashboard"
      />
    </RoleLayout>
  );
}

export default SupervisorNotifications;
