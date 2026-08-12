"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePingTest } from "@/hooks/use-ping-test";

import { MonitorToggle } from "./monitor-toggle";
import { PingHistory } from "./ping-history";
import { PingRow } from "./ping-row";
import { PingSkeleton } from "./ping-skeleton";

/** Client island composing the ping hook, rows, toggle and history. */
export function PingPanel() {
  const { state, startPing, toggleMonitor } = usePingTest();
  const [visible, setVisible] = useState(true);

  // Track tab visibility purely for the paused monitor indicator.
  useEffect(() => {
    const handleVisibility = () =>
      setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const paused = state.monitorActive && !visible;

  return (
    <Card id="ping-tester" aria-labelledby="ping-tester-title">
      <CardHeader>
        <CardTitle id="ping-tester-title">Test your ping</CardTitle>
        <CardAction>
          <div className="flex items-center gap-3">
            <Button
              onClick={startPing}
              className="bg-gold text-background hover:bg-gold/90 rounded-full"
            >
              <Zap className="size-4" aria-hidden="true" />
              Test ping
            </Button>
            <MonitorToggle
              active={state.monitorActive}
              paused={paused}
              onToggle={toggleMonitor}
            />
          </div>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div
          aria-label="Ping results"
          aria-live="polite"
          aria-busy={state.status === "loading"}
          className="flex flex-col gap-4"
        >
          {state.status === "loading" && <PingSkeleton />}

          {state.status === "results" && (
            <ul className="flex flex-col gap-2">
              {state.results.map((result, index) => (
                <PingRow
                  key={result.region.code}
                  result={result}
                  history={state.history[result.region.code] ?? []}
                  isBest={index === 0 && result.latencyMs !== null}
                  rank={index + 1}
                />
              ))}
            </ul>
          )}

          {state.status === "error" && (
            <p
              role="status"
              className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm"
            >
              Couldn&apos;t reach any region — check your connection and try
              again.
            </p>
          )}

          {state.status === "idle" && (
            <p className="text-muted-foreground text-sm">
              Hit &ldquo;Test ping&rdquo; to measure all 10 regions, or start
              monitoring for live updates.
            </p>
          )}
        </div>
      </CardContent>

      {state.status !== "idle" && (
        <CardFooter>
          <PingHistory history={state.history} />
        </CardFooter>
      )}
    </Card>
  );
}
