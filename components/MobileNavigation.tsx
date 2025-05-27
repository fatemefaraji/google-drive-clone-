"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";

// Define TypeScript interfaces
interface NavItem {
  url: string;
  name: string;
  icon: string;
}

interface MobileNavigationProps {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  $id: ownerId,
  accountId,
  fullName,
  avatar,
  email,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      toast({
        description: <p className="body-2 text-white">Signed out successfully.</p>,
        className: "success-toast bg-green-600",
        duration: 3000,
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to sign out: {error.message || "Unknown error"}
          </p>
        ),
        className: "error-toast bg-red-600",
        duration: 5000,
      });
    } finally {
      setIsSigningOut(false);
    }
  }, [toast]);

  return (
    <header
      className={cn(
        "mobile-header flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md",
        className
      )}
      aria-label="Mobile navigation header"
    >
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="Application logo"
        width={120}
        height={52}
        className="h-auto w-auto"
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open mobile navigation menu"
          >
            <Image
              src="/assets/icons/menu.svg"
              alt=""
              width={30}
              height={30}
              className="fill-current"
            />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="shad-sheet h-screen px-4 bg-white dark:bg-gray-800"
          side="right"
          aria-describedby="mobile-nav-title"
        >
          <SheetTitle id="mobile-nav-title" className="sr-only">
            Mobile Navigation
          </SheetTitle>
          <div className="header-user flex items-center gap-3">
            <Image
              src={avatar || "/assets/icons/default-avatar.svg"}
              alt={`${fullName}'s avatar`}
              width={44}
              height={44}
              className="header-user-avatar rounded-full"
            />
            <div className="flex flex-col sm:hidden lg:block">
              <p className="subtitle-2 capitalize font-semibold text-gray-900 dark:text-white">
                {fullName || "Unknown User"}
              </p>
              <p className="caption text-gray-500 dark:text-gray-400">{email || "No email"}</p>
            </div>
          </div>
          <Separator className="my-4 bg-gray-200 dark:bg-gray-600" />
          <nav className="mobile-nav flex-1">
            <ul className="mobile-nav-list space-y-2">
              {navItems.map(({ url, name, icon }: NavItem) => (
                <li
                  key={name}
                  className={cn(
                    "mobile-nav-item flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                    pathname === url && "shad-active bg-brand/10"
                  )}
                >
                  <Link href={url} className="flex items-center gap-3 w-full">
                    <Image
                      src={icon}
                      alt=""
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon fill-current",
                        pathname === url && "nav-icon-active text-brand"
                      )}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Separator className="my-5 bg-gray-200 dark:bg-gray-600" />
          <div className="flex flex-col gap-4 pb-5">
            <FileUploader ownerId={ownerId} accountId={accountId} className="w-full" />
            <Button
              onClick={handleSignOut}
              className="mobile-sign-out-button flex items-center gap-2 bg-brand hover:bg-brand-dark"
              disabled={isSigningOut}
              aria-label="Sign out"
            >
              <Image
                src="/assets/icons/logout.svg"
                alt=""
                width={24}
                height={24}
                className="fill-current"
              />
              <span>Sign Out</span>
              {isSigningOut && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="ml-2 animate-spin"
                />
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;