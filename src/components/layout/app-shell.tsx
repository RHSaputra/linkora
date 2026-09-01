"use client";

import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { SerializedLink } from "@/lib/types";
import { LinkoraAIChat } from "@/components/layout/linkora-ai-chat";
import { QuickNoteButton } from "@/components/notes/quick-note-button";
import { invalidateCache, fetchWithCache, buildLinksUrl, dispatchRefresh } from "@/hooks/use-data";
import { LikoSuggestionNotification } from "@/components/ui/liko-suggestion-notification";
import { LikoWelcomeDialog } from "@/components/onboarding/liko-welcome-dialog";
import { OnboardingProvider } from "@/components/providers/onboarding-provider";
import { ProductTour } from "@/components/onboarding/product-tour";

// Heavy dialogs are code-split so they don't bloat the initial (app) bundle.
// They still behave identically; the chunk just loads on first render.
const AddLinkDialog = dynamic(
  () => import("@/components/links/add-link-dialog").then((m) => m.AddLinkDialog),
  { ssr: false }
);
const EditProfileDialog = dynamic(
  () => import("@/components/profile/edit-profile-dialog").then((m) => m.EditProfileDialog),
  { ssr: false }
);
const AuthRequiredDialog = dynamic(
  () => import("@/components/auth/auth-required-dialog").then((m) => m.AuthRequiredDialog),
  { ssr: false }
);

export interface AppShellContextType {
  refreshKey: number;
  triggerRefresh: () => void;
  openAddLink: () => void;
  openEditLink: (link: SerializedLink) => void;
  openEditProfile: () => void;
}

const AppShellContext = createContext<AppShellContextType>({
  refreshKey: 0,
  triggerRefresh: () => {},
  openAddLink: () => {},
  openEditLink: () => {},
  openEditProfile: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

interface AppShellProps {
  children:
    | React.ReactNode
    | ((props: AppShellContextType) => React.ReactNode);
}

export function AppShell({ children }: AppShellProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editLink, setEditLink] = useState<SerializedLink | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: session, status } = useSession();

  // Prefetch data for all main pages in background on mount.
  // Staggered: prioritize dashboard first, then secondary data after a short delay
  // Only runs when user is authenticated.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const schedule = typeof requestIdleCallback === "function" ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 50);
    
    // Phase 1: Dashboard data (highest priority — user sees this first)
    schedule(() => {
      fetchWithCache("/api/dashboard").catch(() => {});
    });

    // Phase 2: Secondary data after dashboard has had time to complete
    const secondaryTimer = setTimeout(() => {
      schedule(() => {
        fetchWithCache(buildLinksUrl({}, 1, 24)).catch(() => {});
        fetchWithCache("/api/collections").catch(() => {});
        fetchWithCache("/api/notes?").catch(() => {});
        fetchWithCache("/api/notes/folders").catch(() => {});
        fetchWithCache("/api/tags").catch(() => {});
      });
    }, 1500);

    return () => clearTimeout(secondaryTimer);
  }, [status, session?.user]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const openAddLink = useCallback(() => {
    setEditLink(null);
    setAddOpen(true);
  }, []);

  const openEditLink = useCallback((link: SerializedLink) => {
    setEditLink(link);
    setAddOpen(true);
  }, []);

  const openEditProfile = useCallback(() => {
    setProfileOpen(true);
  }, []);

  const handleSuccess = () => {
    // Invalidate all relevant caches so pages re-fetch fresh data
    invalidateCache("/api/links");
    invalidateCache("/api/dashboard");
    invalidateCache("/api/collections");
    triggerRefresh();
    // Only refresh the data resources that actually changed
    dispatchRefresh(["links", "dashboard", "collections"]);
  };

  const contextValue: AppShellContextType = {
    refreshKey,
    triggerRefresh,
    openAddLink,
    openEditLink,
    openEditProfile,
  };

  return (
    <OnboardingProvider>
      <AppShellContext.Provider value={contextValue}>
        <div className="flex min-h-screen relative w-full">
          <Sidebar onAddLink={openAddLink} onEditProfile={openEditProfile} />
          
          {/* Main Content Area - padded left to account for floating dock */}
          <main className="flex-1 overflow-x-hidden min-h-screen lg:pl-[310px] transition-all duration-300 relative z-10">
            <div className="w-full max-w-7xl px-4 py-8 lg:px-12 lg:py-12 pt-20 lg:pt-12">
              {typeof children === "function" ? children(contextValue) : children}
            </div>
          </main>

          <QuickNoteButton />
          <LinkoraAIChat />
          <LikoSuggestionNotification />
          <LikoWelcomeDialog onOpenEditProfile={openEditProfile} />
          <ProductTour />

          <AuthRequiredDialog />

          <EditProfileDialog
            open={profileOpen}
            onOpenChange={setProfileOpen}
          />

          <AddLinkDialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);
              if (!open) setEditLink(null);
            }}
            onSuccess={handleSuccess}
            editLink={editLink}
          />
        </div>
      </AppShellContext.Provider>
    </OnboardingProvider>
  );
}
