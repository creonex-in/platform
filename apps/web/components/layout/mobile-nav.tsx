"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrip, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavProps {
  links: ReadonlyArray<{ label: string; href: string }>;
  ctaText?: string;
  ctaHref?: string;
  dashboardLink?: { label: string; href: string };
}

export default function MobileNav({
  links,
  ctaText = "Get Started Free",
  ctaHref = "/sign-up",
  dashboardLink,
}: MobileNavProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const isLoaded = !isPending;

  function close() { setOpen(false) }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Toggle menu" />
        }
      >
        <FontAwesomeIcon icon={open ? faXmark : faGrip} className="size-4" />
      </SheetTrigger>

      <SheetContent side="right" className="w-72 p-0">
        <SheetHeader className="px-6 pt-5">
          <SheetTitle className="text-left text-xl font-bold tracking-tight">
            Creonex
          </SheetTitle>
        </SheetHeader>

        <Separator className="mt-4" />

        <nav className="flex flex-col gap-1 px-3 py-4">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Separator />

        {isLoaded && !isSignedIn && (
          <div className="flex flex-col gap-2 px-6 py-5">
            <Link
              href="/sign-in"
              onClick={close}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Login
            </Link>
            <Link
              href={ctaHref}
              onClick={close}
              className={buttonVariants({ variant: "default", className: "w-full" })}
            >
              {ctaText}
            </Link>
          </div>
        )}

        {isLoaded && isSignedIn && dashboardLink && (
          <div className="px-6 py-5">
            <Link
              href={dashboardLink.href}
              onClick={close}
              className={buttonVariants({ variant: "default", className: "w-full" })}
            >
              {dashboardLink.label}
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
