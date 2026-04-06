import { createContext, useContext } from "react";

export const RegistrationUiContext = createContext<(() => void) | null>(null);

export function useOpenRegistration() {
  return useContext(RegistrationUiContext);
}
