"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";
import { signOutUser } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface HeaderProps {
  userId: string;
  accountId: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ userId, accountId, className }) => {
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      toast({
        description: <p className="body-2 text-white">Signed out successfully.</p>,
        className: "success-toast bg-green-600",
        duration: 3000,
      });
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
        "header flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md",
        className
      )}
      aria-label="Main navigation header"
    >
      <Search />
      <div className="header-wrapper flex items-center gap-4">
        <FileUploader
          ownerId={userId}
          accountId={accountId}
          className="flex-shrink-0"
        />
        <form action={handleSignOut}>
          <Button
            type="submit"
            className="sign-out-button flex items-center gap-2 bg-brand hover:bg-brand-dark"
            disabled={isSigningOut}
            aria-label="Sign out"
          >
            <Image
              src="/assets/icons/logout.svg"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="hidden sm:inline">Sign Out</span>
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
        </form>
      </div>
    </header>
  );
};

export default Header;