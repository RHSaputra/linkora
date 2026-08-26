"use client";

import { CollectionsPage } from "@/components/pages/collections-page";
import { useAppShell } from "@/components/layout/app-shell";

export default function CollectionsRoute() {
  const { refreshKey, triggerRefresh, openEditLink } = useAppShell();
  return (
    <CollectionsPage
      refreshKey={refreshKey}
      triggerRefresh={triggerRefresh}
      openEditLink={openEditLink}
    />
  );
}
