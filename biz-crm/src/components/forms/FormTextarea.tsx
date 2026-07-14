import { useFormContext } from "react-hook-form";
import { Textarea, type TextareaProps } from "@/components/ui/Textarea";

export interface FormTextareaProps extends Omit<TextareaProps, "error" | "name"> {
  name: string;
}

export function FormTextarea({ name, ...props }: FormTextareaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Textarea
      {...register(name)}
      error={errorMessage}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...props}
    />
  );
}
