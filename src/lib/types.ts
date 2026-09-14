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

export type RoadmapNodeType = "LINK" | "TASK" | "NOTE";
export type RoadmapNodeStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export function serializeRoadmapNode(node: any) {
  return {
    ...node,
    createdAt: node.createdAt ? new Date(node.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: node.updatedAt ? new Date(node.updatedAt).toISOString() : new Date().toISOString(),
    link: node.link ? serializeLink(node.link) : null,
  };
}

export function serializeRoadmapEdge(edge: any) {
  return {
    ...edge,
    createdAt: edge.createdAt ? new Date(edge.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function serializeRoadmap(roadmap: any) {
  const nodes = (roadmap.nodes || []).map(serializeRoadmapNode);
  const edges = (roadmap.edges || []).map(serializeRoadmapEdge);

  const totalNodes = nodes.length;
  const completedNodes = nodes.filter((n: any) => n.status === "COMPLETED").length;
  const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return {
    id: roadmap.id,
    userId: roadmap.userId,
    title: roadmap.title,
    description: roadmap.description || "",
    createdAt: roadmap.createdAt ? new Date(roadmap.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: roadmap.updatedAt ? new Date(roadmap.updatedAt).toISOString() : new Date().toISOString(),
    nodes,
    edges,
    totalNodes,
    completedNodes,
    progressPercent,
  };
}

export type SerializedRoadmapNode = ReturnType<typeof serializeRoadmapNode>;
export type SerializedRoadmapEdge = ReturnType<typeof serializeRoadmapEdge>;
export type SerializedRoadmap = ReturnType<typeof serializeRoadmap>;
