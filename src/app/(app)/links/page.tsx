"use client";

import { LinksPage } from "@/components/pages/links-page";
import { useAppShell } from "@/components/layout/app-shell";

export default function LinksRoute() {
  const { refreshKey, triggerRefresh, openEditLink } = useAppShell();
  return (
    <LinksPage
      refreshKey={refreshKey}
      triggerRefresh={triggerRefresh}
      openEditLink={openEditLink}
    />
  );
}
