import type { ShowcaseSubmission } from "../types/submission";
import { getSupabaseAnon, getSupabaseAuth } from "./supabaseClient";

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

export async function likeProject(projectId: string, userId: string) {
  const sb = getSupabaseAuth();
  if (!sb) throw new Error("请先配置 Supabase。");

  const { error } = await sb.from(VOTE_TABLE).insert({
    project_id: projectId,
    user_id: userId,
    type: "like"
  });

  if (error) {
    if (isDuplicateVoteError(error.message)) {
      throw new Error("你已经点过赞了。");
    }
    throw new Error(error.message);
  }
}

export async function voteProject(
  projectId: string,
  userId: string,
  type: Exclude<VoteType, "like">
) {
  const sb = getSupabaseAuth();
  if (!sb) throw new Error("请先配置 Supabase。");

  const { error } = await sb.from(VOTE_TABLE).insert({
    project_id: projectId,
    user_id: userId,
    type
  });

  if (error) {
    if (isDuplicateVoteError(error.message)) {
      throw new Error("这个分类你已经投过了。");
    }
    throw new Error(error.message);
  }
}

export async function getVoteStateForProjects(
  projectIds: string[],
  userId?: string
): Promise<ShowcaseVoteStateMap> {
  if (projectIds.length === 0) return {};

  const sb = getSupabaseAnon();
  if (!sb) {
    return Object.fromEntries(projectIds.map((id) => [id, emptyState()]));
  }

  const { data, error } = await sb
    .from(VOTE_TABLE)
    .select("project_id,type,user_id")
    .in("project_id", projectIds);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as VoteRow[];
  const map: ShowcaseVoteStateMap = {};

  for (const id of projectIds) {
    map[id] = emptyState();
  }

  for (const row of rows) {
    const state = ensureState(map, row.project_id);
    state.counts[row.type] += 1;
    if (userId && row.user_id === userId && !state.userVotes.includes(row.type)) {
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
