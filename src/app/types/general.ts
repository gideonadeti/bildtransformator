import type { z } from "zod";

import type {
  transformImageFormSchema,
  uploadImageFormSchema,
} from "../libs/form-schemas/general-form-schemas";

export type UploadImageFormValues = z.infer<typeof uploadImageFormSchema>;
export type TransformImageFormValues = z.infer<typeof transformImageFormSchema>;

export interface Image {
  id: string;
  originalName: string;
  size: number;
  secureUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransformedImage {
  id: string;
  originalImageId: string;
  size: number;
  secureUrl: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;

  transformation: TransformImageFormValues;
}
