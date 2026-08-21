/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DAO_ADDRESS?: string;
  readonly VITE_LANG_DAO_ADDRESS?: string;
  readonly VITE_CIVIC_API?: string;
  readonly VITE_OFFICIAL_UI?: string;
  readonly VITE_PORTAL_ORIGIN?: string;
  readonly VITE_BULCOIN_DEPOSIT_URL?: string;
  readonly VITE_TG_BOT_URL?: string;
  readonly VITE_TONCONNECT_MANIFEST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
