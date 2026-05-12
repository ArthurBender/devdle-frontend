import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white hover:opacity-90 disabled:opacity-50",
  secondary: "border border-border text-text-primary hover:bg-surface disabled:opacity-50",
  ghost: "text-text-secondary hover:text-text-primary disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
};

export function Button({ variant = "secondary", size = "md", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
