import Link from "next/link";
import { Camera, Package } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md">
        <Link
          href="/scan"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-emerald-600 active:text-emerald-700"
        >
          <Camera className="h-5 w-5" />
          <span>Scan</span>
        </Link>
        <Link
          href="/items"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-emerald-600 active:text-emerald-700"
        >
          <Package className="h-5 w-5" />
          <span>My Items</span>
        </Link>
      </div>
    </nav>
  );
}

