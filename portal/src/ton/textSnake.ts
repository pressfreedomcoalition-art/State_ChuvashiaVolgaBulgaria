import { beginCell, type Cell } from "@ton/core";

/** Snake-string cell (storeStringTail + continuation refs). */
export function stringSnakeCell(text: string): Cell {
  return beginCell().storeStringTail(text ?? "").endCell();
}
