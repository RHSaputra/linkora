import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold leading-none transition-all duration-150 ease-out active:scale-[0.97] active:duration-75 select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover hover:shadow-md active:bg-primary-hover/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/90",
        outline:
          "border border-border bg-background shadow-xs hover:bg-muted hover:text-foreground hover:border-primary/40 active:bg-muted/80",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted/80",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 hover:shadow-md active:bg-destructive/95",
        "destructive-outline":
          "border border-destructive/30 bg-background text-destructive shadow-xs hover:bg-destructive/10 hover:border-destructive/60 active:bg-destructive/20",
        "destructive-ghost":
          "text-destructive hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20",
        success:
          "bg-success text-success-foreground shadow-xs hover:bg-success/90 hover:shadow-md active:bg-success/95",
        warning:
          "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90 hover:shadow-md active:bg-warning/95",
        info:
          "bg-info text-info-foreground shadow-xs hover:bg-info/90 hover:shadow-md active:bg-info/95",
        link:
          "text-primary underline-offset-4 hover:underline active:scale-100 focus-visible:ring-offset-0",
      },
      size: {
        xs: "h-7 rounded-lg px-2.5 text-xs font-semibold gap-1.5 [&_svg]:size-3.5",
        sm: "h-8 rounded-lg px-3 text-xs font-semibold gap-1.5 [&_svg]:size-3.5",
        default: "h-9 rounded-xl px-4 py-2 text-sm font-semibold gap-2 [&_svg]:size-4",
        lg: "h-11 rounded-xl px-6 text-sm font-semibold gap-2 [&_svg]:size-4.5",
        "icon-xs": "h-7 w-7 rounded-lg p-0 [&_svg]:size-3.5",
        "icon-sm": "h-8 w-8 rounded-lg p-0 [&_svg]:size-3.5",
        icon: "h-9 w-9 rounded-xl p-0 [&_svg]:size-4",
        "icon-lg": "h-11 w-11 rounded-xl p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
