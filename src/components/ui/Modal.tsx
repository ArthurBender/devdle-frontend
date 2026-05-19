import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ title, subtitle, icon, onClose, children, footer }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-text-primary font-semibold text-base leading-tight">{title}</h2>
              {subtitle && <p className="text-text-secondary text-xs mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors ml-4 text-lg leading-none cursor-pointer"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 pb-4">{footer}</div>}
      </div>
    </div>
  );
}
