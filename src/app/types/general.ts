import type { z } from "zod";

import type {
  transformImageFormSchema,
  uploadImageFormSchema,
} from "../libs/form-schemas/general-form-schemas";

export type UploadImageFormValues = z.infer<typeof uploadImageFormSchema>;
export type TransformImageFormValues = z.infer<typeof transformImageFormSchema>;

export interface Image {
  id: string;
  userId: string;
  originalName: string;
  size: number;
  secureUrl: string;
  format: string;
  downloadsCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  transformedImages: TransformedImage[];
  likes: Like[];
}

export interface TransformedImage {
  id: string;
  originalImageId: string;
  size: number;
  secureUrl: string;
  parentId: string | null;
  downloadsCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  transformation: TransformImageFormValues;
  originalImage: Image;
  transformedTransformedImages: TransformedImage[];
  likes: Like[];
}

export interface Like {
  id: string;
  userId: string;
  imageId: string | null;
  transformedImageId: string | null;
  createdAt: string;
  updatedAt: string;
}
