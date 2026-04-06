import { useCallback, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import { AppChrome } from "./components/layout/AppChrome";
import { RegistrationModal } from "./components/registration/RegistrationModal";
import { RegistrationUiContext } from "./context/RegistrationUiContext";
import { HomePage } from "./pages/HomePage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { AdminPage } from "./pages/AdminPage";
import type { RegistrationModalState } from "./types/registrationModal";
import type { ShowcaseSubmission } from "./types/submission";
import type { AppOutletContext } from "./types/outlet";

function RoutedTree() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<RegistrationModalState>({ kind: "closed" });

  const openRegister = useCallback(() => setModal({ kind: "create" }), []);
  const openEdit = useCallback((record: ShowcaseSubmission) => {
    setModal({ kind: "edit", record });
  }, []);

  const outletCtx = useMemo<AppOutletContext>(
    () => ({ openRegister, openEdit }),
    [openRegister, openEdit]
  );

  return (
    <RegistrationUiContext.Provider value={openRegister}>
      <AppChrome>
        <Routes>
          <Route element={<Outlet context={outletCtx} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/showcase" element={<ShowcasePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <RegistrationModal
          state={modal}
          onStateChange={setModal}
          onSubmitted={() => navigate("/showcase")}
          onAdminSaved={() => navigate("/admin")}
        />
      </AppChrome>
    </RegistrationUiContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedTree />
    </BrowserRouter>
  );
}
