export interface LayoutNode {
  id: string;
  positionX?: number;
  positionY?: number;
  [key: string]: any;
}

export interface LayoutEdge {
  sourceNodeId: string;
  targetNodeId: string;
  [key: string]: any;
}

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;
const GAP_X = 80;
const GAP_Y = 70;

/**
 * Calculates neat, non-overlapping coordinates for roadmap nodes.
 * Uses topological level layering combined with grid wrapping for readability.
 */
export function calculateAutoLayout<T extends LayoutNode>(
  nodes: T[],
  edges: LayoutEdge[] = []
): (T & { positionX: number; positionY: number })[] {
  if (!nodes || nodes.length === 0) return [];

  const nodeMap = new Map<string, T>();
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });

  edges.forEach((e) => {
    if (nodeMap.has(e.sourceNodeId) && nodeMap.has(e.targetNodeId)) {
      outEdges.get(e.sourceNodeId)?.push(e.targetNodeId);
      inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) || 0) + 1);
    }
  });

  // Determine levels using BFS / Topological ranking
  const levels = new Map<string, number>();
  const queue: string[] = [];

  // Find root nodes (inDegree === 0)
  nodes.forEach((n) => {
    if ((inDegree.get(n.id) || 0) === 0) {
      levels.set(n.id, 0);
      queue.push(n.id);
    }
  });

  // If cyclic or no clear root, assign initial level 0 to first node
  if (queue.length === 0 && nodes.length > 0) {
    levels.set(nodes[0].id, 0);
    queue.push(nodes[0].id);
  }

  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currLevel = levels.get(currId) || 0;
    const nextNodes = outEdges.get(currId) || [];

    for (const nextId of nextNodes) {
      const existingLevel = levels.get(nextId);
      if (existingLevel === undefined || existingLevel < currLevel + 1) {
        levels.set(nextId, currLevel + 1);
        queue.push(nextId);
      }
    }
  }

  // Handle any orphan nodes not assigned a level
  let fallbackLevel = 0;
  nodes.forEach((n) => {
    if (!levels.has(n.id)) {
      levels.set(n.id, fallbackLevel++);
    }
  });

  // Group nodes by level
  const maxLevel = Math.max(...Array.from(levels.values()), 0);
  const levelGroups: T[][] = Array.from({ length: maxLevel + 1 }, () => []);

  // Sort nodes in order of original array to maintain logical order within levels
  nodes.forEach((n) => {
    const lvl = levels.get(n.id) || 0;
    levelGroups[lvl].push(n);
  });

  // Determine layout style:
  // If total levels <= 5, linear left-to-right flow with vertical distribution for branches
  // Position calculation with guaranteed spacing
  const colWidth = NODE_WIDTH + GAP_X; // 340px
  const rowHeight = NODE_HEIGHT + GAP_Y; // 210px

  const START_X = 80;
  const START_Y = 80;
  const MAX_COLS_PER_ROW = 3; // Maximum 3 nodes per row for compact grid view if linear

  const isLinearChain = maxLevel >= nodes.length - 1 && nodes.length > 3;

  const result: (T & { positionX: number; positionY: number })[] = [];

  if (isLinearChain) {
    // Wrap long linear chains nicely into a multi-row grid (3 columns per row)
    nodes.forEach((n, idx) => {
      const col = idx % MAX_COLS_PER_ROW;
      const row = Math.floor(idx / MAX_COLS_PER_ROW);

      result.push({
        ...n,
        positionX: START_X + col * colWidth,
        positionY: START_Y + row * rowHeight,
      });
    });
  } else {
    // Level-based flowchart layout
    levelGroups.forEach((groupNodes, levelIdx) => {
      groupNodes.forEach((n, rankInLevel) => {
        result.push({
          ...n,
          positionX: START_X + levelIdx * colWidth,
          positionY: START_Y + rankInLevel * rowHeight,
        });
      });
    });
  }

  return result;
}
