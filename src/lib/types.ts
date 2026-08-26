import { Link, Collection, Activity, CollectionLink } from "@prisma/client";
import { parseTags } from "./utils";

export type LinkWithRelations = Link & {
  collections?: (CollectionLink & { collection: Collection })[];
  activities?: Activity[];
};

export function serializeLink(link: LinkWithRelations) {
  return {
    ...link,
    tags: parseTags(link.tags),
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    lastOpenedAt: link.lastOpenedAt?.toISOString() ?? null,
    reminderAt: link.reminderAt?.toISOString() ?? null,
  };
}

export type SerializedLink = ReturnType<typeof serializeLink>;

export function serializeCollection(
  collection: Collection & { links?: { link: Link }[]; _count?: { links: number } }
) {
  return {
    ...collection,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    linkCount: collection._count?.links ?? collection.links?.length ?? 0,
  };
}

export type SerializedCollection = ReturnType<typeof serializeCollection>;

export function serializeActivity(
  activity: Activity & { link?: Link }
) {
  return {
    ...activity,
    createdAt: activity.createdAt.toISOString(),
    link: activity.link ? serializeLink(activity.link) : undefined,
  };
}

export type DashboardStats = {
  totalLinks: number;
  favoriteCount: number;
  categoryStats: { category: string; count: number }[];
  recentLinks: SerializedLink[];
  favoriteLinks: SerializedLink[];
  recentActivity: ReturnType<typeof serializeActivity>[];
  upcomingReminders: SerializedLink[];
};
