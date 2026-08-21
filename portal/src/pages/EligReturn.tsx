import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consumeElig } from "../lib/civic";
import { useApp } from "../state/AppState";

export function EligReturn() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { setEligible, tt } = useApp();
  const [msg, setMsg] = useState("…");

  useEffect(() => {
    const code = params.get("elig");
    if (!code) {
      setMsg("no code");
      return;
    }
    void consumeElig(code)
      .then((r) => {
        setEligible(Boolean(r.eligible));
        setMsg(r.eligible ? "ok" : "no");
        nav("/citizenship", { replace: true });
      })
      .catch(() => setMsg("error"));
  }, [params, nav, setEligible]);

  return <p className="content">{tt("loading")} {msg}</p>;
}
