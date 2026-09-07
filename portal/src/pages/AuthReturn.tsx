import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parsePresentReturn, stripPresentFromUrl } from "../lib/presentReturn";
import { pathAfterGate, resolveCitizenshipGate, writeCitizenFlag } from "../lib/authGate";
import { unlockPassportSilent, hasLocalVault } from "../lib/passport";
import { useApp } from "../state/AppState";
import { saveSessionPresentation } from "./Login";

export function AuthReturn() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { tt, setIsCitizen } = useApp();
  const [msg, setMsg] = useState(() => tt("receivingPassport"));

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const err = params.get("error");
      if (err) {
        setMsg(tt("cancelledWith", { err }));
        return;
      }
      const p = parsePresentReturn() || params.get("presentation");
      if (!p) {
        setMsg(tt("noPresentation"));
        return;
      }
      saveSessionPresentation(p);
      stripPresentFromUrl();
      if (hasLocalVault()) unlockPassportSilent();
      try {
        sessionStorage.setItem(
          "chv_passport_session_v1",
          JSON.stringify({ presentationOnly: true, unlockedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
      setMsg(tt("checkingCitizenship"));
      try {
        const gate = await resolveCitizenshipGate();
        if (cancelled) return;
        const citizen = gate === "citizen";
        writeCitizenFlag(citizen ? true : gate === "not_citizen" ? false : null);
        setIsCitizen(citizen ? true : gate === "not_citizen" ? false : null);
        nav(pathAfterGate(gate), { replace: true });
      } catch {
        if (cancelled) return;
        nav("/referendums", { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, nav]);

  return (
    <div className="auth">
      <div className="card">{msg}</div>
    </div>
  );
}
