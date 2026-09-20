"use client";

import dynamic from "next/dynamic";

const CursorFollower = dynamic(
  () => import("@/components/ui/cursor-follower").then((m) => m.CursorFollower),
  { ssr: false }
);

const BackToTop = dynamic(
  () => import("@/components/ui/back-to-top").then((m) => m.BackToTop),
  { ssr: false }
);

export function LandingClientAddons() {
  return (
    <>
      <CursorFollower />
      <BackToTop />
    </>
  );
}
