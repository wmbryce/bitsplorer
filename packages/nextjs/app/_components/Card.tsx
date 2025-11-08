import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "border border-slate-200 rounded-md text-slate-500 shadow-sm bg-slate-50",
        className
      )}
      {...props}
    />
  );
}
