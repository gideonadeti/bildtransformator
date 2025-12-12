"use client";

import { LogOut, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useRefreshAccessToken } from "@/app/components/auth-provider";
import DeleteAccountDialog from "@/app/components/delete-account-dialog";
import ThemeToggler from "@/app/components/theme-toggler";
import useAuth from "@/app/hooks/use-auth";
import useUser from "@/app/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user } = useUser();
  const { signOutMutation } = useAuth();
  const { isRefreshing } = useRefreshAccessToken();
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">B</span>
              </div>
              <span className="hidden text-lg font-semibold sm:inline">
                Bildtransformator
              </span>
            </Link>
          </div>

          {/* Authentication UI */}
          <div className="flex items-center gap-4">
            {isRefreshing ? (
              <div className="flex items-center gap-2">
                <div className="size-8 animate-pulse rounded-full bg-muted" />
                <span className="hidden sm:inline-block text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="size-4" />
                    <span className="hidden sm:inline-block">
                      {user.name.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOutMutation.mutate()}
                    disabled={signOutMutation.isPending}
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setIsDeleteAccountDialogOpen(true);
                    }}
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <ThemeToggler />
          </div>
        </div>
      </header>
      <DeleteAccountDialog
        open={isDeleteAccountDialogOpen}
        onOpenChange={setIsDeleteAccountDialogOpen}
      />
    </>
  );
};

export default Header;
