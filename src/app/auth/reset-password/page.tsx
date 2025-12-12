"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useRefreshAccessToken } from "@/app/components/auth-provider";

import ResetPasswordForm from "@/app/components/forms/reset-password-form";
import useAccessToken from "@/app/hooks/use-access-token";
import useUser from "@/app/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { accessToken } = useAccessToken();
  const { isRefreshing } = useRefreshAccessToken();

  const token = searchParams.get("token");

  useEffect(() => {
    // Wait for token refresh to complete before checking auth state
    if (!isRefreshing && (user || accessToken)) {
      router.push("/");
    }
  }, [user, accessToken, isRefreshing, router]);

  // Show loading state while checking auth
  if (isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render the form if user is authenticated (redirect will happen)
  if (user || accessToken) {
    return null;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Reset Password
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-destructive text-center">
                Invalid or missing reset token. Please request a new password
                reset link.
              </p>
            </CardContent>

            <CardFooter className="justify-center text-sm text-muted-foreground">
              <Link
                href="/auth/forgot-password"
                className="text-primary font-medium hover:underline"
              >
                Request new reset link
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Reset Password
            </CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>

          <CardContent>
            <ResetPasswordForm token={token} />
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/sign-in"
              className="text-primary font-medium hover:underline ml-1"
            >
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div>Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default Page;
