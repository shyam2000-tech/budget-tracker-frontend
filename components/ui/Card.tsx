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
        "bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all",
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
      className={cn("px-5 py-4 border-b border-slate-100 flex items-center justify-between", className)}
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
      className={cn("text-sm font-semibold text-slate-800 tracking-tight", className)}
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
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
};

