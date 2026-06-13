import type { Category } from "./quiz-data";

const PLAYER_KEY = "trivia.player";
const LB_KEY = "trivia.leaderboard";
const USERS_KEY = "trivia.users";

export interface Player {
  name: string;
  className: string;
  phone: string;
  username: string;
}

export interface LeaderboardEntry {
  username: string;
  name: string;
  category: Category;
  score: number;
  correct: number;
  total: number;
  timeMs: number;
  maxStreak: number;
  playedAt: number;
}

export function getPlayer(): Player | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(PLAYER_KEY) || "null"); } catch { return null; }
}
export function setPlayer(p: Player) {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(p));
  const users: string[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  if (!users.includes(p.username)) {
    users.push(p.username);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}
export function usernameTaken(u: string): boolean {
  if (typeof window === "undefined") return false;
  const users: string[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const me = getPlayer();
  return users.includes(u) && me?.username !== u;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LB_KEY) || "[]"); } catch { return []; }
}
export function addLeaderboardEntry(e: LeaderboardEntry) {
  const list = getLeaderboard();
  list.push(e);
  localStorage.setItem(LB_KEY, JSON.stringify(list));
}
export function sortedLeaderboard(): LeaderboardEntry[] {
  return [...getLeaderboard()].sort((a, b) =>
    b.score - a.score || a.timeMs - b.timeMs
  );
}
