import type { ShowcaseSubmission } from "./submission";

export type AppOutletContext = {
  openRegister: () => void;
  openEdit: (record: ShowcaseSubmission) => void;
  /**
   * 递增计数器：每次管理员在 RegistrationModal 里保存成功会 +1。
   * AdminPage 依赖此值作为副作用依赖以便重新拉取列表，
   * 解决「navigate("/admin") 同路径不重挂载 → 列表不刷新」问题。
   */
  adminSaveSignal: number;
};
