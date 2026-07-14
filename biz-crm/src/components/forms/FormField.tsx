import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/utils/cn";

export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (field: {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
  }) => React.ReactNode;
}

export function FormField({
  name,
  label,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => <>{children(field)}</>}
      />

      {description && !errorMessage && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
