import { useId, useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  "aria-label"?: string;
};

export function CollapsibleSection({
  title,
  children,
  className = "",
  defaultOpen = true,
  subtitle,
  headerActions,
  "aria-label": ariaLabel,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={`collapsible-section ${className}`.trim()} aria-label={ariaLabel ?? title}>
      <div className="collapsible-section-header">
        <button
          type="button"
          className="collapsible-section-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((previous) => !previous)}
        >
          <span className="collapsible-section-chevron" aria-hidden="true">
            {open ? "▾" : "▸"}
          </span>
          <span className="collapsible-section-titles">
            <span className="sound-controls-heading">{title}</span>
            {subtitle ? <span className="collapsible-section-subtitle">{subtitle}</span> : null}
          </span>
        </button>
        {headerActions ? <div className="collapsible-section-actions">{headerActions}</div> : null}
      </div>

      {open && children != null ? (
        <div id={panelId} className="collapsible-section-body">
          {children}
        </div>
      ) : null}
    </section>
  );
}
