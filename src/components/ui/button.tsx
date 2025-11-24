// src/components/ui/button.tsx
import * as React from "react";

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "sm" | "default" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
}

/**
 * Simple Button component with `variant` and `size` mapping to Tailwind classes.
 * Keeps the API compatible with places that call: <Button variant="destructive" size="sm" />
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className = "", variant = "default", size = "default", disabled, ...props },
  ref
) {
  // variant -> classes
  const variantClasses: Record<Variant, string> = {
    default: "bg-sky-600 text-white hover:bg-sky-500",
    destructive: "bg-red-600 text-white hover:bg-red-500",
    outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
    link: "bg-transparent underline text-sky-600 hover:text-sky-700",
  };

  // size -> classes
  const sizeClasses: Record<Size, string> = {
    sm: "px-2.5 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const base = "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const disabledClasses = disabled ? "opacity-50 pointer-events-none" : "";
  const combined = [base, variantClasses[variant], sizeClasses[size], disabledClasses, className].filter(Boolean).join(" ");

  return (
    <button ref={ref} className={combined} disabled={disabled} {...props}>
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
