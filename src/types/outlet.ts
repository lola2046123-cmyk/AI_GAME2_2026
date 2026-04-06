import type { ShowcaseSubmission } from "./submission";

export type AppOutletContext = {
  openRegister: () => void;
  openEdit: (record: ShowcaseSubmission) => void;
};
