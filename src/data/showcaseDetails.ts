/**
 * 展示作品详情数据（Markdown 内容 + 补充字段）
 * id 与 MOCK_SHOWCASE 中的 id 一一对应
 */
export type ShowcaseDetail = {
  id: string;
  author: string;
  /** 展示用简介（优先级高于 gameplay） */
  summary: string;
  markdown: string;
};

export const SHOWCASE_DETAILS: Record<string, ShowcaseDetail> = {
  "mock-stellar": {
    id: "mock-stellar",
    author: "Team Nova",
    summary:
      "利用 Gemini 实时分析天体数据，驱动粒子系统生成动态星云，每次观测都是独一无二的视觉叙事。",
    markdown: `## 游戏概述

**星际观测者** 是一款以实时 AI 数据驱动的探索类游戏。玩家化身星际探测员，操控轨道卫星扫描星域，由 Gemini API 解析天体信号，实时生成视觉独特的动态星云场景。

> "每一次扫描，都是宇宙送来的独一无二的答卷。"

---

## 核心机制

### AI 驱动的星云生成
- Gemini 分析真实天文数据库中的光谱信息
- 根据分析结果动态调整粒子系统颜色、密度与形态
- 每局游戏生成不重复的视觉叙事

### 非线性探索
- 玩家可自由选择观测目标，触发不同叙事线索
- AI 生成的随机事件系统确保每次游玩体验差异化
- 累计观测数据解锁隐藏星域

---

## 技术栈

\`\`\`
前端渲染：Unity WebGL
AI 接口：Gemini Pro API
粒子系统：Unity VFX Graph
数据来源：NASA Open Data API
\`\`\`

---

## AI 赋能亮点

传统粒子游戏依赖手工调参，本项目将 AI 模型接入实时数据管线：

1. **输入**：玩家选定观测目标 → 拉取真实天文数据
2. **处理**：Gemini 分析光谱 / 质量 / 温度 → 输出视觉参数
3. **渲染**：Unity 粒子系统接收参数 → 实时生成星云

这套流程将原本需要 **美术团队数周工作** 压缩至 **运行时毫秒级响应**。

---

## 截图预览

![星域扫描界面](https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80)

---

## 开发总结

本作最大的挑战在于 AI 输出结果的不稳定性——同一目标不同时刻的解析结果存在差异。团队最终通过**参数归一化层**对 AI 输出进行平滑处理，在保留随机性的同时确保视觉一致性。

这次开发让我们深刻认识到：AI 不只是内容生成工具，更是**游戏逻辑的一部分**。
`
  },

  "mock-bonsai": {
    id: "mock-bonsai",
    author: "Pixel Garden Lab",
    summary:
      "通过 Midjourney 生成风格化纹理，Cursor 重构 3D 生长算法，在极简操作中养育数字生命体。",
    markdown: `## 游戏概述

**赛博盆栽** 是一款融合生成艺术与禅意玩法的数字养成游戏。玩家以极简的交互方式——浇水、修剪、等待——培育一盆拥有独特 AI 纹理的赛博盆景。

> "每一株盆栽，都是人与 AI 共同创作的艺术品。"

---

## 核心机制

### 生成式美术资产
- 每盆植物的叶片纹理由 Midjourney 根据玩家设定的"风格词"生成
- 纹理风格包含：霓虹水墨 / 生物机械 / 晶体矿物 / 量子波纹
- 玩家可导出专属盆栽作为壁纸

### 生长算法
- 基于 L-System 的分形生长模型
- Cursor 辅助重构后性能提升 **340%**
- 支持实时修剪与形态塑造

---

## 技术实现

\`\`\`javascript
// 生长节点计算（AI 辅助优化版）
function growBranch(node, depth, energy) {
  if (depth > MAX_DEPTH || energy < THRESHOLD) return;
  const angle = node.baseAngle + aiVariance(node.seed);
  spawnLeaf(node, angle, energy * DECAY_RATE);
  growBranch(node.left, depth + 1, energy * 0.7);
  growBranch(node.right, depth + 1, energy * 0.6);
}
\`\`\`

---

## AI 赋能亮点

| 环节 | 传统方案 | AI 方案 | 效率提升 |
|------|---------|---------|---------|
| 叶片纹理 | 美术手绘 3 天 | Midjourney 生成 10 分钟 | 432x |
| 算法调优 | 手动调参 2 周 | Cursor 对话迭代 2 天 | 7x |
| 关卡原型 | 策划设计 1 周 | AI 提案 + 人工筛选 半天 | 14x |

---

## 开发感想

这次开发最有趣的发现是：**AI 生成的纹理往往比手工设计更有"生命感"**。Midjourney 对"赛博盆景"这个概念的理解超出了团队预期，产出了一批我们自己想不到的视觉风格。
`
  },

  "mock-blackbox": {
    id: "mock-blackbox",
    author: "Cipher Studios",
    summary:
      "纯指令驱动的解谜游戏，AI 辅助设计无限可能的关卡与谜题节奏，每次挑战都不重复。",
    markdown: `## 游戏概述

**黑盒解密** 是一款极简风格的逻辑解谜游戏。所有交互通过命令行输入完成——没有图形界面，只有纯粹的思维博弈。AI 负责实时生成关卡、调节难度曲线，确保每位玩家都能找到属于自己的挑战节奏。

---

## 核心机制

### 无限关卡生成
玩家每次进入新关卡，ChatGPT 根据以下参数生成独特谜题：
- 玩家历史答题速度
- 错误模式分析
- 难度偏好自学习

### 指令系统
\`\`\`
> scan room        # 扫描当前环境
> inspect [object] # 检视物品
> connect A B      # 连接两个节点
> decrypt [key]    # 尝试解密
\`\`\`

---

## 技术架构

\`\`\`
解谜引擎：TypeScript + Zustand
AI 关卡生成：ChatGPT API (function calling)
异步状态机：XState
渲染层：React + CSS Grid
\`\`\`

---

## 难度自适应系统

\`\`\`typescript
interface PlayerProfile {
  avgSolveTime: number;    // 平均解题时间（秒）
  errorPatterns: string[]; // 常见错误类型
  preferredStyle: 'logic' | 'cipher' | 'spatial';
}

async function generateLevel(profile: PlayerProfile): Promise<Level> {
  const prompt = buildPrompt(profile);
  const response = await openai.chat.completions.create({...});
  return parseLevel(response.choices[0].message);
}
\`\`\`

---

## AI 赋能亮点

本作最核心的创新是**将 AI 嵌入游戏循环**而非仅用于生成内容：

- 传统解谜游戏：关卡数量有限，通关即结束
- 黑盒解密：AI 持续生成 → 游戏永不终结

这种设计让单人游戏拥有了"永恒性"。
`
  },

  "mock-echoes": {
    id: "mock-echoes",
    author: "Rhythm Forge",
    summary:
      "音乐节奏类游戏，AI 优化毫秒级音频延迟，让玩家在光影与节拍之间建立通感体验。",
    markdown: `## 游戏概述

**色彩回响** 将音乐节奏与视觉通感融为一体。游戏随音乐节拍生成动态光影图案，玩家需在精准时机触发色彩爆发。AI 负责解决传统 Web Audio API 的延迟痛点，实现 **<8ms 的实时响应**。

---

## 核心机制

### 节拍同步系统
- 音频信号经 AI 预处理，提前预判节拍时间戳
- 视觉元素与音频帧精准对齐
- 支持玩家自定义上传音乐

### 通感设计
每种色彩对应不同音域：

| 音域 | 颜色 | 触发区域 |
|------|------|---------|
| 低频（Bass）| 深紫 / 靛蓝 | 屏幕底部 |
| 中频（Mid）| 青绿 / 翠绿 | 屏幕中央 |
| 高频（Treble）| 白 / 金 | 屏幕顶部 |

---

## 技术攻关

### 延迟问题解决历程

\`\`\`
Web Audio API 原生延迟：~120ms  ← 游戏不可用
iOS Safari 附加延迟：+80ms     ← 移动端噩梦
AI 调参后实际延迟：<8ms        ← 生产可用
\`\`\`

Gemini 协助分析了 200+ 条浏览器性能日志，识别出三个主要延迟来源并给出对应的缓冲区调优策略。

---

## 游戏截图

![色彩回响主界面](https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80)

---

## 开发感想

音游开发最难的从来不是"好不好看"，而是"准不准"。这次 AI 帮我们解决了一个工程团队三周没解决的延迟问题——用了不到两天的对话式调试。
`
  },

  "mock-wasteland": {
    id: "mock-wasteland",
    author: "NeonByte Collective",
    summary:
      "复古像素动作游戏，AI 生成并补全角色动作模组，独立开发者完成了数月的工作量。",
    markdown: `## 游戏概述

**废土霓虹** 是一款赛博朋克风格的横版动作游戏。玩家扮演废土雇佣兵，穿越霓虹破碎的末日城市。AI 生成工具将原本需要数位美术共同完成的动画资产，压缩为单人可独立完成的规模。

---

## 世界观

> 2089 年。地上城市崩塌，地下霓虹繁荣。AI 掌控着物流与生产，人类掌控着欲望与暴力。

主角 **VECT** 是一名数据走私者，在上下城夹缝中求生。

---

## 核心玩法

### 战斗系统
- 4 方向格斗 + 枪械组合
- 每个敌人拥有 AI 生成的独特行为树
- 连击系统触发霓虹视觉特效

### 关卡结构
\`\`\`
Zone 1: 废旧工厂 — 教学 + 基础敌人
Zone 2: 地下市场 — 中等难度 + Boss
Zone 3: 上城入口 — 高难度 + 最终Boss
\`\`\`

---

## AI 在开发中的角色

### 精灵表生成
传统流程：角色设计 → 分镜 → 逐帧绘制 → 整合 ≈ **3个月**

AI 流程：
1. Stable Diffusion 生成参考帧（约 30 张/角色）
2. 人工筛选 + 修正关键帧（约 2 天）
3. AI 插值补全中间帧（自动完成）

总耗时：**约 1 周**

### 行为树设计
Cursor 根据游戏设计文档自动生成敌人 AI 逻辑：
\`\`\`
巡逻 → 发现玩家 → 追击 → 攻击 → 撤退（血量<30%）
\`\`\`

---

## 开发感想

独立开发者最稀缺的资源是**时间**。AI 工具让我一个人完成了以前需要 4 人小队才能搞定的内容量。这不是替代，这是**放大**。
`
  },

  "mock-bio": {
    id: "mock-bio",
    author: "Emergence Lab",
    summary:
      "模拟生态演化游戏，AI 模拟上千种生物进化路径，实现真正的「涌现式」玩法。",
    markdown: `## 游戏概述

**虚拟共生** 是一款模拟生态涌现的策略沙盒游戏。玩家设定初始生物参数与环境条件，AI 模拟数千代进化过程，观察生态系统如何从简单规则中涌现出复杂秩序。

> "你不是在玩游戏，你是在观察生命。"

---

## 核心机制

### 涌现式生态
游戏中没有手写的"胜利条件"，一切从规则中自然涌现：

- 食物链动态平衡（捕食者 ↔ 被捕食者）
- 气候变化驱动物种迁徙
- 随机基因突变触发进化跃迁

### AI 模拟层

\`\`\`python
# Gemini 批处理进化模拟（伪代码）
def simulate_evolution(population, environment, generations=1000):
    for gen in range(generations):
        fitness_scores = evaluate_fitness(population, environment)
        selected = natural_selection(population, fitness_scores)
        population = crossover_and_mutate(selected)
        environment = update_climate(gen)
    return population
\`\`\`

AI 实际处理 **1,024 个个体 × 500 代** 的模拟，在浏览器端约 3 秒完成。

---

## 可视化系统

### 物种谱系图
- 实时更新的进化树
- 颜色编码物种亲缘关系
- 时间轴回放功能

### 生态热力图

| 指标 | 可视化方式 |
|------|---------|
| 种群密度 | 色彩热力图 |
| 基因多样性 | 粒子散点图 |
| 能量流动 | 流场动画 |

---

## 技术挑战

最大的挑战是**规模与性能的平衡**：

- 原始模拟：1,024 个体 × 1,000 代 = 100 万次计算/帧 → 浏览器崩溃
- AI 优化方案：向量化计算 + Web Worker 分流 + 关键路径 WASM 化
- 最终性能：500 代模拟在 **<3s** 完成，帧率保持 60fps

---

## 开发感想

这个项目证明了一件事：**AI 最有趣的应用，不是替代人类创作，而是模拟人类无法亲手执行的复杂系统**。我们做不到手算 100 万次进化，但 AI 可以。
`
  }
};
