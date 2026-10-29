import React, { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Card = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300/80 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn("text-xs sm:text-sm font-semibold text-slate-800 tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("p-3.5 sm:p-5", className)} {...props}>
      {children}
    </div>
  );
};
