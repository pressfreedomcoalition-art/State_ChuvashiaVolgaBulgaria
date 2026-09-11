import type { CabinetApp } from "./cabinetCatalog";
import { loadCabinetCatalog } from "./cabinetCatalog";

export type HubApp = CabinetApp;

/** @deprecated use loadCabinetCatalog — kept for type re-exports */
export async function loadCabinetApps(): Promise<HubApp[]> {
  const { catalog } = await loadCabinetCatalog();
  return catalog.apps;
}
