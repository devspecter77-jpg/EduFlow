import { useFormContext, Controller } from "react-hook-form";
import { Checkbox, type CheckboxProps } from "@/components/ui/Checkbox";

export interface FormCheckboxProps extends Omit<CheckboxProps, "name" | "checked" | "onChange"> {
  name: string;
}

export function FormCheckbox({ name, ...props }: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...props}
          checked={field.value as boolean}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
    />
  );
}
