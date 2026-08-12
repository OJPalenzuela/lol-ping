import { Activity, CirclePause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

interface MonitorToggleProps {
  active: boolean;
  paused: boolean;
  onToggle: () => void;
}

/**
 * Start/stop the continuous monitor. 44px tall target (WCAG 2.5.8),
 * state conveyed by text + icon — never color-only.
 */
export function MonitorToggle({
  active,
  paused,
  onToggle,
}: MonitorToggleProps) {
  if (!active) {
    return (
      <button
        type="button"
        aria-pressed={false}
        onClick={onToggle}
        className="border-gold/60 text-gold hover:bg-gold/10 focus-visible:outline-ring inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Play className="size-4" aria-hidden="true" />
        Start monitoring
      </button>
    );
  }

  const label = paused ? "Monitoring paused" : "Stop monitoring";
  const Icon = paused ? CirclePause : Activity;

  return (
    <button
      type="button"
      aria-pressed={true}
      onClick={onToggle}
      className={cn(
        "focus-visible:outline-ring inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        paused
          ? "border-border bg-card text-muted-foreground"
          : "border-destructive/60 text-destructive hover:bg-destructive/10",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  );
}
