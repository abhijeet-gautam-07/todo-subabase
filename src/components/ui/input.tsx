// src/components/ui/input.tsx
import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

/**
 * ForwardRef input so parent components can pass `ref` safely.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...props },
  ref
) {
  return <input ref={ref} {...props} className={["w-full px-3 py-2 border rounded-md", className].join(" ")} />;
});

Input.displayName = "Input";

export default Input;
