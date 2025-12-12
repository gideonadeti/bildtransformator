"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useRefreshAccessToken } from "@/app/components/auth-provider";
import SignUpForm from "@/app/components/forms/sign-up-form";
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

const Page = () => {
  const router = useRouter();
  const { user } = useUser();
  const { accessToken } = useAccessToken();
  const { isRefreshing } = useRefreshAccessToken();

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignUpForm />
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            Already have an account?{" "}
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

export default Page;
