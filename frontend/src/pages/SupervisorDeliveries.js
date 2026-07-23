// src/pages/SupervisorDeliveries.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import RoleDeliveriesView from "../components/RoleDeliveriesView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorDeliveries() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <RoleDeliveriesView
        heading="Deliveries"
        subtitle="Schedule, assign and track deliveries once production and payment conditions are met."
        canManage
      />
    </RoleLayout>
  );
}

export default SupervisorDeliveries;
