/**
 * 稳定流体（Stable Fluid Simulation）— @vfx-js/core 的多通道 pass 配置。
 *
 * 算法移植自 PavelDoGreat/WebGL-Fluid-Simulation：
 *   curl → vorticity confinement → divergence → 多次 jacobi 迭代解压力 →
 *   减压力梯度去散度 → 平流速度场 → 显示通道（带色散与高光收敛）。
 *
 * 显示通道相对参考实现做了减弱：
 *   - 仅保留 RGB 色散，移除「spectrum 彩虹」和高强度 edge；
 *   - 高亮收敛由元素自身的 alpha 做 mask，避免在空白区出现伪色。
 */
import type { VFXPass } from "@vfx-js/core";

/* ─────────────── shaders（GLSL3, VFX 自动注入 #version / out 等） ─────────────── */
const copyShader = /* glsl */ `
precision highp float;
uniform sampler2D src;
uniform vec2 resolution;
uniform vec2 offset;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  outColor = texture(src, uv);
}`;

const curlShader = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform vec2 resolution;
uniform vec2 offset;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  float L = texture(velocity, uv - vec2(t.x, 0.0)).y;
  float R = texture(velocity, uv + vec2(t.x, 0.0)).y;
  float T = texture(velocity, uv + vec2(0.0, t.y)).x;
  float B = texture(velocity, uv - vec2(0.0, t.y)).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const vorticityShader = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D curl;
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform vec2 mouse;
uniform vec2 mouseDelta;
uniform float curlStrength;
uniform float splatForce;
uniform float splatRadius;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  float aspect = resolution.x / resolution.y;
  float L = abs(texture(curl, uv - vec2(t.x, 0.0)).x);
  float R = abs(texture(curl, uv + vec2(t.x, 0.0)).x);
  float T = abs(texture(curl, uv + vec2(0.0, t.y)).x);
  float B = abs(texture(curl, uv - vec2(0.0, t.y)).x);
  float C = texture(curl, uv).x;
  vec2 force = vec2(T - B, R - L);
  float len = length(force);
  force = len > 0.0001 ? force / len : vec2(0.0);
  force *= curlStrength * C;
  force.y *= -1.0;
  vec2 vel = texture(velocity, uv).xy;
  vel += force * 0.016;
  vel = clamp(vel, vec2(-1000.0), vec2(1000.0));
  vec2 mouseUv = mouse / resolution;
  vec2 diff = uv - mouseUv;
  diff.x *= aspect;
  float mSplat = exp(-dot(diff, diff) / splatRadius);
  vel += (mouseDelta / resolution) * mSplat * splatForce;
  outColor = vec4(vel, 0.0, 1.0);
}`;

const divergenceShader = /* glsl */ `
precision highp float;
uniform sampler2D vort_vel;
uniform vec2 resolution;
uniform vec2 offset;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  float L = texture(vort_vel, uv - vec2(t.x, 0.0)).x;
  float R = texture(vort_vel, uv + vec2(t.x, 0.0)).x;
  float T = texture(vort_vel, uv + vec2(0.0, t.y)).y;
  float B = texture(vort_vel, uv - vec2(0.0, t.y)).y;
  vec2 C = texture(vort_vel, uv).xy;
  if (uv.x - t.x < 0.0) L = -C.x;
  if (uv.x + t.x > 1.0) R = -C.x;
  if (uv.y + t.y > 1.0) T = -C.y;
  if (uv.y - t.y < 0.0) B = -C.y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const pressureInitShader = /* glsl */ `
precision highp float;
out vec4 outColor;
void main() { outColor = vec4(0.0); }`;

const pressureShader = /* glsl */ `
precision highp float;
uniform sampler2D src;
uniform sampler2D divergence;
uniform vec2 resolution;
uniform vec2 offset;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  float L = texture(src, uv - vec2(t.x, 0.0)).x;
  float R = texture(src, uv + vec2(t.x, 0.0)).x;
  float T = texture(src, uv + vec2(0.0, t.y)).x;
  float B = texture(src, uv - vec2(0.0, t.y)).x;
  float div = texture(divergence, uv).x;
  outColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

function makeGradientShader(pressureBuffer: string) {
  return /* glsl */ `
