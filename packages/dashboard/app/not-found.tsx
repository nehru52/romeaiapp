import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <span style={{ fontSize: 64 }}>🔍</span>
        <h1 className="font-display text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
