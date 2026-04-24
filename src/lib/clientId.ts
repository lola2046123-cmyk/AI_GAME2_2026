/**
 * 匿名投票/点赞身份：
 * - 首次访问时在 localStorage 里生成一个 UUID，用作 showcase_votes.user_id
 * - 同一浏览器视为同一"投票人"，因此 (project_id, user_id, type) 的唯一约束仍可防刷
 * - 清空 localStorage 或更换浏览器后会得到新的身份（可再次点赞），这是刻意设计的取舍
 */

const STORAGE_KEY = "ai_game_2026_client_id";

function randomUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // 极旧环境兜底：v4 近似（不用于加密）
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return randomUuid();
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
    const fresh = randomUuid();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage 不可用（隐身模式 / 存储被禁）→ 每次进程内复用一次性 id
    return randomUuid();
  }
}
