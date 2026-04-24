import type { ShowcaseSubmission } from "../types/submission";
import { getOrCreateClientId } from "./clientId";
import { getSupabaseAnon } from "./supabaseClient";

export type VoteType = "like" | "fun" | "visual" | "gameplay";

type VoteRow = {
  project_id: string;
  type: VoteType;
  user_id: string;
};

export type ShowcaseVoteState = {
  counts: Record<VoteType, number>;
  userVotes: VoteType[];
};

export type ShowcaseVoteStateMap = Record<string, ShowcaseVoteState>;

export type RankingEntry = {
  project: ShowcaseSubmission;
  votes: number;
};

const VOTE_TABLE = "showcase_votes";

/**
 * 未配置 Supabase 时的本地兜底：仅记录"这个浏览器点过哪些项目+type"，
 * 保证 UI 交互（禁用按钮 / +1 计数）仍能跑通。不会跨设备同步。
 */
const LOCAL_VOTES_KEY = "ai_game_2026_local_votes";

type LocalVoteRecord = { project_id: string; type: VoteType };

function readLocalVotes(): LocalVoteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_VOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is LocalVoteRecord =>
        !!x &&
        typeof x === "object" &&
        typeof (x as LocalVoteRecord).project_id === "string" &&
        typeof (x as LocalVoteRecord).type === "string"
    );
  } catch {
    return [];
  }
}

function writeLocalVotes(list: LocalVoteRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function recordLocalVote(projectId: string, type: VoteType) {
  const list = readLocalVotes();
  if (list.some((x) => x.project_id === projectId && x.type === type)) return;
  list.push({ project_id: projectId, type });
  writeLocalVotes(list);
}

function emptyState(): ShowcaseVoteState {
  return {
    counts: { like: 0, fun: 0, visual: 0, gameplay: 0 },
    userVotes: []
  };
}

function ensureState(map: ShowcaseVoteStateMap, projectId: string): ShowcaseVoteState {
  if (!map[projectId]) map[projectId] = emptyState();
  return map[projectId];
}

function isDuplicateVoteError(message: string) {
  return (
    message.includes("duplicate key") ||
    message.includes("unique") ||
    message.includes("23505")
  );
}

async function insertVote(projectId: string, type: VoteType) {
  const sb = getSupabaseAnon();
  const clientId = getOrCreateClientId();

  // 无 Supabase 时：只写本地，调用方照常视为"成功"
  if (!sb) {
    recordLocalVote(projectId, type);
    return;
  }

  const { error } = await sb.from(VOTE_TABLE).insert({
    project_id: projectId,
    user_id: clientId,
    type
  });

  if (error) {
    if (isDuplicateVoteError(error.message)) {
      // 已经记过了，不视为失败：记本地并静默返回，避免 UI 弹红字
      recordLocalVote(projectId, type);
      return;
    }
    throw new Error(error.message);
  }

  recordLocalVote(projectId, type);
}

export async function likeProject(projectId: string) {
  await insertVote(projectId, "like");
}

export async function voteProject(
  projectId: string,
  type: Exclude<VoteType, "like">
) {
  await insertVote(projectId, type);
}

export async function getVoteStateForProjects(
  projectIds: string[]
): Promise<ShowcaseVoteStateMap> {
  if (projectIds.length === 0) return {};

  const clientId = typeof window !== "undefined" ? getOrCreateClientId() : "";
  const localVotes = readLocalVotes();
  const map: ShowcaseVoteStateMap = {};
  for (const id of projectIds) {
    map[id] = emptyState();
  }

  // 先把本地已投票的记回 userVotes（即使 Supabase 查不到也保持按钮禁用状态）
  for (const record of localVotes) {
    const state = map[record.project_id];
    if (state && !state.userVotes.includes(record.type)) {
      state.userVotes.push(record.type);
    }
  }

  const sb = getSupabaseAnon();
  if (!sb) return map;

  const { data, error } = await sb
    .from(VOTE_TABLE)
    .select("project_id,type,user_id")
    .in("project_id", projectIds);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as VoteRow[];
  for (const row of rows) {
    const state = ensureState(map, row.project_id);
    state.counts[row.type] += 1;
    if (row.user_id === clientId && !state.userVotes.includes(row.type)) {
      state.userVotes.push(row.type);
    }
  }

  return map;
}

function rankByType(
  items: ShowcaseSubmission[],
  voteMap: ShowcaseVoteStateMap,
  type: VoteType,
  limit = 5
): RankingEntry[] {
  return [...items]
    .map((project) => ({
      project,
      votes: voteMap[project.id]?.counts[type] ?? 0
    }))
    .filter((entry) => entry.votes > 0)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

export function buildRankings(
  items: ShowcaseSubmission[],
  voteMap: ShowcaseVoteStateMap
) {
  return {
    like: rankByType(items, voteMap, "like"),
    fun: rankByType(items, voteMap, "fun"),
    visual: rankByType(items, voteMap, "visual"),
    gameplay: rankByType(items, voteMap, "gameplay")
  };
}
