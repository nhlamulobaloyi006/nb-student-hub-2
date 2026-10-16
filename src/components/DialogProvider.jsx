import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import "./Dialog.css";

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const show = useCallback((config) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog(config);
    });
  }, []);

  const confirm = useCallback((config) => {
    if (typeof config === "string") config = { title: config };
    return show({ ...config, kind: "confirm" });
  }, [show]);

  const alert = useCallback((config) => {
    if (typeof config === "string") config = { title: config };
    return show({ ...config, kind: "alert" });
  }, [show]);

  const prompt = useCallback((config) => {
    if (typeof config === "string") config = { title: config };
    return show({ ...config, kind: "prompt" });
  }, [show]);

  const close = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setDialog(null);
    if (resolve) resolve(result);
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}
      <DialogHost dialog={dialog} onClose={close} />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

function DialogHost({ dialog, onClose }) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (dialog?.kind === "prompt") {
      setInputValue(dialog.defaultValue || "");
    }
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    function onKey(e) {
      if (e.key === "Escape") onClose(dialog.kind === "prompt" ? null : false);
      if (e.key === "Enter" && dialog.kind === "prompt") onClose(inputValue);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, onClose, inputValue]);

  if (!dialog) return null;

  const {
    kind = "confirm",
    tone = "default",
    title,
    body,
    confirmLabel,
    cancelLabel,
    placeholder,
    icon,
  } = dialog;

  const toneClass = "dlg-" + (tone === "danger" ? "danger" : tone === "success" ? "success" : "default");

  function handleConfirm() {
    if (kind === "prompt") onClose(inputValue);
    else onClose(true);
  }

  function handleCancel() {
    if (kind === "prompt") onClose(null);
    else onClose(false);
  }

  return (
    <div className={"dlg-scrim" + (kind === "alert" ? " is-alert" : "")} onClick={kind === "alert" ? handleConfirm : handleCancel}>
      <div
        className={"dlg-panel " + toneClass}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && <div className="dlg-icon" aria-hidden="true">{icon}</div>}

        {title && <h2 className="dlg-title">{title}</h2>}
        {body && <p className="dlg-body">{body}</p>}

        {kind === "prompt" && (
          <input
            type="text"
            className="dlg-input"
            autoFocus
            placeholder={placeholder || ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        )}

        <div className="dlg-actions">
          {kind !== "alert" && (
            <button type="button" className="btn btn-ghost dlg-cancel" onClick={handleCancel}>
              {cancelLabel || "Cancel"}
            </button>
          )}
          <button
            type="button"
            className={"btn dlg-confirm " + (tone === "danger" ? "btn-danger" : "btn-primary")}
            onClick={handleConfirm}
            autoFocus={kind === "alert"}
          >
            {confirmLabel || (kind === "alert" ? "OK" : kind === "prompt" ? "Save" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
