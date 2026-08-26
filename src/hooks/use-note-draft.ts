"use client";

/**
 * Local draft management for notes.
 * 
 * Saves drafts to localStorage as a safety net for:
 * - Network failures
 * - Browser crashes
 * - Accidental tab closure
 * 
 * Each note has one draft keyed by its ID. The draft includes
 * a timestamp and version number for conflict detection.
 */

const DRAFT_PREFIX = 'note-draft-';

export interface NoteDraft {
  noteId: string;
  title: string;
  content: string;
  savedAt: number; // Unix timestamp in ms
  version: number; // The DB version the draft was based on
}

function getDraftKey(noteId: string): string {
  return `${DRAFT_PREFIX}${noteId}`;
}

/**
 * Save a draft to localStorage.
 */
export function saveDraft(noteId: string, data: Omit<NoteDraft, 'noteId' | 'savedAt'>): void {
  try {
    const draft: NoteDraft = {
      noteId,
      title: data.title,
      content: data.content,
      savedAt: Date.now(),
      version: data.version,
    };
    localStorage.setItem(getDraftKey(noteId), JSON.stringify(draft));
  } catch (error) {
    // localStorage might be full or disabled
    console.warn('Failed to save local draft:', error);
  }
}

/**
 * Load a draft from localStorage.
 * Returns null if no draft exists or if parsing fails.
 */
export function loadDraft(noteId: string): NoteDraft | null {
  try {
    const raw = localStorage.getItem(getDraftKey(noteId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as NoteDraft;
    // Validate shape
    if (
      draft &&
      typeof draft.noteId === 'string' &&
      typeof draft.title === 'string' &&
      typeof draft.content === 'string' &&
      typeof draft.savedAt === 'number' &&
      typeof draft.version === 'number'
    ) {
      return draft;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Remove a draft from localStorage.
 * Call this after a successful save to DB.
 */
export function clearDraft(noteId: string): void {
  try {
    localStorage.removeItem(getDraftKey(noteId));
  } catch {
    // Ignore
  }
}

/**
 * Check if a draft exists for the given note.
 */
export function hasDraft(noteId: string): boolean {
  try {
    return localStorage.getItem(getDraftKey(noteId)) !== null;
  } catch {
    return false;
  }
}

/**
 * Check if a local draft is newer than the database version.
 * 
 * @param noteId - The note ID
 * @param dbUpdatedAt - The database updatedAt timestamp (ISO string or Date)
 * @param dbVersion - The database version number
 * @returns The draft if it's newer, null otherwise
 */
export function getNewerDraft(
  noteId: string,
  dbUpdatedAt: string | Date,
  dbVersion: number
): NoteDraft | null {
  const draft = loadDraft(noteId);
  if (!draft) return null;

  const dbTime = new Date(dbUpdatedAt).getTime();

  // Draft is newer if:
  // 1. Draft was saved after the DB update AND the version matches or is higher
  // 2. OR draft version equals DB version but draft savedAt is newer than DB updatedAt
  if (draft.savedAt > dbTime && draft.version >= dbVersion) {
    return draft;
  }

  // Draft is stale — clean it up
  clearDraft(noteId);
  return null;
}

/**
 * Clean up all note drafts (e.g., for logout).
 */
export function clearAllDrafts(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(DRAFT_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore
  }
}
