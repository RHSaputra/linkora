"use client";

import { DashboardPage } from "@/components/pages/dashboard-page";
import { useAppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  const { refreshKey, triggerRefresh, openEditLink } = useAppShell();
  return (
    <DashboardPage
      refreshKey={refreshKey}
      triggerRefresh={triggerRefresh}
      openEditLink={openEditLink}
    />
  );
}
