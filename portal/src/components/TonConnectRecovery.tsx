import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";

/** Detect TonConnect / wallet-send failures from SDK or wrappers. */
export function isTonConnectFail(msg: string | null | undefined): boolean {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("ton_connect") ||
    m.includes("tonconnect") ||
    m.includes("transaction was not sent") ||
    m.includes("user rejects") ||
    m.includes("user rejected") ||
    m.includes("wallet_closed") ||
    m.includes("sendtransaction") ||
    m.includes("pop-up closed") ||
    m.includes("popup closed")
  );
}

export function tonConnectHint(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("reject") || m.includes("not sent")) {
    return "walletTxRejected";
  }
  return "walletTxFailed";
}

type Props = {
  error: string;
  /** Re-run the last wallet action (vote / finalize / create…). */
  onRetry?: () => void;
  onDismiss?: () => void;
  busy?: boolean;
};

/**
 * Action buttons when TonConnect fails — retry, reconnect, open wallet.
 */
export function TonConnectRecovery({ error, onRetry, onDismiss, busy }: Props) {
  const { tt } = useApp();
  const [ui] = useTonConnectUI();
  if (!isTonConnectFail(error)) return null;

  const hintKey = tonConnectHint(error);

  async function reconnect() {
    try {
      await ui.disconnect();
    } catch {
      /* already disconnected */
    }
    ui.openModal();
  }

  return (
    <div className="card stack" data-testid="tonconnect-recovery" style={{ borderColor: "var(--maroon)" }}>
      <p style={{ color: "var(--maroon)", margin: 0, fontWeight: 600 }}>{tt(hintKey)}</p>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        {error.length > 160 ? `${error.slice(0, 160)}…` : error}
      </p>
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {onRetry ? (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onRetry()}>
            {tt("walletRetryTx")}
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void reconnect()}>
          {tt("walletReconnect")}
        </button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ui.openModal()}>
          {tt("walletOpenConnect")}
        </button>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => window.location.reload()}>
          {tt("reload")}
        </button>
        {onDismiss ? (
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onDismiss}>
            {tt("dismiss")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Plain error or TonConnect recovery panel. */
export function ActionError({
  error,
  busy,
  onRetry,
  onDismiss,
}: {
  error: string;
  busy?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  if (!error) return null;
  if (isTonConnectFail(error)) {
    return <TonConnectRecovery error={error} busy={busy} onRetry={onRetry} onDismiss={onDismiss} />;
  }
  return <p style={{ color: "var(--maroon)", margin: 0 }}>{error}</p>;
}
