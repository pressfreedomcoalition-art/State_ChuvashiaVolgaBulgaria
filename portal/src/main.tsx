import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { App } from "./App";
import { AppStateProvider } from "./state/AppState";
import { tonConnectManifestUrl } from "./lib/config";
import { bootTelegram } from "./lib/telegram";
import "./styles/global.css";

bootTelegram();

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={tonConnectManifestUrl()}>
      <BrowserRouter basename={basename}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </BrowserRouter>
    </TonConnectUIProvider>
  </StrictMode>,
);
