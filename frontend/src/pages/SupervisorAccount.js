// src/pages/SupervisorAccount.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import RoleAccountView from "../components/RoleAccountView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorAccount() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <RoleAccountView settingsPath="/supervisor/settings" />
    </RoleLayout>
  );
}

export default SupervisorAccount;
