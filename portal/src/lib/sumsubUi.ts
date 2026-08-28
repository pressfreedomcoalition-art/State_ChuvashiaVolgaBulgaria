/** Lazy Sumsub WebSDK — same adapter as dao miniapp. */
import snsWebSdk from "@sumsub/websdk";

export type SumsubLaunchResult =
  | { ok: true; reason: "completed" | "closed" }
  | { ok: false; error: string };

export function launchSumsubSdk(opts: {
  accessToken: string;
  onTokenExpired?: () => Promise<string>;
}): Promise<SumsubLaunchResult> {
  const { accessToken, onTokenExpired } = opts;
  return new Promise((resolve) => {
    let settled = false;
    const done = (r: SumsubLaunchResult) => {
      if (settled) return;
      settled = true;
      try {
        instance.destroy();
      } catch {
        /* ignore */
      }
      resolve(r);
    };

    const instance = snsWebSdk
      .init(accessToken, async () => {
        if (onTokenExpired) return onTokenExpired();
        return accessToken;
      })
      .withConf({ lang: "ru", theme: "dark" })
      .withOptions({ addViewportTag: false, adaptIframeHeight: true })
      .on("idCheck.onError", (error: unknown) => {
        done({
          ok: false,
          error: String((error as { message?: string })?.message || error || "sumsub error"),
        });
      })
      .onMessage((type: string, payload: unknown) => {
        if (type === "idCheck.onApplicantStatusChanged") {
          const rev = (payload as { reviewStatus?: string })?.reviewStatus;
          if (rev === "completed" || rev === "pending") {
            done({ ok: true, reason: "completed" });
          }
        }
      })
      .build();

    instance.launch("#sumsub-websdk-container");
    setTimeout(() => {
      if (!settled) done({ ok: true, reason: "closed" });
    }, 45 * 60 * 1000);
  });
}
