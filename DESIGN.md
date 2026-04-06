# Design System Document: Cyber-Editorial High-Stakes Experience

> **与代码的关系：** 本文为**视觉与体验方向**说明。落地令牌以 **`src/index.css`** 中 `@theme` 及 `:root` 变量为准（如 `--color-background`、`--color-primary`、`--rgb-neon` 等）。正文字体在实现中为 **Manrope**（`--font-body`），标题/标签为 **Inter / Space Grotesk**，与下文字体段落中部分命名以代码为准。个别规则（如圆角、描边强度）在实现中已按可读性与组件库做微调。

---

## 1. Overview & Creative North Star

### Creative North Star: "The Neon Monolith"
This design system is built to evoke the high-stakes atmosphere of a futuristic, high-tech clandestine competition. It moves away from the friendly "SaaS" look toward a sophisticated, **Cyber-Editorial** aesthetic. We achieve this by blending the precision of brutalist grid structures with the ethereal depth of glassmorphism.

The experience is defined by **Intentional Asymmetry**. We break the standard horizontal row pattern by using oversized, metallic-textured typography that overlaps containers, and "glow-leaks" where light sources feel as though they are emanating from behind the screen's surface. This isn't just a landing page; it’s a terminal interface for the elite.

---

## 2. Colors

The palette is anchored in absolute darkness, allowing our "Neon Mint" to act as a high-velocity functional signal.

### Core Palette
*   **Background (`#0e0e0e`)**: The void. All depth is built on top of this.
*   **Primary/Accent (`#a8ffe1` / `#00FFCC`)**: Our "Neon Mint." Used for critical data, active states, and radiant glows.
*   **Surface Hierarchy**:
    *   `surface-container-lowest`: `#000000` (Deepest insets)
    *   `surface-container`: `#1a1919` (Standard card background)
    *   `surface-container-highest`: `#262626` (Elevated glass panels)

### The "No-Line" Rule
Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined through:
1.  **Background Shifts**: A `surface-container-low` section sitting against the `background`.
2.  **Tonal Transitions**: Soft, feathered gradients that suggest a change in area without a hard stop.

