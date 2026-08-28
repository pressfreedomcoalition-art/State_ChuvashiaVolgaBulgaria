import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parsePresentReturn, stripPresentFromUrl } from "../lib/presentReturn";
import { saveSessionPresentation } from "./Login";

export function AuthReturn() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [msg, setMsg] = useState("Приём паспорта…");

  useEffect(() => {
    const err = params.get("error");
    if (err) {
      setMsg(`Отмена: ${err}`);
      return;
    }
    const p = parsePresentReturn() || params.get("presentation");
    if (!p) {
      setMsg(
        "Нет presentation в URL. Откройте вход через «Face ID (через DAO)» ещё раз — см. docs/DAO_PASSPORT_API_LINK.md",
      );
      return;
    }
    saveSessionPresentation(p);
    stripPresentFromUrl();
    setMsg("Ок — продолжаем вход");
    nav("/?from=dao", { replace: true });
  }, [params, nav]);

  return (
    <div className="auth">
      <div className="card">{msg}</div>
    </div>
  );
}
