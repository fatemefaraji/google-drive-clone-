"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";

// Define TypeScript interfaces
type FormType = "sign-in" | "sign-up";

interface UserResponse {
  accountId: string;
}

// Enhanced Zod schema with custom error messages
const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .trim(),
    fullName:
      formType === "sign-up"
        ? z
            .string()
            .min(2, { message: "Full name must be at least 2 characters" })
            .max(50, { message: "Full name cannot exceed 50 characters" })
            .trim()
        : z.string().optional(),
  });
};

interface AuthFormProps {
  type: FormType;
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const user: UserResponse =
          type === "sign-up"
            ? await createAccount({
                fullName: values.fullName || "",
                email: values.email,
              })
            : await signInUser({ email: values.email });

        setAccountId(user.accountId);
      } catch (error: any) {
        setErrorMessage(
          error.message || `Failed to ${type === "sign-up" ? "create account" : "sign in"}. Please try again.`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  const handleOtpModalClose = useCallback(() => {
    setAccountId(null);
    form.reset();
  }, [form]);

  return (
    <div className="auth-container max-w-md mx-auto p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="auth-form space-y-6"
          aria-labelledby="auth-form-title"
        >
          <h1 id="auth-form-title" className="form-title text-2xl font-bold text-center text-light-100">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        disabled={isLoading}
                        aria-describedby="fullName-error"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message text-red-500" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="shad-input"
                      disabled={isLoading}
                      aria-describedby="email-error"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message text-red-500" />
              </FormItem>
            )}
          />
          {errorMessage && (
            <p id="form-error" className="error-message text-red-500 text-sm text-center">
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            className="form-submit-button w-full bg-brand hover:bg-brand-dark"
            disabled={isLoading}
            aria-label={type === "sign-in" ? "Sign in to account" : "Create account"}
          >
            <span>{type === "sign-in" ? "Sign In" : "Sign Up"}</span>
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="Loading"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
          <div className="body-2 flex justify-center items-center text-sm">
            <p className="text-light-100">
              {type === "sign-in" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-2 font-medium text-brand hover:underline"
              aria-label={type === "sign-in" ? "Go to sign up page" : "Go to sign in page"}
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>
      {accountId && (
        <OtpModal
          email={form.getValues("email")}
          accountId={accountId}
          onClose={handleOtpModalClose}
        />
      )}
    </div>
  );
};

export default AuthForm;