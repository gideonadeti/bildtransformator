"use client";

import { format } from "date-fns";
import { ArrowLeft, Download, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import DeleteImageDialog from "@/app/components/dialogs/delete-image-dialog";
import TransformImageDialog from "@/app/components/dialogs/transform-image-dialog";
import useImages from "@/app/hooks/use-images";
import { formatBytes } from "@/app/utils/format";
import { downloadImage } from "@/app/utils/image-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const params = useParams();
  const imageId = params?.imageId as string;
  const { imagesQuery } = useImages();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  const images = imagesQuery.data || [];
  const isLoading = imagesQuery.isPending;

  const image = useMemo(() => {
    return images.find((img) => img.id === imageId) || null;
  }, [images, imageId]);

  const handleDelete = () => {
    // Placeholder handler
    console.log("Delete image:", imageId);
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      await downloadImage(image.secureUrl, image.originalName);
      toast.success("Download started", {
        description: image.originalName,
        id: `download-${image.id}`,
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image", {
        description: "Please try again later",
        id: `download-error-${image.id}`,
      });
    }
  };

  const handleTransform = () => {
    setIsTransformDialogOpen(true);
  };

  const transformedCount = image?.transformedImages?.length || 0;
  const formatDisplay = image?.format?.toUpperCase() || "N/A";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <Skeleton className="h-9 w-24" />

          {/* Image skeleton */}
          <Skeleton className="aspect-video w-full rounded-lg" />

          {/* Info skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Actions skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link href="/images">
              <ArrowLeft className="mr-2 size-4" />
              Back to Images
            </Link>
          </Button>
          <div className="py-12 text-center">
            <h1 className="text-2xl font-bold mb-2">Image Not Found</h1>
            <p className="text-muted-foreground">
              The image you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Back button */}
          <Button variant="outline" asChild>
            <Link href="/images">
              <ArrowLeft className="mr-2 size-4" />
              Back to Images
            </Link>
          </Button>

          {/* Main image */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
            <Image
              src={image.secureUrl}
              alt={image.originalName}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Image information */}
          <Card>
            <CardHeader>
              <CardTitle>{image.originalName}</CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    <span className="font-medium">Size:</span>{" "}
                    {formatBytes(image.size)}
                  </span>
                  <span>
                    <span className="font-medium">Format:</span> {formatDisplay}
                  </span>
                  <span>
                    <span className="font-medium">Transformed:</span>{" "}
                    {transformedCount} image{transformedCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    <span className="font-medium">Uploaded on:</span>{" "}
                    {format(new Date(image.createdAt), "PPp")}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={handleTransform}>
              <Wand2 className="mr-2 size-4" />
              Transform
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 size-4" />
              Download
            </Button>
          </div>

          {/* Transformed images section */}
          {transformedCount > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Transformed Images ({transformedCount})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {image.transformedImages.map((transformedImage) => (
                  <Card key={transformedImage.id}>
                    <CardContent className="p-4">
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-border mb-3">
                        <Image
                          src={transformedImage.secureUrl}
                          alt={`Transformed ${image.originalName}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          {formatBytes(transformedImage.size)}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {format(new Date(transformedImage.createdAt), "PPp")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteImageDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        image={image}
        onConfirm={handleDelete}
      />

      {/* Transform dialog */}
      <TransformImageDialog
        open={isTransformDialogOpen}
        onOpenChange={(open) => {
          setIsTransformDialogOpen(open);
        }}
        image={image}
      />
    </>
  );
};

export default Page;
