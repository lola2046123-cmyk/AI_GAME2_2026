import type { ShowcaseSubmission } from "./submission";

export type RegistrationModalState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; record: ShowcaseSubmission };
