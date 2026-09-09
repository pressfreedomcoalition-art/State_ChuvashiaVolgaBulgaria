import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { Login } from "./pages/Login";
import { AuthReturn } from "./pages/AuthReturn";
import { Citizenship } from "./pages/Citizenship";
import { Passport } from "./pages/Passport";
import { Referendums } from "./pages/Referendums";
import { CreateReferendum } from "./pages/CreateReferendum";
import { ReferendumDetail } from "./pages/ReferendumDetail";
import { Treasury } from "./pages/Treasury";
import { Council } from "./pages/Council";
import { Nominate } from "./pages/Nominate";
import { Settings } from "./pages/Settings";
import { EligReturn } from "./pages/EligReturn";
import { Sandbox } from "./pages/Sandbox";
import { Apps } from "./pages/Apps";
import { Laws } from "./pages/Laws";
import { Leaders } from "./pages/Leaders";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/return" element={<AuthReturn />} />
      <Route path="/elig" element={<EligReturn />} />
      <Route path="/sandbox" element={<Sandbox />} />
      <Route element={<Shell />}>
        <Route path="/citizenship" element={<Citizenship />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/referendums" element={<Referendums />} />
        <Route path="/referendums/new" element={<CreateReferendum />} />
        <Route path="/referendums/:address" element={<ReferendumDetail />} />
        <Route path="/treasury" element={<Treasury />} />
        <Route path="/council" element={<Council />} />
        <Route path="/council/nominate" element={<Nominate />} />
        <Route path="/laws" element={<Laws />} />
        <Route path="/leaders" element={<Leaders />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
