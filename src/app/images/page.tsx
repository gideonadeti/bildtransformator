"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TransformImageDialog from "../components/dialogs/transform-image-dialog";
import UploadImageDialog from "../components/dialogs/upload-image-dialog";
import ViewImageDialog from "../components/dialogs/view-image-dialog";
import useImages from "../hooks/use-images";
import type { Image as ImageType, TransformedImage } from "../types/general";

const Page = () => {
  const [selectedTransformedImage, setSelectedTransformedImage] =
    useState<TransformedImage | null>(null);
  const [isViewImageDialogOpen, setIsViewImageDialogOpen] = useState(false);
  const { imagesQuery } = useImages({
    onTransformationComplete: (transformedImage) => {
      setSelectedTransformedImage(transformedImage);
      setIsViewImageDialogOpen(true);
    },
  });
  const images = imagesQuery.data || [];
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  if (imagesQuery.isPending) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Images</h3>
          <Button
            variant="outline"
            onClick={() => setIsUploadImageDialogOpen(true)}
          >
            Upload Image
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id}>
              <CardHeader>
                <CardTitle>{image.originalName}</CardTitle>
                <CardDescription>{image.size}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <Image
                    src={image.secureUrl}
                    alt={image.originalName}
                    fill
                    className="object-contain"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedImage(image);
                    setIsTransformDialogOpen(true);
                  }}
                >
                  Transform
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <UploadImageDialog
        open={isUploadImageDialogOpen}
        onOpenChange={setIsUploadImageDialogOpen}
      />
      <TransformImageDialog
        open={isTransformDialogOpen}
        onOpenChange={(open) => {
          setIsTransformDialogOpen(open);
          if (!open) {
            setSelectedImage(null);
          }
        }}
        image={selectedImage}
      />
      <ViewImageDialog
        open={isViewImageDialogOpen}
        onOpenChange={(open) => {
          setIsViewImageDialogOpen(open);
          if (!open) {
            setSelectedTransformedImage(null);
          }
        }}
        transformedImage={selectedTransformedImage}
      />
    </>
  );
};

export default Page;
