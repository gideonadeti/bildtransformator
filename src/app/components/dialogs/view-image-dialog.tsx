"use client";

import Image from "next/image";

import type { TransformedImage } from "@/app/types/general";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transformedImage: TransformedImage | null;
}

const ViewImageDialog = ({
  open,
  onOpenChange,
  transformedImage,
}: ViewImageDialogProps) => {
  if (!transformedImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Transformed Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
            <Image
              src={transformedImage.secureUrl}
              alt="Transformed image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewImageDialog;

