import type { ShowcaseSubmission } from "../types/submission";

/** 无用户数据时默认展示的 6 条占位（配图更新时递增 ?v= 以便客户端刷新缓存） */
const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop&v=3`;

/** 无用户数据时默认展示的 6 条占位 */
export const MOCK_SHOWCASE: ShowcaseSubmission[] = [
  {
    id: "mock-stellar",
    gameName: "星际观测者 (Stellar Observer)",
    gameplay:
      "利用 Gemini 实时分析天体数据，驱动 Unity 粒子系统生成动态星云。AI 突破了传统脚本对话的线性限制，让每一次观测都生成独一无二的视觉叙事。",
    techStack: ["Gemini", "Unity"],
    evolution: "实时数据管线与非线性叙事由模型建议驱动。",
    deployUrl: "https://example.com/stellar",
    thumbnailUrl: IMG("photo-1464802686167-b939a6910659"),
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-bonsai",
    gameName: "赛博盆栽 (Cyber Bonsai)",
    gameplay:
      "通过 Midjourney 生成风格化纹理，Cursor 重构 3D 生长算法，极大地缩短了美术资产产出周期。玩家在极简操作中养育数字生命体。",
    techStack: ["Midjourney", "Cursor"],
    evolution: "资产生成与代码迭代的闭环显著压缩里程碑。",
    deployUrl: "https://example.com/bonsai",
    /** 原 photo-1508610048659 在 CDN 已 404，改用稳定素材 */
    thumbnailUrl: IMG("photo-1485955900006-10f4d324d411"),
    createdAt: "2026-01-02T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-blackbox",
    gameName: "黑盒解密 (The Black Box)",
    gameplay:
      "纯指令驱动的解谜游戏。AI 辅助编写核心异步逻辑，并提供无限可能的关卡设计建议，使谜题密度与节奏可动态调节。",
    techStack: ["Cursor", "ChatGPT"],
    evolution: "异步状态机与关卡原型由对话式迭代完成。",
    deployUrl: "https://example.com/blackbox",
    thumbnailUrl: IMG("photo-1555949963-aa79dcee981c"),
    createdAt: "2026-01-03T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-echoes",
    gameName: "色彩回响 (Echoes of Color)",
    gameplay:
      "音乐节奏类游戏。AI 辅助优化了音频信号处理的延迟问题，实现毫秒级实时反馈，让玩家在光影与节拍之间建立通感。",
    techStack: ["Gemini", "Copilot"],
    evolution: "延迟剖面与缓冲区策略由模型辅助调参。",
    deployUrl: "https://example.com/echoes",
    thumbnailUrl: IMG("photo-1470229722913-7c0e2dbbafd3"),
    createdAt: "2026-01-04T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-wasteland",
    gameName: "废土霓虹 (Wasteland Neon)",
    gameplay:
      "复古像素动作游戏。AI 生成并补全角色动作模组，让独立开发者完成了数月的工作量，同时保持帧动画的连贯打击感。",
    techStack: ["Stable Diffusion", "Cursor"],
    evolution: "精灵表扩展与动作关键帧插值由生成模型辅助。",
    deployUrl: "https://example.com/wasteland",
    thumbnailUrl: IMG("photo-1593305841991-05c297ba4575"),
    createdAt: "2026-01-05T00:00:00.000Z",
    source: "mock"
  },
  {
    id: "mock-bio",
    gameName: "虚拟共生 (Bio-Synthesis)",
    gameplay:
      "模拟生态演化。AI 模拟上千种生物进化路径，实现了真正的「涌现式」玩法，使食物链与族群行为不再完全手写规则。",
    techStack: ["Gemini", "Claude"],
    evolution: "大规模参数探索与平衡性预警由模型批处理完成。",
    deployUrl: "https://example.com/bio",
    thumbnailUrl: IMG("photo-1582719478250-c89cae4dc85b"),
    createdAt: "2026-01-06T00:00:00.000Z",
    source: "mock"
  }
];
