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
import UploadImageDialog from "../components/dialogs/upload-image-dialog";
import useImages from "../hooks/use-images";

const Page = () => {
  const { imagesQuery } = useImages();
  const images = imagesQuery.data || [];
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false);

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
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <Image
                    src={image.secureUrl}
                    alt={image.originalName}
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <UploadImageDialog
        open={isUploadImageDialogOpen}
        onOpenChange={setIsUploadImageDialogOpen}
      />
    </>
  );
};

export default Page;
