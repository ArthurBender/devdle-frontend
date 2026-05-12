import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "neutral" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "text-success bg-success/10 px-1.5 py-0.5 rounded-full",
  warning: "text-warning bg-warning/10 px-1.5 py-0.5 rounded-full",
  error: "text-error bg-error/10 px-1.5 py-0.5 rounded-full",
  neutral: "text-text-secondary",
};

const dotClasses: Record<BadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-text-secondary",
};

export function Badge({ variant = "neutral", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`} />
      )}
      {children}
    </span>
  );
}
