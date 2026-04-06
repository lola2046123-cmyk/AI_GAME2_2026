/**
 * 奖项卡片 HUD 底噪：四角微缩数据 + L 型护角（pointer-events: none）
 * 均为虚构 UI 噪声，不含任何真实地理或外部系统信息。
 */

type Props = {
  /** 0-based，用于右上角 ID_0xNN */
  slotIndex: number;
  /** 左上角文案，如 DESIGNATION: R1 或 TYPE: REWARD_NODE */
  designation: string;
};

/** 左下：虚构十六进制流（按槽位固定，非真随机） */
const HUD_HEX_STREAM = [
  "0xFA24 / 0x9B12",
  "0x3C8E / 0xD701",
  "0x7A2F / 0x44C0",
  "0xB901 / 0xE28D",
  "0x55AA / 0x66BB",
  "0xCCDD / 0x1122"
] as const;

/** 右下：虚构系统参数（按槽位固定） */
const HUD_SYS_PARAMS = [
  "NODE_STABILITY: 99.91% // VER: 20.26",
  "STATUS: ACTIVE // CRC: 0x4F2A",
  "BUFFER_SYNC: OK // NODE_STABILITY: 99.87%",
  "SIG_CHAIN: VALID // FRAME: 0xA1B3",
  "QUEUE_DEPTH: 0x08 // NODE_STABILITY: 99.94%",
  "HANDSHAKE: ACK // PATCH: 0x20.26"
] as const;

export function RewardCardHud({ slotIndex, designation }: Props) {
  const idSuffix = String(slotIndex + 1).padStart(2, "0");
  const i = slotIndex % HUD_HEX_STREAM.length;

  return (
    <div className="reward-card-hud" aria-hidden>
      <span className="reward-card-hud__corner reward-card-hud__corner--tl">{designation}</span>
      <span className="reward-card-hud__corner reward-card-hud__corner--tr">{`ID_0x${idSuffix}`}</span>
      <span className="reward-card-hud__corner reward-card-hud__corner--bl">
        {HUD_HEX_STREAM[i]}
      </span>
      <span className="reward-card-hud__corner reward-card-hud__corner--br">
        {HUD_SYS_PARAMS[i]}
      </span>
      <span className="reward-card-hud__bracket reward-card-hud__bracket--tl" />
      <span className="reward-card-hud__bracket reward-card-hud__bracket--br" />
    </div>
  );
}
