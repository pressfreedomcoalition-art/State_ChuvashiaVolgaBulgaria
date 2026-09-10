import { useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { shortAddr, type DeputyCard } from "../lib/civic";
import { resolveWallet, isE2eTestnet } from "../lib/e2eHooks";
import { DAO_ADDRESS } from "../lib/config";
import { ensurePresentation } from "../lib/passport";
import { civicPostJson } from "../lib/civicFetch";
import { MiniHtmlEditor } from "../components/MiniHtmlEditor";
import { SafeHtml } from "../components/SafeHtml";
import { sanitizeBioHtml } from "../ton/safeHtml";
import { buildNominateTx, findMyDeputyProfile, type DeputyProfile } from "../ton/deputy";
import { ActionError } from "../components/TonConnectRecovery";

const DRAFT_KEY = "chv_candidate_draft_v1";

export type CandidateDraft = {
  name: string;
  bio: string;
  photo: string;
  riskAck: boolean;
};

function loadDraft(): CandidateDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { name: "", bio: "", photo: "", riskAck: false };
    const j = JSON.parse(raw) as Partial<CandidateDraft> & { age?: string };
    return {
      name: String(j.name || ""),
      bio: String(j.bio || ""),
      photo: String(j.photo || ""),
      riskAck: !!j.riskAck,
    };
  } catch {
    return { name: "", bio: "", photo: "", riskAck: false };
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

function asProfiles(list: DeputyCard[]): DeputyProfile[] {
  return list.map((d) => ({
    address: d.address || "",
    passportCommit: (d as { passportCommit?: string }).passportCommit,
    subject: (d as { subject?: string }).subject,
    fullName: d.name,
    name: d.name,
    photoUrl: d.photo,
    photo: d.photo,
    bio: d.bio,
  }));
}

export function Nominate() {
  const { tt, isCitizen, deputies, refresh } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [form, setForm] = useState<CandidateDraft>(() => loadDraft());
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const canPreview = useMemo(() => form.name.trim().length >= 2, [form.name]);

  function patch<K extends keyof CandidateDraft>(key: K, value: CandidateDraft[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      saveCandidateDraft(next);
      return next;
    });
  }

  async function resolveCommit(presentation: string): Promise<string | null> {
    const st = await civicPostJson<{ ok?: boolean; myCommit?: string; commit?: string }>(
      "/v1/delegation/status",
      { presentation, dao: DAO_ADDRESS },
    ).catch(() => null);
    if (st?.myCommit) return st.myCommit;
    if (st?.commit) return st.commit;
    const cit = await civicPostJson<{ ok?: boolean; commit?: string }>("/v1/citizenship/status", {
      presentation,
      dao: DAO_ADDRESS,
    }).catch(() => null);
    return cit?.commit || null;
  }

  async function onPublish() {
    setErr("");
    setInfo("");
    if (!wallet) {
      ui.openModal();
      setErr(tt("connectTonWallet"));
      return;
    }
    if (!canPreview) {
      setErr(tt("candidateNameRequired"));
      return;
    }
    if (isCitizen !== true) {
      setErr(tt("candidateNeedCitizen"));
      return;
    }
    if (!form.riskAck) {
      setErr(tt("candidateNeedAck"));
      setStep("edit");
      return;
    }

    setBusy(true);
    try {
      if (isE2eTestnet()) {
        setInfo(tt("candidatePublishOk"));
        saveCandidateDraft(form);
        setTimeout(() => nav("/council", { replace: true }), 600);
        return;
      }

      const presentation = await ensurePresentation({ reason: tt("unlockReasonStatus") });
      const commit = await resolveCommit(presentation);
      if (!commit) throw new Error(tt("candidateNeedCommit"));

      const existing = findMyDeputyProfile(asProfiles(deputies), commit);
      const bio = sanitizeBioHtml(form.bio.trim());
      const tx = buildNominateTx({
        dao: DAO_ADDRESS,
        passportCommit: commit,
        wallet,
        existing,
        photoUrl: form.photo.trim(),
        fullName: form.name.trim(),
        bio,
      });
      await ui.sendTransaction(tx);
      setInfo(tt("candidatePublishOk"));
      saveCandidateDraft(form);
      void refresh();
      setTimeout(() => nav("/council", { replace: true }), 800);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
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

      {step === "edit" ? (
        <div className="card stack">
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
            {tt("candidateBio")}
            <div style={{ marginTop: 4 }}>
              <MiniHtmlEditor
                value={form.bio}
                onChange={(html) => patch("bio", html)}
                disabled={busy}
                placeholder={tt("htmlEditorPlaceholder")}
              />
            </div>
          </label>

          <label className="muted row" style={{ gap: 8, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              data-testid="candidate-risk-ack"
              checked={form.riskAck}
              onChange={(e) => patch("riskAck", e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span>{tt("candidateRiskAck")}</span>
          </label>

          <p className="muted">
            {tt("settingsWallet")}: {wallet ? shortAddr(wallet, 4, 4) : "—"}
          </p>

          {err ? <p style={{ color: "var(--maroon)", margin: 0 }}>{err}</p> : null}

          <button
            type="button"
            className="btn btn-primary btn-wide"
            data-testid="candidate-continue"
            disabled={!canPreview || busy}
            onClick={() => {
              setErr("");
              if (!canPreview) {
                setErr(tt("candidateNameRequired"));
                return;
              }
              setStep("preview");
            }}
          >
            {tt("candidateContinue")}
          </button>
        </div>
      ) : (
        <div className="card stack">
          <h2 style={{ margin: 0, fontSize: 18 }}>{tt("candidatePreviewTitle")}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {tt("candidatePreviewHint")}
          </p>
          <div className="del-preview-card" style={{ padding: 12, borderRadius: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {form.photo.trim() ? (
                <img
                  src={form.photo.trim()}
                  alt=""
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    background: "var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: "var(--muted)",
                  }}
                >
                  ?
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 16 }}>{form.name.trim()}</strong>
              </div>
            </div>
            {form.bio.trim() ? (
              <SafeHtml html={sanitizeBioHtml(form.bio)} className="profile-bio" />
            ) : (
              <p className="muted" style={{ marginTop: 10 }}>
                —
              </p>
            )}
          </div>

          {info ? <p style={{ color: "var(--ok)", margin: 0 }}>{info}</p> : null}
          {err ? (
            <ActionError
              error={err}
              busy={busy}
              onRetry={() => void onPublish()}
              onDismiss={() => setErr("")}
            />
          ) : null}

          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => setStep("edit")}>
              {tt("candidateBackEdit")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-testid="candidate-publish"
              disabled={busy}
              onClick={() => void onPublish()}
            >
              {wallet ? tt("candidatePublish") : tt("connectTonWallet")}
            </button>
          </div>
        </div>
      )}
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
