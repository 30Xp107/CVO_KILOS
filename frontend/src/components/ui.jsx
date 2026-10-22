import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { cn } from "../lib/helpers.js";
import { STATUS_META } from "../lib/helpers.js";

export function BrandMark({ size = "md", light = false }) {
  return (
    <div className={cn("brand-mark", `brand-${size}`, light && "brand-light")}>
      <div className="brand-seal" aria-hidden="true">
        <span className="brand-seal-star">★</span>
        <span className="brand-seal-text">DSWD</span>
      </div>
      <div className="brand-words">
        <span className="brand-republic">Republic of the Philippines</span>
        <strong>DSWD</strong>
        <span>Walang Gutom Program</span>
      </div>
    </div>
  );
}

export function Spinner({ size = 18, className = "" }) {
  return <Loader2 size={size} className={cn("spin", className)} aria-hidden="true" />;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn("btn", `btn-${variant}`, `btn-${size}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size={17} /> : Icon ? <Icon size={17} /> : null}
      <span>{children}</span>
      {IconRight ? <IconRight size={17} /> : null}
    </button>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className = "",
}) {
  return (
    <div className={cn("form-field", error && "has-error", className)}>
      {label ? (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="required-mark"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={cn("input", className)} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <div className={cn("select-wrap", className)}>
      <select className="input select" {...props}>
        {children}
      </select>
    </div>
  );
}

export function TextArea({ className = "", rows = 3, ...props }) {
  return <textarea className={cn("input textarea", className)} rows={rows} {...props} />;
}

export function CheckChips({
  options,
  values = [],
  onChange,
  columns,
  className = "",
  ariaLabel,
}) {
  return (
    <div
      className={cn("chip-grid", columns && `chip-cols-${columns}`, className)}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const checked = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={cn("check-chip", checked && "is-checked")}
            aria-pressed={checked}
            onClick={() => onChange(checked ? values.filter((v) => v !== option.value) : [...values, option.value])}
          >
            <span className="check-box" aria-hidden="true">
              {checked ? <Check size={12} strokeWidth={3.2} /> : null}
            </span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceGrid({
  options,
  value,
  onChange,
  columns = 2,
  portrait = false,
  name,
}) {
  return (
    <div className={cn("choice-grid", `choice-cols-${columns}`, portrait && "choice-portrait")} role="radiogroup">
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            name={name}
            className={cn("choice-card", checked && "is-selected")}
            onClick={() => onChange(option.value)}
          >
            <span className="radio-dot" aria-hidden="true">
              {checked ? <span /> : null}
            </span>
            <span className="choice-copy">
              <span className="choice-label">{option.label}</span>
              {option.description ? (
                <span className="choice-description">{option.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function GroupedChecklist({ groups, values = [], onChange, columns = 2 }) {
  const toggle = (value) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  return (
    <div className={cn("grouped-checklist", `grouped-cols-${columns}`)}>
      {groups.map((group) => (
        <fieldset className="check-group" key={group.title}>
          <legend>{group.title}</legend>
          <div className="check-group-items">
            {group.items.map((item) => {
              const checked = values.includes(item.value);
              return (
                <label key={item.value} className={cn("check-line", checked && "is-checked")}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.value)}
                  />
                  <span className="check-box" aria-hidden="true">
                    {checked ? <Check size={12} strokeWidth={3.2} /> : null}
                  </span>
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function SectionCard({ icon: Icon, eyebrow, title, description, children, className = "", aside }) {
  return (
    <section className={cn("section-card", className)}>
      <header className="section-card-head">
        <div className="section-card-heading">
          {Icon ? (
            <span className="section-icon">
              <Icon size={19} />
            </span>
          ) : null}
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
            {description ? <p className="section-description">{description}</p> : null}
          </div>
        </div>
        {aside}
      </header>
      <div className="section-card-body">{children}</div>
    </section>
  );
}

export function InfoBanner({ icon: Icon = AlertTriangle, tone = "info", title, children }) {
  return (
    <div className={cn("info-banner", `banner-${tone}`)}>
      <Icon size={19} className="info-banner-icon" />
      <div>
        {title ? <strong>{title}</strong> : null}
        <p>{children}</p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status || "Unknown", className: "status-default" };
  return <span className={cn("status-badge", meta.className)}>{meta.label}</span>;
}

export function EmptyState({ icon: Icon = Inbox, title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => panelRef.current?.focus(), 20);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div
        className={cn("modal-panel", `modal-${size}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  loading,
  tone = "danger",
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-input">
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button type="button" onClick={() => onChange("")} aria-label="Clear search">
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

export function Pagination({ page, pages, total, limit, onPageChange }) {
  if (!total) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(total, page * limit);
  return (
    <div className="pagination">
      <span className="pagination-copy">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{total}</strong>
      </span>
      <div className="pagination-buttons">
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="pagination-page">
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          iconRight={ChevronRight}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function DataGrid({ children, columns = 2, className = "" }) {
  return <div className={cn("data-grid", `data-cols-${columns}`, className)}>{children}</div>;
}

export function DataItem({ label, value, wide, children }) {
  return (
    <div className={cn("data-item", wide && "data-wide")}>
      <span className="data-label">{label}</span>
      <div className="data-value">{children ?? (value && String(value).trim() ? value : <span className="muted">Not provided</span>)}</div>
    </div>
  );
}

export function ChipList({ values = [], empty = "None provided" }) {
  if (!values.length) return <span className="muted">{empty}</span>;
  return (
    <div className="tag-list">
      {values.map((value) => (
        <span className="tag" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}
