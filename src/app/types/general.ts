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

export interface TransformedImage {
  id: string;
  originalImageId: string;
  size: number;
  secureUrl: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;

  transformation: Transformation;
}

export interface Transformation {
  order: Array<"resize" | "crop" | "rotate" | "grayscale" | "tint">;
  rotate?: number;
  grayscale?: boolean;
  tint?: string;

  crop?: CropOptions;
  resize?: ResizeOptions;
}

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "fill" | "inside" | "outside";
}
