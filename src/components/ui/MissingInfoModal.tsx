import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MissingFieldRow {
  key: string;
  label: string;
  message: string;
  type: string;
  options: Array<string | { value: string; label: string }>;
}

export interface MissingInfoModalProps {
  open: boolean;
  rows: MissingFieldRow[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onContinue: () => void;
  onClose: () => void;
  title?: string;
}

const INPUT_CLASS = "w-full rounded-lg border border-neutral-300 px-3 py-2";
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

const norm = (o: string | { value: string; label: string }) =>
  typeof o === "string" ? { value: o, label: o } : o;
const isGroup = (type: string) => type === "radio" || type === "multiselect" || type === "multicheck";
const asString = (v: unknown) => (typeof v === "string" ? v : "");
const asArray = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
// Defensive alignment with the schema's own truthiness vocabulary for consent
// (the esignTypedName required-predicate accepts true, "true" and "Yes"), not a
// mirror of validateFields. Writes always emit a real boolean.
const asChecked = (v: unknown) => v === true || v === "true" || v === "Yes";

interface ControlProps {
  row: MissingFieldRow;
  value: unknown;
  onChange: MissingInfoModalProps["onChange"];
  autofocus: boolean;
}

function Control({ row, value, onChange, autofocus }: ControlProps) {
  const id = `modal-${row.key}`;
  const described = `${id}-error`;
  const focusAttr = autofocus ? { "data-autofocus": "true" } : {};
  const shared = { id, "aria-invalid": true as const, "aria-describedby": described, ...focusAttr };

  if (row.type === "textarea") {
    return (
      <textarea
        {...shared}
        rows={3}
        className={INPUT_CLASS}
        value={asString(value)}
        onChange={(e) => onChange(row.key, e.target.value)}
      />
    );
  }

  if (row.type === "select") {
    return (
      <select
        {...shared}
        className={INPUT_CLASS}
        value={asString(value)}
        onChange={(e) => onChange(row.key, e.target.value)}
      >
        <option value="">Select an option</option>
        {row.options.map((o) => {
          const opt = norm(o);
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    );
  }

  if (row.type === "checkbox") {
    return (
      <input
        {...shared}
        type="checkbox"
        className="h-4 w-4 rounded border-neutral-300"
        checked={asChecked(value)}
        onChange={(e) => onChange(row.key, e.target.checked)}
      />
    );
  }

  const type = row.type === "date" || row.type === "email" || row.type === "tel" ? row.type : "text";
  return (
    <input
      {...shared}
      type={type}
      className={INPUT_CLASS}
      value={asString(value)}
      onChange={(e) => onChange(row.key, e.target.value)}
    />
  );
}

function GroupControl({ row, value, onChange, autofocus }: ControlProps) {
  const id = `modal-${row.key}`;
  const multi = row.type !== "radio";
  const selected = asArray(value);
  return (
    // A bare <fieldset> is role "group", which does not support aria-invalid, so
    // only the radio branch (role "radiogroup", which does) carries it here; the
    // checkbox branch puts aria-invalid on each option input instead.
    <fieldset
      {...(multi ? {} : { role: "radiogroup", "aria-invalid": true as const })}
      aria-describedby={`${id}-error`}
    >
      <legend className="block text-sm font-medium text-neutral-800">{row.label}</legend>
      <div className="mt-2 space-y-2">
        {row.options.map((o, i) => {
          const opt = norm(o);
          const checked = multi ? selected.includes(opt.value) : asString(value) === opt.value;
          return (
            <label key={opt.value} className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                {...(autofocus && i === 0 ? { "data-autofocus": "true" } : {})}
                {...(multi ? { "aria-invalid": true as const } : {})}
                type={multi ? "checkbox" : "radio"}
                name={id}
                value={opt.value}
                checked={checked}
                className="mt-1 h-4 w-4 border-neutral-300"
                onChange={(e) =>
                  onChange(
                    row.key,
                    multi
                      ? e.target.checked
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value)
                      : opt.value,
                  )
                }
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function MissingInfoModal({
  open,
  rows,
  values,
  onChange,
  onContinue,
  onClose,
  title = "A few required items are missing",
}: MissingInfoModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const restoreOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    (first ?? panelRef.current)?.focus();
    return () => {
      document.body.style.overflow = restoreOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      // Recovery first, and in BOTH directions: satisfying a row unmounts the
      // control that had focus, so activeElement falls back to <body> and the
      // next Tab would otherwise walk straight out of the dialog.
      if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open, onClose]);

  if (!open) return null;

  const blocked = rows.length > 0;
  const content = (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/60"
        onClick={onClose}
      >
        <span className="sr-only">Close without submitting</span>
      </button>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="missing-info-modal-title"
        tabIndex={-1}
        /* pb-24: bottom-inset breathing room above the site's fixed z-40 mobile
           bottom bar, so the footer buttons are comfortably reachable. */
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 pb-24 shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="missing-info-modal-title" className="text-lg font-semibold text-neutral-900">
            {title} ({rows.length})
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-neutral-500 hover:text-neutral-900">
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {blocked ? (
          <div className="mt-4">
            {rows.map((row, i) => (
              <div key={row.key} className="mb-4">
                {isGroup(row.type) ? (
                  <GroupControl row={row} value={values[row.key]} onChange={onChange} autofocus={i === 0} />
                ) : (
                  <>
                    <label htmlFor={`modal-${row.key}`} className="block text-sm font-medium text-neutral-800">
                      {row.label}
                    </label>
                    <div className="mt-1">
                      <Control row={row} value={values[row.key]} onChange={onChange} autofocus={i === 0} />
                    </div>
                  </>
                )}
                <p id={`modal-${row.key}-error`} className="mt-1 text-sm text-red-600">
                  {row.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-700">All set - continue to submit.</p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onContinue}
            {...(blocked ? { disabled: true } : {})}
            className={cn(
              "rounded-lg px-4 py-2 font-medium text-white",
              blocked ? "cursor-not-allowed bg-neutral-400" : "bg-[#1a2744] hover:bg-[#24365c]",
            )}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-800"
          >
            Back to form
          </button>
        </div>
      </div>
    </div>
  );

  // SSR has no document to portal into, so the dialog renders inline there
  // (the server-render tests read this fallback's markup).
  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}

export default MissingInfoModal;
