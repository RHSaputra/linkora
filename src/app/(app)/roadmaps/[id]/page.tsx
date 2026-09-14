"use client";

import { use } from "react";
import { RoadmapEditorPage } from "@/components/pages/roadmap-editor-page";

export default function RoadmapEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return <RoadmapEditorPage roadmapId={resolvedParams.id} />;
}
