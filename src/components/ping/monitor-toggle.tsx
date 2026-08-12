import { Activity, CirclePause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

interface MonitorToggleProps {
  active: boolean;
  paused: boolean;
  onToggle: () => void;
}

/**
 * Start/stop the continuous monitor using shadcn/ui Button.
 * State conveyed by text + icon — never color-only (WCAG 2.5.8).
 */
export function MonitorToggle({
  active,
  paused,
  onToggle,
}: MonitorToggleProps) {
  if (!active) {
    return (
      <Button
        variant="outline"
        aria-pressed={false}
        onClick={onToggle}
        className="border-gold/60 text-gold hover:bg-gold/10 h-11 min-w-44 rounded-full"
      >
        <Play className="size-4" aria-hidden="true" />
        Start monitoring
      </Button>
    );
  }

  const label = paused ? "Monitoring paused" : "Stop monitoring";
  const Icon = paused ? CirclePause : Activity;

  return (
    <Button
      variant={paused ? "ghost" : "destructive"}
      aria-pressed={true}
      onClick={onToggle}
      className="h-11 min-w-44 rounded-full"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
