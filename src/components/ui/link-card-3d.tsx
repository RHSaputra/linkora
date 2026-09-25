"use client";

import { LinkCard } from "@/components/links/link-card";
import { SerializedLink } from "@/lib/types";
import { LinkViewMode } from "@/hooks/use-view-mode";

interface LinkCard3DProps {
  link: SerializedLink;
  index?: number;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (link: SerializedLink) => void;
  viewMode?: LinkViewMode;
}

export function LinkCard3D(props: LinkCard3DProps) {
  return <LinkCard {...props} />;
}
