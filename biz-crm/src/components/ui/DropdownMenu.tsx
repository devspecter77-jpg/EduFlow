import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DropdownMenuItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  onSelect: (value: string) => void;
  selected?: string;
  align?: "start" | "end";
}

export function DropdownMenu({
  trigger,
  items,
  onSelect,
  selected,
  align = "end",
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (value: string, disabled?: boolean) => {
    if (disabled) return;
    onSelect(value);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 w-56 rounded-lg border bg-popover p-1 shadow-md",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleSelect(item.value, item.disabled)}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                "focus:bg-accent focus:text-accent-foreground",
                item.disabled
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-accent",
                item.danger && "text-destructive focus:text-destructive"
              )}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className="mr-2 h-4 w-4">{item.icon}</span>
              )}
              <span className="flex-1 text-left">{item.label}</span>
              {selected === item.value && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
