"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import useAuth from "@/app/hooks/use-auth";
import { resetPasswordFormSchema } from "@/app/libs/form-schemas/auth-form-schemas";
import type { ResetPasswordFormValues } from "@/app/types/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PasswordInput from "./password-input";
import SubmitButton from "./submit-button";

interface ResetPasswordFormProps {
  token: string;
}

const resetPasswordFormWithConfirmSchema = resetPasswordFormSchema
  .extend({
    confirmPassword: z.string().trim().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormWithConfirmValues = z.infer<
  typeof resetPasswordFormWithConfirmSchema
>;

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const { resetPasswordMutation } = useAuth();
  const form = useForm<ResetPasswordFormWithConfirmValues>({
    resolver: zodResolver(resetPasswordFormWithConfirmSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordFormWithConfirmValues) => {
    const resetPasswordFormValues: ResetPasswordFormValues = {
      token: values.token,
      password: values.password,
    };
    resetPasswordMutation.mutate({ resetPasswordFormValues });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  {...field}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  {...field}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton
          normalText="Reset Password"
          pendingText="Resetting..."
          isPending={resetPasswordMutation.isPending}
        />
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
