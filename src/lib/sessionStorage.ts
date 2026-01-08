/**
 * Session Storage - Save and restore user session data
 */

import { ChatMessage, Requirements, SelectionState, MatchResponse, EnvironmentSelectionState } from "./types";

const SESSION_KEY = "mapiker_session";
const SESSION_EXPIRY_HOURS = 24;

export interface SessionData {
  // Chat state
  messages: ChatMessage[];
  requirements: Requirements | null;
  isComplete: boolean;

  // Product selection state
  step: "chat" | "products";
  matchResult: MatchResponse | null;
  selections: SelectionState | EnvironmentSelectionState;
  isMultiEnvironment?: boolean;

  // Metadata
  savedAt: number;
  expiresAt: number;
}

/**
 * Save session data to localStorage
 */
export function saveSession(data: Omit<SessionData, "savedAt" | "expiresAt">): void {
  try {
    const now = Date.now();
    const session: SessionData = {
      ...data,
      savedAt: now,
      expiresAt: now + SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

/**
 * Load session data from localStorage
 * Returns null if no valid session exists
 */
export function loadSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: SessionData = JSON.parse(stored);

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to load session:", error);
    return null;
  }
}

/**
 * Clear session data from localStorage
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Check if a valid session exists
 */
export function hasValidSession(): boolean {
  const session = loadSession();
  return session !== null && session.messages.length > 1;
}

/**
 * Get session age in minutes
 */
export function getSessionAge(): number | null {
  const session = loadSession();
  if (!session) return null;
  return Math.floor((Date.now() - session.savedAt) / (60 * 1000));
}

/**
 * Format session age for display
 */
export function formatSessionAge(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
