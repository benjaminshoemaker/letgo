import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
          <Leaf className="h-5 w-5 text-emerald-600" />
          <span className="text-lg font-semibold tracking-tight">LetGo</span>
        </Link>
        {session?.user?.id ? (
          <div className="flex items-center gap-2">
            <SignOutButton />
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User avatar"}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full ring-2 ring-background"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
