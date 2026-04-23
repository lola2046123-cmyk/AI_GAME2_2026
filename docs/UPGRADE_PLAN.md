# 视觉 & 信息层级升级规范
> Digital Exhibition · 克制 · 强内容 · 轻交互

---

## 一、设计系统 Token 约定（唯一真相来源）

### 1.1 文字层级（严格执行，不允许例外色值）

| 层级 | Token | 用途 |
|------|-------|------|
| H1 页面主标题 | `text-white` | 每页唯一 |
| H2 区块标题 | `text-white` | SectionTitleEnDecor |
| H3 子区块 / 卡片标题 | `text-white` | SubCard h3、ShowcaseCard h2 |
| 正文 / 说明 | `text-white/70` | p 段落，取代现有 text-primary/xx |
| 辅助 / 元信息 | `text-white/40` | 时间、标签、注释 |
| 强调（品牌色） | `text-[#00ffcc]` | 只用于悬停态、数字、Live badge |

### 1.2 卡片规范（Surface Card 统一格式）

```
rounded-xl                        ← 圆角统一，不用 rounded-2xl
border border-white/10            ← 统一描边，不用 /[0.08] 等变体
bg-white/[0.04]                   ← 基础底（surface-card CSS 变量覆盖）
overflow-hidden                   ← 子元素不外溢
transition-all duration-300       ← 过渡统一
hover:border-white/[0.18]
hover:scale-[1.018] hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]
```

### 1.3 图片规范

```
aspect-video          ← 16:9，全站统一，不用 aspect-[16/10]
object-cover
group-hover:scale-[1.04] transition-transform duration-500 ease-out
```

### 1.4 区块间距

| 区块 | Padding |
|------|---------|
| 页面顶部 `pt` | `pt-6 md:pt-12` |
| 区块上下 `py` | `py-14 md:py-20 lg:py-24` |
| 卡片内边距 | `p-5 md:p-6` |
| 卡片图文间距 | `mt-4` |

---

## 二、页面结构（JSX 层级）

### 2.1 ShowcasePage（最高优先级改版）

```
ShowcasePage
├── <main>
│   ├── [ambient 光晕层 aria-hidden]
│   └── .max-w-home
│       ├── <PageHeader>                    ← 新组件
│       │   ├── SectionTitleEnDecor h1      ← "参赛展示 / SHOWCASE"
│       │   ├── <p> 说明文案               ← text-white/70
│       │   └── <ShowcaseStatBar>           ← 新组件：作品数 badge
│       │       └── "X 件作品 · HTML5 · 网页游戏"
│       ├── [error message]
│       └── <ShowcaseGrid>
│           ├── [空状态 <ShowcaseEmpty>]    ← 新组件
│           └── grid items → <ShowcaseCard>
└── <footer>
```

### 2.2 ShowcaseCard（核心重构）

```
ShowcaseCard (canLink ? <a> : <div>)
  ├── group relative rounded-xl overflow-hidden border border-white/10
  ├── .thumbnail-area  aspect-video overflow-hidden
  │   ├── <img> group-hover:scale-[1.04]
  │   ├── .gradient-overlay  from-background/80 to-transparent   ← 单层简化
  │   └── .badges（右上角 Live / AI Generated）
  └── .card-body  p-5 md:p-6
      ├── .meta-row  mb-2                                        ← 类型 + 平台
      │   ├── <TypeBadge>    参赛作品 | 官方示例
      │   └── <PlatformBadge> HTML5 · 网页游戏
      ├── <h2> gameName                text-white leading-snug
      ├── <p>  creatorNickname         text-white/40 text-xs mt-0.5
      ├── <p>  cardBlurb               text-white/70 text-sm mt-2 line-clamp-3
      ├── .tech-tags  flex flex-wrap gap-1.5 mt-3
      │   └── <TechTag> × n
      └── .card-footer  border-t border-white/[0.06] mt-4 pt-3
          └── "Open →"   text-white/40 group-hover:text-[#00ffcc]
```

### 2.3 HomePage（区块级调整）

```
HomePage
├── Hero section（保持现有视频，调整文字层级）
│   ├── h1 "AI 游戏设计大赛"          text-white（已有）
│   ├── SubmissionCountdown
│   ├── 奖金池 "32,500 U"
│   └── <button> 立即参赛
│
├── Prizes section
│   ├── 前置标签 "Prizes & Seats"      text-white/40（改小写关键性）
│   ├── SectionTitleEnDecor h2         text-white
│   ├── 导语 p                         text-white/70（统一）
│   └── 奖项卡片 ×6                   已有 surface-card，调 padding
│
├── Rules section
│   ├── 前置标签 "Rules & Platform"    text-white/40
│   ├── SectionTitleEnDecor h2
│   ├── 卡片 01/02/03                  text-white h3 + text-white/70 p
│   └── [03 投稿清单]                  list items → text-white/70
│
└── Judging section
    ├── SectionTitleEnDecor h2
    └── 环形指标 ×3
        ├── h3 维度名   text-white
        └── p  描述     text-white/70
```