precision highp float;
uniform sampler2D vort_vel;
uniform sampler2D ${pressureBuffer};
uniform vec2 resolution;
uniform vec2 offset;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  float L = texture(${pressureBuffer}, uv - vec2(t.x, 0.0)).x;
  float R = texture(${pressureBuffer}, uv + vec2(t.x, 0.0)).x;
  float T = texture(${pressureBuffer}, uv + vec2(0.0, t.y)).x;
  float B = texture(${pressureBuffer}, uv - vec2(0.0, t.y)).x;
  vec2 vel = texture(vort_vel, uv).xy;
  vel -= vec2(R - L, T - B);
  outColor = vec4(vel, 0.0, 1.0);
}`;
}

const advectVelShader = /* glsl */ `
precision highp float;
uniform sampler2D proj_vel;
uniform vec2 resolution;
uniform vec2 offset;
uniform float velocityDissipation;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 t = 1.0 / resolution;
  vec2 vel = texture(proj_vel, uv).xy;
  vec2 coord = uv - vel * t * 0.016;
  vec2 advected = texture(proj_vel, coord).xy;
  advected /= 1.0 + velocityDissipation * 0.016;
  outColor = vec4(advected, 0.0, 1.0);
}`;

/**
 * 显示通道：
 *   仅做 RGB 色散，强度由元素自身 alpha 决定，避免在空白区域出现伪色。
 *   与参考代码相比移除了高对比度的 spectrum + edge 特效，让效果更「稳」更不抢戏。
 */
const displayShader = /* glsl */ `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D canvas;
uniform vec2 resolution;
uniform vec2 offset;
uniform vec2 simSize;
uniform float displayStrength;
out vec4 outColor;
void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 vel = texture(velocity, uv).xy;
  vec2 disp = vel / simSize;
  float v = length(disp);

  const int N = 5;
  vec4 c = vec4(0.0);
  vec3 wsum = vec3(0.0);
  for (int i = 0; i < N; i++) {
    float t = float(i) / float(N - 1);
    vec3 w = max(vec3(0.0), cos((t - vec3(0.0, 0.5, 1.0)) * 3.14159 * 0.5));
    vec4 s = texture(canvas, uv - disp * displayStrength * (t + 0.3) * v);
    c.rgb += s.rgb * w;
    c.a   += s.a * (w.r + w.g + w.b) / 3.0;
    wsum  += w;
  }
  c.rgb /= wsum;
  c.a /= (wsum.r + wsum.g + wsum.b) / 3.0;
  outColor = c;
}`;

/* ─────────────── pass builder ─────────────── */
export type FluidOpts = {
  /** 模拟分辨率（width/height） */
  simSize: [number, number];
  /** 每帧鼠标增量（带衰减） */
  mouseDelta: () => [number, number];
  /** Jacobi 迭代次数（越多越稳定，性能消耗越高，建议 8-16） */
  pressureIterations: number;
  /** 涡量项强度，控制旋涡密集度 */
  curlStrength: number;
  /** 速度场耗散，越大流体越快稳定 */
  velocityDissipation: number;
  /** 鼠标 splat 力度 */
  splatForce: number;
  /** splat 衰减半径（越小越聚拢） */
  splatRadius: number;
  /** 显示通道色散强度（默认 0.18，参考代码为 0.3） */
  displayStrength?: number;
};

export function buildFluidPasses(opts: FluidOpts): VFXPass[] {
  const {
    simSize,
    mouseDelta,
    pressureIterations,
    curlStrength,
    velocityDissipation,
    splatForce,
    splatRadius,
    displayStrength = 0.18,
  } = opts;

  const pressurePasses: VFXPass[] = [];
  pressurePasses.push({
    frag: pressureInitShader,
    target: "p_a",
    float: true,
    size: simSize,
  });
  let lastTarget = "p_a";
  for (let i = 0; i < pressureIterations; i++) {
    lastTarget = i % 2 === 0 ? "p_b" : "p_a";
    pressurePasses.push({
      frag: pressureShader,
      target: lastTarget,
      float: true,
      size: simSize,
    });
  }

  return [
    { frag: copyShader, target: "canvas" },
    { frag: curlShader, target: "curl", float: true, size: simSize },
    {
      frag: vorticityShader,
      target: "vort_vel",
      float: true,
      size: simSize,
      uniforms: {
        mouseDelta,
        curlStrength,
        splatForce,
        splatRadius,
      },
    },
    {
      frag: divergenceShader,
      target: "divergence",
      float: true,
      size: simSize,
    },
    ...pressurePasses,
    {
      frag: makeGradientShader(lastTarget),
      target: "proj_vel",
      float: true,
      size: simSize,
    },
    {
      frag: advectVelShader,
      target: "velocity",
      persistent: true,
      float: true,
      size: simSize,
      uniforms: { velocityDissipation },
    },
    {
      frag: displayShader,
      uniforms: { simSize, displayStrength },
    },
  ];
}

/** 根据视口宽高比生成模拟分辨率（保持各向同性） */
export function makeSimSize(base = 192): [number, number] {
  const w = typeof window !== "undefined" ? window.innerWidth : base;
  const h = typeof window !== "undefined" ? window.innerHeight : base;
  const aspect = w / h || 1;
  return aspect > 1
    ? [Math.round(base * aspect), base]
    : [base, Math.round(base / aspect)];
}

