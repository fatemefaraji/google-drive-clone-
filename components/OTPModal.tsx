"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define TypeScript interfaces
interface OtpModalProps {
  accountId: string;
  email: string;
  onClose?: () => void;
  className?: string;
}

const OtpModal: React.FC<OtpModalProps> = ({ accountId, email, onClose, className }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!password || password.length !== 6) {
        toast({
          description: <p className="body-2 text-white">Please enter a valid 6-digit OTP.</p>,
          className: "error-toast bg-red-600",
          duration: 5000,
        });
        return;
      }

      setIsLoading(true);
      try {
        const sessionId = await verifySecret({ accountId, password });
        if (sessionId) {
          toast({
            description: <p className="body-2 text-white">OTP verified successfully.</p>,
            className: "success-toast bg-green-600",
            duration: 3000,
          });
          router.push("/");
          handleClose();
        } else {
          throw new Error("Invalid OTP");
        }
      } catch (error: any) {
        toast({
          description: (
            <p className="body-2 text-white">
              Failed to verify OTP: {error.message || "Unknown error"}
            </p>
          ),
          className: "error-toast bg-red-600",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [accountId, password, router, toast, handleClose]
  );

  const handleResendOtp = useCallback(async () => {
    setIsResending(true);
    try {
      await sendEmailOTP({ email });
      toast({
        description: <p className="body-2 text-white">New OTP sent to {email}.</p>,
        className: "success-toast bg-green-600",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to resend OTP: {error.message || "Unknown error"}
          </p>
        ),
        className: "error-toast bg-red-600",
        duration: 5000,
      });
    } finally {
      setIsResending(false);
    }
  }, [email, toast]);

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent
        className={cn("shad-alert-dialog max-w-md bg-white dark:bg-gray-800", className)}
        aria-describedby="otp-dialog-description"
      >
        <AlertDialogHeader className="relative flex flex-col items-center">
          <AlertDialogTitle className="h2 text-center text-gray-900 dark:text-white">
            Enter Your OTP
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-0 top-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close OTP dialog"
            >
              <Image
                src="/assets/icons/close-dark.svg"
                alt=""
                width={20}
                height={20}
                className="fill-current"
              />
            </Button>
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-gray-500 dark:text-gray-400">
            We've sent a code to <span className="text-brand font-semibold">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-6">
          <InputOTP
            maxLength={6}
            value={password}
            onChange={setPassword}
            disabled={isLoading || isResending}
            aria-label="Enter 6-digit OTP"
          >
            <InputOTPGroup className="shad-otp justify-center gap-2">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="shad-otp-slot w-12 h-12 text-center text-lg border-gray-300 dark:border-gray-600 rounded-md"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <AlertDialogFooter className="flex flex-col gap-4">
          <AlertDialogAction
            onClick={handleSubmit}
            className="shad-submit-btn h-12 bg-brand hover:bg-brand-dark"
            type="button"
            disabled={isLoading || isResending || password.length !== 6}
            aria-label="Submit OTP"
          >
            <span>Submit</span>
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt=""
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </AlertDialogAction>
          <div className="subtitle-2 text-center text-gray-500 dark:text-gray-400">
            Didn't get a code?
            <Button
              type="button"
              variant="link"
              className="pl-1 text-brand hover:underline"
              onClick={handleResendOtp}
              disabled={isLoading || isResending}
              aria-label="Resend OTP"
            >
              Click to resend
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;