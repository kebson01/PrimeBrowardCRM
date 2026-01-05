import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  "New": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500"
  },
  "Skip Trace": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500"
  },
  "Contacted": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500"
  },
  "Offer Made": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500"
  },
  "Under Contract": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500"
  },
  "Sold": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500"
  },
  "Dead Lead": {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400"
  }
};

const DEFAULT_CONFIG = {
  bg: "bg-slate-50",
  text: "text-slate-500",
  border: "border-slate-200",
  dot: "bg-slate-300"
};

export default function LeadStatusBadge({ status, className, showDot = true }) {
  const config = STATUS_CONFIG[status] || DEFAULT_CONFIG;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1.5",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      )}
      {status || 'No Lead'}
    </Badge>
  );
}
