import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
  SignInFormValues,
  SignUpFormValues,
  SignUpInResponse,
} from "../types/auth";
import {
  deleteAccount,
  forgotPassword,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../utils/auth-query-functions";
import { clearRefreshTokenCookie } from "../utils/cookie-utils";
import useAccessToken from "./use-access-token";
import useUser from "./use-user";

const useAuth = () => {
  const router = useRouter();
  const { setAccessToken, clearAccessToken } = useAccessToken();
  const { setUser, clearUser } = useUser();

  const signUpMutation = useMutation<
    SignUpInResponse,
    AxiosError<{ message: string }>,
    {
      signUpFormValues: SignUpFormValues;
    }
  >({
    mutationFn: async ({ signUpFormValues }) => {
      return signUp(signUpFormValues);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to sign up";

      toast.error(message, { id: "sign-up-error" });
    },
    onSuccess: ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setUser(user);

      toast.success("Signed up successfully", { id: "sign-up-success" });
      router.push("/");
    },
  });

  const signInMutation = useMutation<
    SignUpInResponse,
    AxiosError<{ message: string }>,
    { signInFormValues: SignInFormValues }
  >({
    mutationFn: async ({ signInFormValues }) => {
      return signIn(signInFormValues);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to sign in";

      toast.error(message, { id: "sign-in-error" });
    },
    onSuccess: ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setUser(user);

      toast.success("Signed in successfully", { id: "sign-in-success" });
      router.push("/");
    },
  });

  const signOutMutation = useMutation<
    void,
    AxiosError<{ message: string }>,
    void
  >({
    mutationFn: async () => {
      return signOut();
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to sign out";

      toast.error(message, { id: "sign-out-error" });
    },
    onSuccess: async () => {
      clearAccessToken();
      clearUser();
      await clearRefreshTokenCookie();

      toast.success("Signed out successfully", { id: "sign-out-success" });
      router.push("/");
    },
  });

  const deleteAccountMutation = useMutation<
    void,
    AxiosError<{ message: string }>,
    { onOpenChange: (open: boolean) => void }
  >({
    mutationFn: async () => {
      return deleteAccount();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete account";

      toast.error(message, { id: "delete-account-error" });
    },
    onSuccess: async (_, { onOpenChange }) => {
      onOpenChange(false);
      clearAccessToken();
      clearUser();
      await clearRefreshTokenCookie();

      toast.success("Account deleted successfully", {
        id: "delete-account-success",
      });

      router.push("/");
    },
  });

  const forgotPasswordMutation = useMutation<
    void,
    AxiosError<{ message: string }>,
    { forgotPasswordFormValues: ForgotPasswordFormValues }
  >({
    mutationFn: async ({ forgotPasswordFormValues }) => {
      return forgotPassword(forgotPasswordFormValues);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to send password reset email";

      toast.error(message, { id: "forgot-password-error" });
    },
    onSuccess: () => {
      toast.success(
        "If an account exists with that email, a password reset link has been sent",
        { id: "forgot-password-success" }
      );
      router.push("/auth/sign-in");
    },
  });

  const resetPasswordMutation = useMutation<
    void,
    AxiosError<{ message: string }>,
    { resetPasswordFormValues: ResetPasswordFormValues }
  >({
    mutationFn: async ({ resetPasswordFormValues }) => {
      return resetPassword(resetPasswordFormValues);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to reset password";

      toast.error(message, { id: "reset-password-error" });
    },
    onSuccess: () => {
      toast.success("Password reset successfully", {
        id: "reset-password-success",
      });
      router.push("/auth/sign-in");
    },
  });

  return {
    signUpMutation,
    signInMutation,
    signOutMutation,
    deleteAccountMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
  };
};

export default useAuth;
