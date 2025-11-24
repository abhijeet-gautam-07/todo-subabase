import * as React from "react";
export function Label({ children, htmlFor, className = "" }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return <label htmlFor={htmlFor} className={["block text-sm font-medium mb-1", className].join(" ")}>{children}</label>;
}
