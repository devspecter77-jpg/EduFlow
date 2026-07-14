import { useFormContext, Controller } from "react-hook-form";
import { Switch, type SwitchProps } from "@/components/ui/Switch";

export interface FormSwitchProps extends Omit<SwitchProps, "name" | "checked" | "onChange"> {
  name: string;
}

export function FormSwitch({ name, ...props }: FormSwitchProps) {
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
        <Switch
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
