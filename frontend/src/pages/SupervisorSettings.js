// src/pages/SupervisorSettings.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import RoleSettingsView from "../components/RoleSettingsView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

const SUPERVISOR_TOGGLES = [
  { key: "orderUpdates", label: "Order assignment notifications" },
  { key: "productionAlerts", label: "Production alerts" },
  { key: "paymentAlerts", label: "Payment issue alerts" },
  { key: "deliveryAlerts", label: "Delivery alerts" },
];

function SupervisorSettings() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <RoleSettingsView
        heading="Settings"
        subtitle="Manage your notification preferences and account security."
        toggles={SUPERVISOR_TOGGLES}
      />
    </RoleLayout>
  );
}

export default SupervisorSettings;
