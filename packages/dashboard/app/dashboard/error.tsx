"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] Uncaught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <span style={{ fontSize: 48 }}>⚠️</span>
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
