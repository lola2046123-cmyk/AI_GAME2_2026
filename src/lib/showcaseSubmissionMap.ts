import type { ShowcaseSubmission } from "../types/submission";

/** PostgREST 行（snake_case）→ 前端实体 */
export function rowToShowcaseSubmission(row: {
  id: string;
  game_name: string;
  creator_nickname: string | null;
  gameplay: string;
  card_summary: string | null;
  gameplay_source: string | null;
  tech_stack: unknown;
  evolution: string;
  deploy_url: string;
  thumbnail_url: string;
  created_at: string;
  is_visible: boolean | null;
  source: string | null;
}): ShowcaseSubmission {
  const stack = Array.isArray(row.tech_stack)
    ? (row.tech_stack as string[])
    : [];
  const gs = row.gameplay_source;
  const gameplaySource =
    gs === "ai" || gs === "local" || gs === "manual" ? gs : undefined;
  return {
    id: row.id,
    gameName: row.game_name,
    gameplay: row.gameplay,
    cardSummary: row.card_summary?.trim() || undefined,
    gameplaySource,
    techStack: stack,
    evolution: row.evolution,
    deployUrl: row.deploy_url,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    is_visible: row.is_visible !== false,
    source: row.source === "mock" ? "mock" : "user"
  };
}

export function submissionToInsertRow(entry: ShowcaseSubmission): Record<string, unknown> {
  return {
    id: entry.id,
    game_name: entry.gameName,
    creator_nickname: null,
    gameplay: entry.gameplay,
    card_summary: entry.cardSummary?.trim() || null,
    gameplay_source: entry.gameplaySource ?? null,
    tech_stack: entry.techStack,
    evolution: entry.evolution,
    deploy_url: entry.deployUrl,
    thumbnail_url: entry.thumbnailUrl,
    created_at: entry.createdAt,
    is_visible: entry.is_visible !== false,
    source: entry.source === "mock" ? "mock" : "user"
  };
}
