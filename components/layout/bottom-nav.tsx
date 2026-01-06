import Link from "next/link";

import { Button } from "@/components/ui/button";

export function BottomNav() {
  return (
    <nav className="border-t bg-background">
      <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
        <Button asChild className="flex-1" variant="secondary">
          <Link href="/scan">Scan</Link>
        </Button>
        <Button asChild className="flex-1" variant="secondary">
          <Link href="/items">My Items</Link>
        </Button>
      </div>
    </nav>
  );
}

