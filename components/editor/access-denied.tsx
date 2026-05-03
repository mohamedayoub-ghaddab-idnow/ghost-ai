import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="flex flex-col items-center text-center px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-elevated mb-4">
          <Lock className="h-8 w-8 text-text-muted" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-text-muted mb-6 max-w-sm">
          You don&apos;t have permission to view this project, or it doesn&apos;t exist.
        </p>
        <Link href="/editor">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    </div>
  );
}
