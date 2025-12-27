"use client";

import useImages from "@/app/hooks/use-images";
import useTransformedImage from "@/app/hooks/use-transformed-image";
import type { Image, TransformedImage } from "@/app/types/general";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomDialogContent from "../custom-dialog-content";
import CustomDialogFooter from "../custom-dialog-footer";

interface DeleteImageDialogProps {
  open: boolean;
  image: Image | TransformedImage | null;
  onOpenChange: (open: boolean) => void;
}

const DeleteImageDialog = ({
  open,
  image,
  onOpenChange,
}: DeleteImageDialogProps) => {
  const { deleteImageMutation } = useImages();
  const isTransformedImage = image && "originalImageId" in image;
  const { deleteTransformedImageMutation } = useTransformedImage(
    isTransformedImage ? image.id : ""
  );

  const isPending =
    deleteImageMutation.isPending || deleteTransformedImageMutation.isPending;

  const handleConfirm = () => {
    if (!image) return;

    if (isTransformedImage) {
      deleteTransformedImageMutation.mutate({
        id: image.id,
        onOpenChange,
      });
    } else {
      deleteImageMutation.mutate({
        id: image.id,
        onOpenChange,
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent>
        <DialogHeader>
          <DialogTitle>
            {isTransformedImage
              ? image.parentId
                ? "Delete Transformed Transformed Image"
                : "Delete Transformed Image"
              : "Delete Image"}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {isTransformedImage
              ? image.parentId
                ? "this transformed transformed image"
                : "this transformed image"
              : image?.originalName}
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <CustomDialogFooter
          normalText="Delete"
          pendingText="Deleting..."
          isPending={isPending}
          variant={{ variant: "destructive" }}
          handleCancel={handleCancel}
          handleSubmit={handleConfirm}
        />
      </CustomDialogContent>
    </Dialog>
  );
};

export default DeleteImageDialog;
