import type { z } from "zod";

import type { uploadImageFormSchema } from "../libs/form-schemas/general-form-schemas";

export type UploadImageFormValues = z.infer<typeof uploadImageFormSchema>;

export interface Image {
  id: string;
  originalName: string;
  size: number;
  secureUrl: string;
  createdAt: string;
  updatedAt: string;
}
