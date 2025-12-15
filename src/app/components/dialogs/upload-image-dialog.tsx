import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import useImages from "@/app/hooks/use-images";
import { uploadImageFormSchema } from "@/app/libs/form-schemas/general-form-schemas";
import type { UploadImageFormValues } from "@/app/types/general";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import CustomDialogFooter from "../custom-dialog-footer";

interface UploadImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadImageDialog = ({ open, onOpenChange }: UploadImageDialogProps) => {
  const { uploadImageMutation } = useImages();
  const form = useForm<UploadImageFormValues>({
    resolver: zodResolver(uploadImageFormSchema),
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      form.reset();

      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      setImageUrl(null);
    }
  }, [open, form.reset, imageUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      if (acceptedFiles.length > 1) {
        toast.error("You can only upload one image at a time", {
          id: "upload-images-error",
        });

        return;
      }

      if (acceptedFiles[0].size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB", {
          id: "upload-image-error",
        });

        return;
      }

      setImageUrl(URL.createObjectURL(acceptedFiles[0]));

      form.setValue("image", acceptedFiles[0], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [form.setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
  });

  const onSubmit = (formValues: UploadImageFormValues) => {
    if (!formValues.image) {
      toast.error("Image is required", {
        id: "upload-image-error",
      });

      return;
    }

    uploadImageMutation.mutate({ image: formValues.image, onOpenChange });
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormControl>
                    {!imageUrl && (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "border border-dashed rounded-lg p-6 text-center cursor-pointer",
                          isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground"
                        )}
                      >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                          <p>Drop the files here ...</p>
                        ) : (
                          <>
                            <p className="font-medium">
                              Drag & drop the image here
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Or click to browse image
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                              Image should be less than 10 MB.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </FormControl>
                  {imageUrl && (
                    <div className="mt-4 relative aspect-video rounded-lg overflow-hidden border border-border">
                      <Image
                        src={imageUrl}
                        alt="Uploaded Image"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={() => handleRemoveImage()}
                        disabled={uploadImageMutation.isPending}
                      >
                        <X />
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <CustomDialogFooter
          normalText="Upload"
          pendingText="Uploading..."
          disabled={!form.formState.isDirty}
          isPending={uploadImageMutation.isPending}
          handleCancel={() => onOpenChange(false)}
          handleSubmit={form.handleSubmit(onSubmit)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageDialog;
