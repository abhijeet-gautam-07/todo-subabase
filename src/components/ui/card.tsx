// src/components/ui/card.tsx
import * as React from "react";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Card - container
 */
export function Card({ children, className = "" }: BaseProps) {
  // Note: we keep padding off here so CardContent can control spacing per usage.
  return <div className={["bg-white shadow rounded-lg overflow-hidden", className].join(" ")}>{children}</div>;
}

/**
 * CardHeader - top area for titles
 */
export function CardHeader({ children, className = "" }: BaseProps) {
  return <div className={["px-4 py-3 border-b", className].join(" ")}>{children}</div>;
}

/**
 * CardTitle - heading for card
 */
export function CardTitle({ children, className = "" }: BaseProps) {
  return <h3 className={["text-lg font-semibold", className].join(" ")}>{children}</h3>;
}

/**
 * CardContent - accepts className and any div attributes (e.g. role, id)
 * This is the component that your TodoList was calling with a className prop.
 */
export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  // default padding can be overridden by passed-in className
  return (
    <div className={["p-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}
