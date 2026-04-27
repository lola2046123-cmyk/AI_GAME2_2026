import { pinyin } from "pinyin-pro";

/** 已知中文游戏名：优先使用人工直译，避免与拼音行重复时可保留 */
const CN_GAME_NAME_EN: Record<string, string> = {
  "星际观测者": "Stellar Observer",
  "赛博盆栽": "Cyber Bonsai",
  "黑盒解密": "Black Box Puzzle",
  "色彩回响": "Chromatic Echoes",
  "废土霓虹": "Wasteland Neon",
  "虚拟共生": "Virtual Symbiosis"
};

function countCjk(s: string): number {
  return (s.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function countLatinLetters(s: string): number {
  return (s.match(/[A-Za-z]/g) ?? []).length;
}

/**
 * 将 pinyin-pro 输出的空格分词转为展示用英文行：
 * - 普通音节：首字母大写
 * - 连续全大写缩写（如 AI、GPU）保持全大写
 * - 数字原样保留
 */
function formatPinyinTokens(pinyinPhrase: string): string {
  return pinyinPhrase
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      if (/^\d+$/.test(token)) return token;
      if (/^[A-Z]{2,}$/.test(token)) return token;
      if (/^[A-Za-z]+$/.test(token)) {
        return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
}

/** 中文主名 → 分词拼音 + 规则格式化（逐词/逐字音节） */
function romanizeChineseGameName(name: string): string {
  const raw = pinyin(name.trim(), {
    toneType: "none",
    type: "string",
    separator: " ",
    /** 拉丁、数字与汉字混排时尽量保持缩写连续 */
    nonZh: "consecutive",
    /** 最大概率分词，词界更准确 */
    segmentit: 2
  });
  return formatPinyinTokens(raw);
}

/**
 * 详情页主标题下方小字：
 * - 以中文为主：优先人工直译表；否则按分词规则生成「拼音式英文」展示行
 * - 以拉丁/数字为主：固定中文说明
 */
export function gameNameSecondaryLine(gameName: string): string | null {
  const t = gameName.trim();
  if (!t) return null;
  const cjk = countCjk(t);
  const latin = countLatinLetters(t);
  const primaryChinese = cjk > 0 && cjk >= latin;
  if (primaryChinese) {
    return CN_GAME_NAME_EN[t] ?? romanizeChineseGameName(t);
  }
  return "参赛游戏作品";
}
