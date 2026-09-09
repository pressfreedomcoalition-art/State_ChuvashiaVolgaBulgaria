import { useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { shortAddr } from "../lib/civic";
import { resolveWallet } from "../lib/e2eHooks";

const DRAFT_KEY = "chv_candidate_draft_v1";

export type CandidateDraft = {
  name: string;
  age: string;
  bio: string;
  photo: string;
};

function loadDraft(): CandidateDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { name: "", age: "", bio: "", photo: "" };
    const j = JSON.parse(raw) as Partial<CandidateDraft>;
    return {
      name: String(j.name || ""),
      age: String(j.age || ""),
      bio: String(j.bio || ""),
      photo: String(j.photo || ""),
    };
  } catch {
    return { name: "", age: "", bio: "", photo: "" };
  }
}

export function saveCandidateDraft(d: CandidateDraft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function readCandidateDraft(): CandidateDraft | null {
  const d = loadDraft();
  return d.name.trim() ? d : null;
}

export function Nominate() {
  const { tt, isCitizen } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [form, setForm] = useState<CandidateDraft>(() => loadDraft());
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => form.name.trim().length >= 2, [form.name]);

  function patch<K extends keyof CandidateDraft>(key: K, value: CandidateDraft[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      saveCandidateDraft(next);
      return next;
    });
  }

  function onContinue() {
    setErr("");
    if (!wallet) {
      ui.openModal();
      setErr(tt("connectTonWallet"));
      return;
    }
    if (!canSubmit) {
      setErr(tt("candidateNameRequired"));
      return;
    }
    if (isCitizen !== true) {
      setErr(tt("candidateNeedCitizen"));
      return;
    }
    saveCandidateDraft(form);
    const title = tt("candidateVoteTitle", { name: form.name.trim() });
    const parts = [
      tt("candidateVoteLead", { name: form.name.trim() }),
      form.age.trim() ? `${tt("candidateAge")}: ${form.age.trim()}` : "",
      form.bio.trim(),
      form.photo.trim() ? `photo: ${form.photo.trim()}` : "",
      wallet ? `wallet: ${wallet}` : "",
    ].filter(Boolean);
    const q = new URLSearchParams({
      vtype: "0",
      title,
      description: parts.join("\n"),
      from: "nominate",
    });
    nav(`/referendums/new?${q.toString()}`);
  }

  return (
    <div className="stack">
      <Link to="/council" className="muted">
        ← {tt("council")}
      </Link>
      <h1 className="page-title" data-testid="nominate-title">
        {tt("becomeCandidate")}
      </h1>
      <p className="muted">{tt("candidateFormHint")}</p>

      <div className="card stack">
        <label className="muted">
          {tt("candidateName")}
          <input
            data-testid="candidate-name"
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            style={inputStyle}
            placeholder={tt("candidateNamePh")}
            autoComplete="name"
          />
        </label>
        <label className="muted">
          {tt("candidateAge")}
          <input
            data-testid="candidate-age"
            value={form.age}
            onChange={(e) => patch("age", e.target.value)}
            style={inputStyle}
            placeholder="…"
            inputMode="numeric"
          />
        </label>
        <label className="muted">
          {tt("candidateBio")}
          <textarea
            data-testid="candidate-bio"
            value={form.bio}
            onChange={(e) => patch("bio", e.target.value)}
            rows={4}
            style={inputStyle}
            placeholder={tt("candidateBioPh")}
          />
        </label>
        <label className="muted">
          {tt("candidatePhoto")}
          <input
            data-testid="candidate-photo"
            value={form.photo}
            onChange={(e) => patch("photo", e.target.value)}
            style={inputStyle}
            placeholder="https://…"
          />
        </label>

        <p className="muted">
          {tt("settingsWallet")}: {wallet ? shortAddr(wallet, 4, 4) : "—"}
        </p>

        {err ? <p style={{ color: "var(--maroon)", margin: 0 }}>{err}</p> : null}

        <button
          type="button"
          className="btn btn-primary btn-wide"
          data-testid="candidate-continue"
          disabled={!canSubmit}
          onClick={onContinue}
        >
          {tt("candidateContinue")}
        </button>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: 10,
  borderRadius: 10,
  border: "1px solid var(--line)",
  boxSizing: "border-box",
};
