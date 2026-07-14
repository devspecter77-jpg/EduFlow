import { useFormContext } from "react-hook-form";
import { Input, type InputProps } from "@/components/ui/Input";

export interface FormInputProps extends Omit<InputProps, "error" | "name"> {
  name: string;
}

export function FormInput({ name, ...props }: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Input
      {...register(name)}
      error={errorMessage}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  );
}
