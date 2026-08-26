import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-primary/10 text-primary",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    outline: "text-foreground border-border",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
