import { z } from "zod";

export const uploadImageFormSchema = z.object({
  image: z
    .file("Image is required")
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "Image must be less than 10MB",
    }),
});

const fitEnum = z.enum(["contain", "cover", "fill", "inside", "outside"]);

const resizeOptionsSchema = z
  .object({
    width: z.coerce.number<number>().int().positive().optional(),
    height: z.coerce.number<number>().int().positive().optional(),
    fit: fitEnum.optional(),
  })
  .refine(
    (data) => {
      // If fit is provided, either width or height must be provided
      if (data.fit != null && !data.width && !data.height) {
        return false;
      }

      return true;
    },
    {
      message:
        "If 'fit' is provided, either 'width' or 'height' must also be provided.",
      path: ["fit"],
    }
  )
  .optional();

const transformationTypeEnum = z.enum([
  "resize",
  "rotate",
  "grayscale",
  "tint",
]);

export const transformImageFormSchema = z
  .object({
    resize: resizeOptionsSchema,
    rotate: z.coerce.number<number>().int().min(-360).max(360).optional(),
    grayscale: z.boolean().optional(),
    tint: z.string().optional(),
    order: z.array(transformationTypeEnum).min(1),
  })
  .refine(
    (data) => {
      // At least one transformation must be enabled
      const hasResize =
        data.resize &&
        (data.resize.width != null || data.resize.height != null);

      const hasRotate = data.rotate != null;
      const hasGrayscale = data.grayscale != null;
      const hasTint = data.tint != null && data.tint.trim() !== "";

      return hasResize || hasRotate || hasGrayscale || hasTint;
    },
    {
      message: "At least one valid transformation option must be provided.",
    }
  )
  .refine(
    (data) => {
      // Order must contain all and only enabled transformations
      const activeTransforms: Array<
        "resize" | "rotate" | "grayscale" | "tint"
      > = [];

      const hasResize =
        data.resize &&
        (data.resize.width != null || data.resize.height != null);

      if (hasResize) activeTransforms.push("resize");
      if (data.rotate != null) activeTransforms.push("rotate");
      if (data.grayscale != null) activeTransforms.push("grayscale");
      if (data.tint != null && data.tint.trim() !== "")
        activeTransforms.push("tint");

      // Check that order contains all active transforms
      const missingSteps = activeTransforms.filter(
        (step) => !data.order.includes(step)
      );

      if (missingSteps.length > 0) {
        return false;
      }

      // Check that order only contains active transforms
      const invalidSteps = data.order.filter(
        (step) => !activeTransforms.includes(step)
      );

      if (invalidSteps.length > 0) {
        return false;
      }

      return true;
    },
    {
      message: "Order must contain all and only the enabled transformations.",
      path: ["order"],
    }
  );
