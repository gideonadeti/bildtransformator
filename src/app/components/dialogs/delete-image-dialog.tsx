"use client";

import type { Image as ImageType } from "@/app/types/general";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
      </DialogContent>
    </Dialog>
  );
};

export default DeleteImageDialog;
