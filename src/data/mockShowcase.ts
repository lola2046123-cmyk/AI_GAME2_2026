import type { ShowcaseSubmission } from "../types/submission";

/** 无用户数据时默认展示的 6 条占位（配图更新时递增 ?v= 以便客户端刷新缓存） */
const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop&v=3`;

/** 无用户数据时默认展示的 6 条占位 */
export const MOCK_SHOWCASE: ShowcaseSubmission[] = [
  {
    id: "mock-stellar",
    gameName: "星际观测者",
    gameplay:
      "利用 Gemini 实时分析天体数据，驱动 Unity 粒子系统生成动态星云。AI 突破了传统脚本对话的线性限制，让每一次观测都生成独一无二的视觉叙事。",
    techStack: ["Gemini", "Unity"],
    evolution:
      "高中时仰望深空就被那种「人类太渺小」的感觉击中，于是想做一个不教人「玩」、只让人「看」的游戏。Gemini 帮我把零散的天体数据整理成可被粒子系统消费的事件流，第一次让我意识到 AI 不只是写代码工具，而是一个有审美的合作者。",
    composition: "solo",
    deployUrl: "https://example.com/stellar",
    thumbnailUrl: IMG("photo-1464802686167-b939a6910659"),
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-bonsai",
    gameName: "赛博盆栽",
    gameplay:
      "通过 Midjourney 生成风格化纹理，Cursor 重构 3D 生长算法，极大地缩短了美术资产产出周期。玩家在极简操作中养育数字生命体。",
    techStack: ["Midjourney", "Cursor"],
    evolution:
      "灵感来自家里那盆被我养死的真盆栽——为什么不在赛博空间里养一个？Midjourney 在十分钟内吐出几十种叶脉风格让我挑选，Cursor 帮我把 3D 生长算法重构了三次。AI 让独立开发不再「卡在某一步」，而是不停地往前推。",
    composition: "team-3",
    deployUrl: "https://example.com/bonsai",
    /** 原 photo-1508610048659 在 CDN 已 404，改用稳定素材 */
    thumbnailUrl: IMG("photo-1485955900006-10f4d324d411"),
    createdAt: "2026-01-02T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-blackbox",
    gameName: "黑盒解密",
    gameplay:
      "纯指令驱动的解谜游戏。AI 辅助编写核心异步逻辑，并提供无限可能的关卡设计建议，使谜题密度与节奏可动态调节。",
    techStack: ["Cursor", "ChatGPT"],
    evolution:
      "看到玩家在 Reddit 抱怨「现在的解谜游戏教程太啰嗦」，我决定做一个完全不解释、只给指令的盒子。ChatGPT 帮我穷举了上百条潜在关卡设计，再由 Cursor 反复迭代异步状态机。最大的心得是：AI 不会替你想出最好的关卡，但它能帮你迅速过滤掉糟糕的那些。",
    composition: "team-2",
    deployUrl: "https://example.com/blackbox",
    thumbnailUrl: IMG("photo-1555949963-aa79dcee981c"),
    createdAt: "2026-01-03T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-echoes",
    gameName: "色彩回响",
    gameplay:
      "音乐节奏类游戏。AI 辅助优化了音频信号处理的延迟问题，实现毫秒级实时反馈，让玩家在光影与节拍之间建立通感。",
    techStack: ["Gemini", "Copilot"],
    evolution:
      "我有轻度通感（看见声音是有颜色的），一直想把这种体验做成游戏给别人感受一下。最早原型音频延迟有 200ms 完全没法玩，Gemini 帮我把整条音频管线的延迟剖面拆开来分析，最后压到了 18ms。那一刻像是把一段感官记忆翻译成了代码。",
    composition: "solo",
    deployUrl: "https://example.com/echoes",
    thumbnailUrl: IMG("photo-1470229722913-7c0e2dbbafd3"),
    createdAt: "2026-01-04T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-wasteland",
    gameName: "废土霓虹",
    gameplay:
      "复古像素动作游戏。AI 生成并补全角色动作模组，让独立开发者完成了数月的工作量，同时保持帧动画的连贯打击感。",
    techStack: ["Stable Diffusion", "Cursor"],
    evolution:
      "对 90 年代街机厅的霓虹质感念念不忘，但一个人画不动那么多帧动画。Stable Diffusion 把我画的 8 帧粗略动作扩成了 24 帧并保留风格统一，再用 Cursor 把动作切片自动入表。AI 没有取代美术，它取代的是「我没时间做完」的那种遗憾。",
    composition: "team-4",
    deployUrl: "https://example.com/wasteland",
    thumbnailUrl: IMG("photo-1593305841991-05c297ba4575"),
    createdAt: "2026-01-05T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-bio",
    gameName: "虚拟共生",
    gameplay:
      "模拟生态演化。AI 模拟上千种生物进化路径，实现了真正的「涌现式」玩法，使食物链与族群行为不再完全手写规则。",
    techStack: ["Gemini", "Claude"],
    evolution:
      "做这个游戏起源于一个很奇怪的念头：如果让 AI 来设计一个生态系统，它会怎么平衡？于是我把规则写成 prompt，让 Claude 在上千种参数组合里筛出真正有趣的那些，再用 Gemini 跑批量推演验证稳定性。最大的心得是：好的玩法不是设计出来的，是被「跑」出来的——而 AI 让你能跑得起。",
    composition: "team-6",
    deployUrl: "https://example.com/bio",
    thumbnailUrl: IMG("photo-1582719478250-c89cae4dc85b"),
    createdAt: "2026-01-06T00:00:00.000Z",
    source: "mock"
  }
];
