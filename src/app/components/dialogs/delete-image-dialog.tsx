"use client";

import useImages from "@/app/hooks/use-images";
import type { Image as ImageType } from "@/app/types/general";
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
  image: ImageType | null;
  onOpenChange: (open: boolean) => void;
}

const DeleteImageDialog = ({
  open,
  image,
  onOpenChange,
}: DeleteImageDialogProps) => {
  const { deleteImageMutation } = useImages();

  const handleConfirm = () => {
    if (!image) return;

    deleteImageMutation.mutate({
      id: image.id,
      onOpenChange,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent>
        <DialogHeader>
          <DialogTitle>Delete Image</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {image?.originalName || "this image"}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <CustomDialogFooter
          normalText="Delete"
          pendingText="Deleting..."
          isPending={deleteImageMutation.isPending}
          variant={{ variant: "destructive" }}
          handleCancel={handleCancel}
          handleSubmit={handleConfirm}
        />
      </CustomDialogContent>
    </Dialog>
  );
};

export default DeleteImageDialog;
