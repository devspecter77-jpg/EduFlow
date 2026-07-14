import * as React from "react";
import { cn } from "@/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            id={inputId}
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full bg-input transition-colors",
              "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-checked:bg-primary",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              "cursor-pointer",
              className
            )}
          >
            <div
              className={cn(
                "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
                "peer-checked:translate-x-5"
              )}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="grid gap-1 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
