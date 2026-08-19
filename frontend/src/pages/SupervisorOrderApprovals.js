// src/pages/SupervisorOrderApprovals.js
import React from "react";
import RoleLayout from "../components/RoleLayout";
import ApprovalQueueView from "../components/ApprovalQueueView";
import { SUPERVISOR_NAV_ITEMS } from "../components/roleNav";

function SupervisorOrderApprovals() {
  return (
    <RoleLayout sidebarItems={SUPERVISOR_NAV_ITEMS} roleLabel="Supervisor">
      <ApprovalQueueView
        heading="Order Approvals"
        subtitle="Review stock and approve or reject orders submitted by shop owners."
      />
    </RoleLayout>
  );
}

export default SupervisorOrderApprovals;
