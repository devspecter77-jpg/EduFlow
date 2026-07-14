import { useFormContext, Controller } from "react-hook-form";
import { Select, type SelectProps } from "@/components/ui/Select";

export interface FormSelectProps extends Omit<SelectProps, "error" | "name" | "onChange"> {
  name: string;
}

export function FormSelect({ name, ...props }: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...props}
          value={field.value as string}
          onChange={field.onChange}
          error={errorMessage}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}
    />
  );
}
