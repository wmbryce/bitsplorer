import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border rounded-md text-slate-500 bg-slate-50 border-slate-200",
        className
      )}
      {...props}
    />
  );
}
