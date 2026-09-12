import "./buffer-polyfill";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { tonConnectManifestUrl, bootCacheApiFromJson, bootCivicMirror } from "./lib/config";
import { bootAutoFix } from "./lib/autoFix";
import { bootBugLog } from "./lib/bugLog";
import { bootTelegram } from "./lib/telegram";
import { applyLang, resolveInitialLang } from "./lib/i18n";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/global.css";

bootBugLog();
bootAutoFix();
bootTelegram();
applyLang(resolveInitialLang());

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

// Cache/Pinggy first so civic boot can prefer the /civic proxy (no CF).
void bootCacheApiFromJson()
  .then(() => bootCivicMirror())
  .finally(() => {
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <ErrorBoundary>
          <TonConnectUIProvider manifestUrl={tonConnectManifestUrl()}>
            <BrowserRouter basename={basename}>
              <AppStateProvider>
                <App />
              </AppStateProvider>
            </BrowserRouter>
          </TonConnectUIProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  });
