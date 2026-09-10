import { useEffect, useRef } from "react";
import { escapeText, sanitizeBioHtml } from "../ton/safeHtml";
import { t, getLang } from "../lib/i18n";

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

function runCmd(cmd: string, arg?: string) {
  try {
    document.execCommand(cmd, false, arg);
  } catch {
    /* ignore */
  }
}

function selectionInside(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const node = sel.anchorNode;
  if (!node) return false;
  return el === node || el.contains(node.nodeType === 3 ? node.parentNode : node);
}

/** Compact contentEditable bio editor — bold / italic / list / link (as DAO). */
export function MiniHtmlEditor({ value, onChange, disabled, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastOut = useRef(value);
  const focused = useRef(false);
  const lang = getLang();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focused.current || document.activeElement === el) return;
    const next = value || "";
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  function emit(opts?: { forceDom?: boolean }) {
    const el = ref.current;
    if (!el) return;
    const clean = sanitizeBioHtml(el.innerHTML);
    if (clean !== lastOut.current) {
      lastOut.current = clean;
      onChange(clean);
    }
    if (opts?.forceDom && el.innerHTML !== clean && document.activeElement !== el) {
      el.innerHTML = clean;
    }
  }

  function tool(cmd: string, arg?: string) {
    if (disabled) return;
    ref.current?.focus();
    focused.current = true;
    runCmd(cmd, arg);
    emit();
  }

  function addLink() {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    let url = window.prompt(t(lang, "htmlEditorLinkPrompt"), "https://");
    if (url == null) return;
    url = url.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("mailto:")) {
      if (/^[\w.-]+\.[a-z]{2,}/i.test(url)) url = `https://${url}`;
      else {
        window.alert(t(lang, "htmlEditorLinkBad"));
        return;
      }
    }
    el.focus();
    focused.current = true;
    const sel = window.getSelection();
    const hasRange = !!(sel && !sel.isCollapsed && selectionInside(el));
    if (hasRange) {
      runCmd("createLink", url);
    } else {
      const label = escapeText(url.replace(/^https?:\/\//i, ""));
      runCmd(
        "insertHTML",
        `<a href="${escapeText(url)}" rel="noopener noreferrer" target="_blank">${label}</a>\u00a0`,
      );
    }
    emit();
  }

  return (
    <div className={`mini-html-editor${disabled ? " mini-html-disabled" : ""}`}>
      <div className="mini-html-toolbar" role="toolbar" aria-label={t(lang, "htmlEditorToolbar")}>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorBold")} onClick={() => tool("bold")}>
          <b>B</b>
        </button>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorItalic")} onClick={() => tool("italic")}>
          <i>I</i>
        </button>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorUnderline")} onClick={() => tool("underline")}>
          <u>U</u>
        </button>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorUl")} onClick={() => tool("insertUnorderedList")}>
          •
        </button>
        <button
          type="button"
          className="mini-html-btn"
          disabled={disabled}
          title={t(lang, "htmlEditorH3")}
          onClick={() => tool("formatBlock", "h3")}
        >
          H
        </button>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorLink")} onClick={addLink}>
          🔗
        </button>
        <button type="button" className="mini-html-btn" disabled={disabled} title={t(lang, "htmlEditorClear")} onClick={() => tool("removeFormat")}>
          ✕
        </button>
      </div>
      <div
        ref={ref}
        className="mini-html-body"
        contentEditable={!disabled}
        role="textbox"
        aria-multiline="true"
        data-testid="candidate-bio"
        data-placeholder={placeholder || t(lang, "htmlEditorPlaceholder")}
        suppressContentEditableWarning
        onFocus={() => {
          focused.current = true;
        }}
        onInput={() => emit()}
        onBlur={() => {
          focused.current = false;
          emit({ forceDom: true });
        }}
      />
    </div>
  );
}
