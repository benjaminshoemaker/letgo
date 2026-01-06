import Image from "next/image";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="text-base font-semibold tracking-tight">LetGo</div>
        {session?.user?.id ? (
          <div className="flex items-center gap-2">
            <SignOutButton />
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User avatar"}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
