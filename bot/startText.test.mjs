import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_START_TEXT,
  normalizeStartText,
  resolveStartText,
} from "./startText.mjs";

describe("normalizeStartText", () => {
  it("keeps a real newline in the default", () => {
    assert.equal(DEFAULT_START_TEXT.includes("\n"), true);
    assert.equal(DEFAULT_START_TEXT.includes(".n"), false);
    assert.match(DEFAULT_START_TEXT, /Булгарии\.\nНажмите/);
  });

  it("repairs systemd-mangled .n before Cyrillic", () => {
    const mangled =
      "Кабинет гражданина Чувашии / Волжской Булгарии.nНажмите кнопку, чтобы открыть миниапп.";
    const out = normalizeStartText(mangled);
    assert.equal(out.includes(".n"), false);
    assert.match(out, /Булгарии\.\nНажмите/);
  });

  it("expands __NL__ and \\n", () => {
    assert.equal(normalizeStartText("A.__NL__B"), "A.\nB");
    assert.equal(normalizeStartText("A.\\nB"), "A.\nB");
  });

  it("empty / missing → default with newline", () => {
    assert.equal(normalizeStartText(""), DEFAULT_START_TEXT);
    assert.equal(normalizeStartText(null), DEFAULT_START_TEXT);
    assert.equal(resolveStartText(undefined), DEFAULT_START_TEXT);
  });

  it("one-line env (no break) → canonical two-line default", () => {
    const one =
      "Кабинет гражданина Чувашии / Волжской Булгарии. Нажмите кнопку, чтобы открыть миниапп.";
    assert.equal(resolveStartText(one), DEFAULT_START_TEXT);
  });

  it("mangled env .n → canonical two-line default", () => {
    const mangled =
      "Кабинет гражданина Чувашии / Волжской Булгарии.nНажмите кнопку, чтобы открыть миниапп.";
    assert.equal(resolveStartText(mangled), DEFAULT_START_TEXT);
  });
});

