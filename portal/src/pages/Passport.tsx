import { useApp } from "../state/AppState";
import { officialDaoUrl } from "../lib/civic";
import { openOfficial } from "../lib/telegram";

export function Passport() {
  const { tt, health } = useApp();
  return (
    <div className="stack">
      <h1 className="page-title">{tt("passport")}</h1>
      <div className="card">
        <p>{tt("passportHint")}</p>
        <p className="muted">
          Face ID / фраза живут на устройстве. Backup и restore — в официальном civic UI.
        </p>
        {health?.gas ? (
          <p className="muted">
            Газ grant {health.gas.grantDebitTon} TON · cast {health.gas.castDebitTon} TON · finalize{" "}
            {health.gas.finalizeDebitTon} TON
          </p>
        ) : null}
        <div className="row">
          <button className="btn btn-primary" onClick={() => openOfficial(officialDaoUrl())}>
            {tt("unlockPassport")}
          </button>
        </div>
      </div>
    </div>
  );
}
