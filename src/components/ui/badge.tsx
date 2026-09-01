import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-primary/15 text-primary",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    outline: "text-foreground border-border/80 bg-background/50",
    destructive: "border-transparent bg-destructive/15 text-destructive",
    success: "border-transparent bg-success/15 text-success",
    warning: "border-transparent bg-warning/15 text-warning",
    info: "border-transparent bg-info/15 text-info",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold select-none transition-all duration-150",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
