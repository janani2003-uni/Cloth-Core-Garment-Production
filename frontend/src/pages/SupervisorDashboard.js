// src/pages/SupervisorDashboard.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import ProductionOverviewDashboard from "../components/ProductionOverviewDashboard";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorDashboard() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <ProductionOverviewDashboard
        heading="Supervisor Dashboard"
        subtitle="Move orders through Cutting, Sewing, Quality Assurance and Packing as production progresses."
        canUpdateStage
        canAssign
      />
    </RoleLayout>
  );
}

export default SupervisorDashboard;
