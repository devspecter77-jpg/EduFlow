import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import "react-day-picker/dist/style.css";

export interface FormDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FormDatePicker({
  name,
  label,
  placeholder = "Sanani tanlang",
  helperText,
  disabled,
  required,
  className,
}: FormDatePickerProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Close calendar on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn("space-y-2", className)} ref={containerRef}>
          {label && (
            <label
              htmlFor={name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}

          <div className="relative">
            <Input
              id={name}
              value={field.value ? format(field.value as Date, "dd.MM.yyyy") : ""}
              placeholder={placeholder}
              disabled={disabled}
              readOnly
              onClick={() => !disabled && setIsOpen(!isOpen)}
              error={errorMessage}
              className="cursor-pointer pr-20"
              leftIcon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            />

            {/* Clear button */}
            {field.value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  field.onChange(null);
                  setIsOpen(false);
                }}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors p-1 rounded",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  errorMessage && "top-[30%]"
                )}
                aria-label="Sanani tozalash"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Calendar Dropdown */}
            {isOpen && !disabled && (
              <div
                className={cn(
                  "absolute z-50 mt-2 rounded-md border bg-popover shadow-md",
                  "animate-in fade-in-0 zoom-in-95"
                )}
                style={{
                  left: 0,
                  right: "auto",
                }}
              >
                <DayPicker
                  mode="single"
                  selected={field.value as Date | undefined}
                  onSelect={(date) => {
                    field.onChange(date);
                    setIsOpen(false);
                  }}
                  className="p-3"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      "inline-flex items-center justify-center rounded-md text-sm font-medium",
                      "ring-offset-background transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:pointer-events-none disabled:opacity-50"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "h-9 w-9 text-center text-sm p-0 relative",
                      "focus-within:relative focus-within:z-20"
                    ),
                    day: cn(
                      "h-9 w-9 p-0 font-normal",
                      "inline-flex items-center justify-center rounded-md",
                      "ring-offset-background transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:pointer-events-none disabled:opacity-50"
                    ),
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            )}
          </div>

          {/* Helper text or error */}
          {(helperText || errorMessage) && (
            <p
              id={error ? `${name}-error` : undefined}
              className={cn(
                "text-sm",
                errorMessage ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {errorMessage || helperText}
            </p>
          )}
        </div>
      )}
    />
  );
}