### The "Glass & Gradient" Rule
Standard containers are forbidden. Use **Glassmorphism** for all interactive panels:
*   Apply a `surface-variant` color at 40-60% opacity.
*   Add a `backdrop-blur` of 12px to 20px.
*   **Signature Texture**: Main CTAs and high-impact "Prizes" cards should use a linear gradient from `primary` (#a8ffe1) to `primary-container` (#00fcca) at a 45-degree angle to provide a liquid, metallic "soul."

---

## 3. Typography

The type system balances the technical precision of *Inter* with the aggressive, wide stance of *Space Grotesk*.

*   **Display (Space Grotesk, Bold)**: Used for high-impact numbers and primary section titles. In the "Prizes" section, these should be rendered with a subtle metallic SVG filter or a `linear-gradient` to mimic chrome.
*   **Headlines (Space Grotesk, Medium/Bold)**: These carry the "Editorial" weight. Use `headline-lg` (2rem) for sub-headers to create a commanding presence.
*   **Body (Inter, Regular)**: Focused on legibility. Use `body-lg` (1rem) for competition rules and `body-md` for descriptions.
*   **Label (Inter, Bold, Monospace-style)**: Use `label-md` for metadata (e.g., "NODE_STABILITY: 99.91%"). This reinforces the cyberpunk terminal aesthetic.

---

## 4. Elevation & Depth

We eschew traditional drop shadows for **Tonal Layering** and **Luminescence**.

*   **The Layering Principle**: Depth is achieved by "stacking." Place a `surface-container-highest` card on top of a `surface-dim` background. The contrast in grey values provides enough "lift" without visual clutter.
*   **Ambient Glows**: Instead of black shadows, use "Glow Shadows." For floating neon elements, use a diffused shadow (blur: 24px) using the `primary` color at 15% opacity.
*   **The "Ghost Border"**: For accessibility, use a `outline-variant` border at 15% opacity. It should feel like a faint laser line, not a physical stroke.
*   **Subtle Grid Textures**: Overlay the entire background with a 24px fixed grid of `outline-variant` at 5% opacity to ground the floating glass elements in a technical space.

---

## 5. Components

### High-Impact Prize Cards
*   **Structure**: `surface-container-highest` with a 20% opacity `primary` ghost border.
*   **Visual**: A large "metallic" display number in the background (e.g., "01") at 10% opacity, partially obscured by the foreground content to create depth.
*   **Glow**: A radial gradient of `primary` behind the central icon.

### Buttons
*   **Primary**: Solid `primary` background with `on-primary` (dark) text. No border. Apply a `primary` outer glow on hover.
*   **Secondary**: `outline` ghost border with `primary` text. Transparent background.
*   **Tertiary**: Text-only using `primary` with an underline that appears only on hover.

### Inputs & Fields
*   **Style**: Inset `surface-container-lowest` with a bottom-only `outline-variant` stroke.
*   **State**: On focus, the bottom stroke transitions to `primary` with a 4px "light-leak" glow underneath.

### Progress Gauges (Donut Charts)
*   As seen in the "Judging Protocol," use semi-circular strokes of `secondary` for progress, ending in a high-intensity `primary` glow point to suggest a "loading" or "active" state.

---

## 6. Do's and Don'ts

### Do
*   **DO** use oversized, low-opacity background text to create an "Editorial" layer.
*   **DO** use "Cyber-Metadata": Add small strings of hex codes or technical specs in `label-sm` to fill corner gaps in cards.
*   **DO** ensure neon accents are used sparingly. If everything glows, nothing is important.

### Don't
*   **DON'T** use standard 1px solid borders at 100% opacity. It destroys the "glass" illusion.
*   **DON'T** use rounded corners larger than `xl` (0.75rem). The aesthetic should feel sharp and precise, not "bubbly."
*   **DON'T** use pure white for body text. Use `on-surface-variant` (`#adaaaa`) for long-form reading to maintain the moody atmosphere. Save pure white for headers.

---

**Director's Note:** Every pixel should feel like it belongs in a high-security data vault. When in doubt, add more "air" (vertical padding) and reduce the opacity of your borders. Let the neon do the heavy lifting.

---

## 7. Implementation Notes (Code Sync)

Use this section when reviewing or changing visuals so CSS and structure stay aligned with the design intent.

### Global film grain

- **Token:** `--film-grain-opacity` on `:root` in `src/index.css` (drives visible strength).
- **Markup:** In `src/components/layout/AppChrome.tsx`, after the atmosphere layer, render `<div class="app-film-grain" aria-hidden />`.
- **Styles:** `.app-film-grain` lives in `@layer components` in `src/index.css`; tiled SVG `feTurbulence` noise with a slightly lower `baseFrequency` so texture remains perceptible at modest opacity.
- **Stacking:** `z-index: 45` — must sit **above** the main content shell (`z-10`) or opaque section backgrounds fully hide the grain (opacity tweaks then appear to do nothing); must stay **below** the header (`z-50`), mobile full-screen nav (`z-60`), and modals (`z-100+`). `pointer-events: none`.
- **Avoid:** Do not put sitewide grain on `body::before` — `#root` and `AppChrome`’s solid `bg-background` paint over it.

### Home: Hero → Prizes transition

- **`.home-hero-bottom-blend`:** Gradient at the bottom of the hero (above the video, below copy) easing into prizes base `#101010`, softening the cut between moving highlights and flat matte (`HomePage.tsx`, directly after `HeroVideoBackdrop`).
- **`.home-prizes-section`:** Solid `#101010` plus a subtle top wash `linear-gradient` using `rgba(var(--rgb-neon), …)` to carry chroma from the hero UI; top edge uses `box-shadow: inset 0 1px 0 …` instead of a harsh `border-t`.
- **Perception:** Two regions can match hex yet feel mismatched — the hero reads richer due to motion and highlights; the wash and blend address **simultaneous contrast** and **hue continuity**, not only luminance.

### Related files

| Concern | Location |
|--------|----------|
| Grain + hero/prizes utilities | `src/index.css` (`:root`, `components` layer) |
| Grain node + content `z-10` shell | `src/components/layout/AppChrome.tsx` |
| Hero blend + prizes section classes | `src/pages/HomePage.tsx` |
| Countdown / CTA animations | `src/globals.css` |