### 2.4 DeploymentGuidePage（小幅调整）

```
DeploymentGuidePage
├── <header> 首屏（已有，维持）
├── <nav> 路线图卡片（已有，维持）
└── 正文区
    ├── DeploySection × 4
    │   ├── h2 标题   text-white
    │   └── SubCard × n
    │       ├── h3     text-white
    │       └── p      text-white/70（部分改）
    ├── FAQ surface-card
    └── 收尾 surface-card
```

---

## 三、关键组件拆分

### 3.1 新增组件列表

| 组件 | 路径 | 职责 |
|------|------|------|
| `ShowcaseStatBar` | `src/components/showcase/ShowcaseStatBar.tsx` | 展示「N 件作品」计数胶囊 |
| `ShowcaseEmpty` | `src/components/showcase/ShowcaseEmpty.tsx` | 空状态占位块 |
| `TechTag` | `src/components/showcase/TechTag.tsx` | 统一技术标签样式 |

### 3.2 改版组件

| 组件 | 改动范围 |
|------|----------|
| `ShowcaseCard` | 图片比例、信息层级、hover 规范、文字 token |
| `ShowcasePage` | 头部区、卡片网格 gap、空状态 |
| `SectionTitleEnDecor` | 无 JSX 改动，只调用方统一 headlineClassName |

---

## 四、Tailwind Class 差异对照表

### ShowcaseCard 重点改动

| 位置 | 旧值 | 新值 |
|------|------|------|
| 图片容器 | `aspect-[16/10]` | `aspect-video` |
| 边框 | `border-white/[0.08]~[0.12]` 混用 | `border-white/10` 统一 |
| 游戏名 | `text-[#FFFFFF]` 硬写 | `text-white` 语义化 |
| 制作者 | `text-primary/50` | `text-white/40` |
| 摘要 | `text-on-background/88` | `text-white/70` |
| 底部链接 | `text-primary/40` | `text-white/40 group-hover:text-[#00ffcc]/70` |
| hover 卡片 | CSS `.surface-card--lift` 全局处理 | 补 `hover:shadow-[0_12px_40px_rgba(0,0,0,0.55)]` |

### ShowcasePage 重点改动

| 位置 | 旧值 | 新值 |
|------|------|------|
| 说明文案 | `text-primary/50` | `text-white/50` |
| 网格 gap | `gap-3 sm:gap-3.5 xl:gap-4` | `gap-4 md:gap-5 xl:gap-6` |
| 顶部间距 | `pt-6 md:pt-10` | `pt-10 md:pt-16` |

### HomePage 文字 Token 统一

| 区块 | 旧值 | 新值 |
|------|------|------|
| 区块导语 p | `text-primary/95` | `text-white/70` |
| 前置标签 | `text-primary-container` | `text-white/40` + `tracking-widest` |
| 规范卡片 p | `text-on-background/92` | `text-white/70` |
| 评审卡片 p | `text-on-background/88` | `text-white/70` |

---

## 五、交互规范细节

### Hover 状态机（三档）

```
[resting]  border-white/10  bg-white/[0.04]  shadow-none
    ↓ hover
[hover]    border-white/[0.18]  bg-white/[0.06]
           scale-[1.018]  shadow-[0_8px_32px_rgba(0,0,0,0.45)]
           图片 scale-[1.04]
    ↓ active
[pressed]  scale-[1.01]  shadow-[0_4px_16px_rgba(0,0,0,0.35)]
```

### Fade-in 进场（列表）

```tsx
// 用现有 motion，统一参数
initial={{ opacity: 0, y: 16 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "0px 0px -5% 0px" }}
transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.06, 0.36) }}
```

---

## 六、实施优先级

| 优先级 | 改动 | 影响 |
|--------|------|------|
| P0 | ShowcaseCard 重构（图片比例 + 文字 token） | 最高曝光 |
| P0 | ShowcasePage 间距 + 空状态 | 基础可用 |
| P1 | HomePage 正文 text-white/70 统一 | 一致性 |
| P1 | 全局 border-white/10 统一 | 一致性 |
| P2 | ShowcaseStatBar 作品计数 | 锦上添花 |
| P2 | ShowcaseEmpty 空状态 | 边缘场景 |
