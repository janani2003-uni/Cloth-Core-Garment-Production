// src/pages/SupervisorOrders.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import RoleOrdersView from "../components/RoleOrdersView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorOrders() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <RoleOrdersView
        heading="Orders"
        subtitle="Monitor production-related order details across every shop."
        canManageSample
      />
    </RoleLayout>
  );
}

export default SupervisorOrders;
