"use client";

import { useRefreshAccessToken } from "@/app/components/auth-provider";
import Dashboard from "@/app/components/dashboard";
import LandingPage from "@/app/components/landing-page";
import useAccessToken from "@/app/hooks/use-access-token";
import useUser from "@/app/hooks/use-user";

const Page = () => {
  const { user } = useUser();
  const { accessToken } = useAccessToken();
  const { isRefreshing } = useRefreshAccessToken();

  // Show loading state while checking auth
  if (isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div>Loading...</div>
      </div>
    );
  }

  // If authenticated, show dashboard
  if (user || accessToken) {
    return <Dashboard />;
  }

  // If not authenticated, show landing page
  return <LandingPage />;
};

export default Page;
