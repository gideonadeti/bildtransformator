import type { z } from "zod";

import type {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  signInFormSchema,
  signUpFormSchema,
} from "../libs/form-schemas/auth-form-schemas";

export interface SignUpInResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserStats {
  images: {
    private: number;
    public: number;
  };
  transformations: {
    private: number;
    public: number;
  };
  downloads: {
    images: number;
    transformations: number;
  };
  likes: {
    images: number;
    transformations: number;
  };
  storage: {
    images: number; // in bytes
    transformations: number; // in bytes
  };
}

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type SignInFormValues = z.infer<typeof signInFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
