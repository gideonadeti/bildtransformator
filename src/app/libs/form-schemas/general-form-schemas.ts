import { z } from "zod";

export const uploadImageFormSchema = z.object({
  image: z
    .file("Image is required")
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "Image must be less than 10MB",
    }),
});
