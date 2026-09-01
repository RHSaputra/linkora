"use client";

import { useSession } from "next-auth/react";

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;

  /**
   * Checks if user is authenticated.
   * If NOT authenticated, triggers the Auth Required Modal and returns `true` (indicating blocked).
   * If authenticated, returns `false` (indicating allowed to proceed).
   */
  const requireAuth = (actionName = "Fitur ini", actionDesc?: string): boolean => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("open-auth-modal", {
            detail: { actionName, actionDesc },
          })
        );
      }
      return true; // Blocked / intercepted
    }
    return false; // Allowed
  };

  return { isAuthenticated, requireAuth };
}
