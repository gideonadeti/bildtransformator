"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import useImages from "@/app/hooks/use-images";
import { transformImageFormSchema } from "@/app/libs/form-schemas/general-form-schemas";
import type {
  Image as ImageType,
  TransformImageFormValues,
} from "@/app/types/general";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomDialogContent from "../custom-dialog-content";
import CustomDialogFooter from "../custom-dialog-footer";

interface TransformImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ImageType | null;
}

const TransformImageDialog = ({
  open,
  onOpenChange,
  image,
}: TransformImageDialogProps) => {
  const { transformImageMutation } = useImages();

  const form = useForm<TransformImageFormValues>({
    resolver: zodResolver(transformImageFormSchema),
    // Keep values/registers even when fields unmount (accordion closed)
    shouldUnregister: false,
    defaultValues: {
      resize: undefined,
      crop: undefined,
      rotate: undefined,
      grayscale: undefined,
      tint: "",
      order: [],
    },
  });

  // Watch form values to auto-generate order
  const resize = form.watch("resize");
  const crop = form.watch("crop");
  const rotate = form.watch("rotate");
  const grayscale = form.watch("grayscale");
  const tint = form.watch("tint");

  // Auto-generate order based on enabled transformations
  const enabledTransforms = useMemo(() => {
    const transforms: Array<
      "resize" | "crop" | "rotate" | "grayscale" | "tint"
    > = [];

    const hasResize = resize && (resize.width != null || resize.height != null);
    if (hasResize) transforms.push("resize");

    const hasCrop =
      crop != null &&
      (crop.left != null ||
        crop.top != null ||
        crop.width != null ||
        crop.height != null);
    if (hasCrop) transforms.push("crop");

    const hasRotate =
      typeof rotate === "number" && Number.isFinite(rotate as number);
    if (hasRotate) transforms.push("rotate");

    const hasGrayscale = grayscale === true;
    if (hasGrayscale) transforms.push("grayscale");

    const hasTint = tint != null && tint.trim() !== "";
    if (hasTint) transforms.push("tint");

    return transforms;
  }, [resize, crop, rotate, grayscale, tint]);

  // Update order when enabled transforms change
  useEffect(() => {
    const currentOrder = form.getValues("order") || [];

    // Only update if the enabled transforms have changed
    const currentOrderSet = new Set(currentOrder);
    const enabledSet = new Set(enabledTransforms);

    const isEqual =
      currentOrderSet.size === enabledSet.size &&
      Array.from(currentOrderSet).every((x) => enabledSet.has(x)) &&
      Array.from(enabledSet).every((x) => currentOrderSet.has(x));

    if (!isEqual) {
      // Preserve order where possible, add new ones at the end
      const preserved = currentOrder.filter((t) =>
        enabledTransforms.includes(t)
      );
      const newOnes = enabledTransforms.filter(
        (t) => !currentOrder.includes(t)
      );
      form.setValue("order", [...preserved, ...newOnes], {
        shouldValidate: true,
      });
    }
  }, [enabledTransforms, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = (formValues: TransformImageFormValues) => {
    if (!image) return;

    // Clean up undefined values
    const cleanedData: TransformImageFormValues = {
      order: formValues.order,
    };

    if (
      formValues.resize &&
      (formValues.resize.width != null || formValues.resize.height != null)
    ) {
      cleanedData.resize = {
        width: formValues.resize.width,
        height: formValues.resize.height,
        fit: formValues.resize.fit,
      };
    }

    if (formValues.crop) {
      cleanedData.crop = formValues.crop;
    }

    if (formValues.rotate != null) {
      cleanedData.rotate = formValues.rotate;
    }

    if (formValues.grayscale === true) {
      cleanedData.grayscale = true;
    }

    if (formValues.tint != null && formValues.tint.trim() !== "") {
      cleanedData.tint = formValues.tint;
    }

    transformImageMutation.mutate({
      id: image.id,
      formValues: cleanedData,
      onOpenChange,
    });
  };

  const moveOrderItem = (index: number, direction: "up" | "down") => {
    const currentOrder = form.getValues("order");
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === currentOrder.length - 1)
    ) {
      return;
    }

    const newOrder = [...currentOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    form.setValue("order", newOrder, { shouldValidate: true });
  };

  const handleCropFieldChange = (
    field: "left" | "top" | "width" | "height",
    value: string
  ) => {
    const numValue = value === "" ? undefined : Number(value);
    const currentCrop = form.getValues("crop");

    if (numValue !== undefined) {
      // Initialize crop object if it doesn't exist, or update the field
      form.setValue(
        "crop",
        {
          left: field === "left" ? numValue : currentCrop?.left ?? 0,
          top: field === "top" ? numValue : currentCrop?.top ?? 0,
          width: field === "width" ? numValue : currentCrop?.width ?? 1,
          height: field === "height" ? numValue : currentCrop?.height ?? 1,
        },
        { shouldValidate: true }
      );
    } else {
      // If clearing a field, check if all fields are now empty
      const otherFields = {
        left: field === "left" ? undefined : currentCrop?.left,
        top: field === "top" ? undefined : currentCrop?.top,
        width: field === "width" ? undefined : currentCrop?.width,
        height: field === "height" ? undefined : currentCrop?.height,
      };

      const hasAnyValue =
        (otherFields.left != null && otherFields.left !== undefined) ||
        (otherFields.top != null && otherFields.top !== undefined) ||
        (otherFields.width != null && otherFields.width !== undefined) ||
        (otherFields.height != null && otherFields.height !== undefined);

      if (!hasAnyValue) {
        form.setValue("crop", undefined, { shouldValidate: true });
      }
      // If other fields have values, keep the crop object but validation will catch incomplete crop
    }
  };

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Transform Image</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="space-y-6 flex flex-col flex-1 min-h-0">
              {/* Image Preview */}
              <div className="shrink-0">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <Image
                    src={image.secureUrl}
                    alt={image.originalName}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 min-h-0 pr-4 overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  {/* Resize Section */}
                  <AccordionItem value="resize">
                    <AccordionTrigger>Resize</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-2">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="resize.width"
                          render={() => (
                            <FormItem>
                              <FormLabel>Width</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Width"
                                  value={form.watch("resize.width") ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const next =
                                      value === "" ? undefined : Number(value);
                                    const current =
                                      form.getValues("resize") || {};
                                    const updated = {
                                      ...current,
                                      width: next,
                                    };
                                    const shouldClear =
                                      updated.width == null &&
                                      updated.height == null &&
                                      updated.fit == null;
                                    form.setValue(
                                      "resize",
                                      shouldClear ? undefined : updated,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="resize.height"
                          render={() => (
                            <FormItem>
                              <FormLabel>Height</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Height"
                                  value={form.watch("resize.height") ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const next =
                                      value === "" ? undefined : Number(value);
                                    const current =
                                      form.getValues("resize") || {};
                                    const updated = {
                                      ...current,
                                      height: next,
                                    };
                                    const shouldClear =
                                      updated.width == null &&
                                      updated.height == null &&
                                      updated.fit == null;
                                    form.setValue(
                                      "resize",
                                      shouldClear ? undefined : updated,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      }
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="resize.fit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fit Mode</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select fit mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="contain">
                                    Contain
                                  </SelectItem>
                                  <SelectItem value="cover">Cover</SelectItem>
                                  <SelectItem value="fill">Fill</SelectItem>
                                  <SelectItem value="inside">Inside</SelectItem>
                                  <SelectItem value="outside">
                                    Outside
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Crop Section */}
                  <AccordionItem value="crop">
                    <AccordionTrigger>Crop</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-2">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="crop.left"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Left</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Left"
                                  {...field}
                                  onChange={(e) => {
                                    handleCropFieldChange(
                                      "left",
                                      e.target.value
                                    );
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    );
                                  }}
                                  value={form.watch("crop")?.left ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="crop.top"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Top</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Top"
                                  {...field}
                                  onChange={(e) => {
                                    handleCropFieldChange(
                                      "top",
                                      e.target.value
                                    );
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    );
                                  }}
                                  value={form.watch("crop")?.top ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="crop.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Crop Width</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Width"
                                  {...field}
                                  onChange={(e) => {
                                    handleCropFieldChange(
                                      "width",
                                      e.target.value
                                    );
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    );
                                  }}
                                  value={form.watch("crop")?.width ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="crop.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Crop Height</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Height"
                                  {...field}
                                  onChange={(e) => {
                                    handleCropFieldChange(
                                      "height",
                                      e.target.value
                                    );
                                    field.onChange(
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value)
                                    );
                                  }}
                                  value={form.watch("crop")?.height ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Rotate Section */}
                  <AccordionItem value="rotate">
                    <AccordionTrigger>Rotate</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-2">
                      <FormField
                        control={form.control}
                        name="rotate"
                        render={() => (
                          <FormItem>
                            <FormLabel>Degrees (-360 to 360)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Degrees"
                                min={-360}
                                max={360}
                                value={form.watch("rotate") ?? ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const next =
                                    value === "" ? undefined : Number(value);
                                  form.setValue("rotate", next, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Grayscale Section */}
                  <AccordionItem value="grayscale">
                    <AccordionTrigger>Grayscale</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-2">
                      <FormField
                        control={form.control}
                        name="grayscale"
                        render={() => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border px-3 py-2">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">
                                Convert to grayscale
                              </FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Toggle to apply a grayscale filter to the image.
                              </p>
                            </div>
                            <FormControl>
                              {/*
                                Treat only boolean true as "on".
                                When toggling off, set the field to undefined so it drops out
                                of enabledTransforms and is not sent to the backend.
                              */}
                              {/*
                                We derive UI state from form.watch("grayscale") to ensure
                                the switch always reflects the latest form value, even
                                after closing/reopening the accordion.
                              */}
                              {(() => {
                                const isOn = form.watch("grayscale") === true;

                                return (
                                  <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isOn}
                                    onClick={() => {
                                      form.setValue(
                                        "grayscale",
                                        isOn ? undefined : true,
                                        {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        }
                                      );
                                    }}
                                    className={`inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                                      isOn
                                        ? "bg-primary border-primary"
                                        : "bg-input border-border"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-5 w-5 rounded-full bg-background shadow transition-transform ${
                                        isOn ? "translate-x-5" : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                );
                              })()}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Tint Section */}
                  <AccordionItem value="tint">
                    <AccordionTrigger>Tint</AccordionTrigger>
                    <AccordionContent className="space-y-3 px-2">
                      <FormField
                        control={form.control}
                        name="tint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="color"
                                  className="h-10 w-14 p-1 cursor-pointer"
                                  value={
                                    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
                                      field.value ?? ""
                                    )
                                      ? field.value ?? "#ffffff"
                                      : "#ffffff"
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);
                                  }}
                                />
                                <Input
                                  placeholder="e.g., red, #ffcc00, rgb(255, 204, 0)"
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Order Section */}
                {enabledTransforms.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h3 className="text-sm font-medium">
                      Transformation Order
                    </h3>
                    <FormField
                      control={form.control}
                      name="order"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-2">
                              {(form.watch("order") || []).map(
                                (transform, index) => (
                                  <div
                                    key={`${transform}-${index.toString()}`}
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <span className="text-sm capitalize">
                                      {transform}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                          moveOrderItem(index, "up")
                                        }
                                        disabled={index === 0}
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                          moveOrderItem(index, "down")
                                        }
                                        disabled={
                                          index ===
                                          (form.watch("order") || []).length - 1
                                        }
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
        <div className="shrink-0">
          <CustomDialogFooter
            normalText="Transform"
            pendingText="Transforming..."
            disabled={!form.formState.isDirty || enabledTransforms.length === 0}
            isPending={transformImageMutation.isPending}
            handleCancel={() => onOpenChange(false)}
            handleSubmit={form.handleSubmit(onSubmit)}
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
};

export default TransformImageDialog;
