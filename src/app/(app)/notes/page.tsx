"use client";

import { Suspense } from "react";
import { NotesPage } from "@/components/pages/notes-page";

export default function NotesRoute() {
  return (
    <Suspense>
      <NotesPage />
    </Suspense>
  );
}
