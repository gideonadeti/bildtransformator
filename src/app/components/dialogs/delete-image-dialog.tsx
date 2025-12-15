"use client";

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
  onConfirm?: () => void;
  isPending?: boolean;
}

const DeleteImageDialog = ({
  open,
  image,
  onOpenChange,
  onConfirm = () => {},
  isPending = false,
}: DeleteImageDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
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
