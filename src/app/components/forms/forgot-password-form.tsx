"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import useAuth from "@/app/hooks/use-auth";
import { forgotPasswordFormSchema } from "@/app/libs/form-schemas/auth-form-schemas";
import type { ForgotPasswordFormValues } from "@/app/types/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SubmitButton from "./submit-button";

const ForgotPasswordForm = () => {
  const { forgotPasswordMutation } = useAuth();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (forgotPasswordFormValues: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate({ forgotPasswordFormValues });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="johndoe@gmail.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton
          normalText="Send Reset Link"
          pendingText="Sending..."
          isPending={forgotPasswordMutation.isPending}
        />
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
