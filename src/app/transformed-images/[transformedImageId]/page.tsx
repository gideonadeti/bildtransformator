"use client";

import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import useTransformedImage from "@/app/hooks/use-transformed-image";
import { formatBytes } from "@/app/utils/format";
import { downloadImage } from "@/app/utils/image-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const params = useParams<{ transformedImageId: string }>();
  const transformedImageId = params.transformedImageId;
  const { transformedImageQuery } = useTransformedImage(transformedImageId);

  const transformedImage = transformedImageQuery.data;
  const isLoading = transformedImageQuery.isPending;

  const transformedTransformedImages =
    transformedImage?.transformedTransformedImages || [];

  const transformedCount = transformedTransformedImages.length;

  // Scroll to transformed image if hash is present
  // biome-ignore lint/correctness/useExhaustiveDependencies: transformedImage is a necessary dependency to scroll to the transformed image if the hash is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const transformedImageId = window.location.hash.substring(1); // Remove the #
      const element = document.getElementById(
        `transformed-image-${transformedImageId}`
      );

      if (element) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Add a highlight effect
          element.classList.add("ring-4", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-4", "ring-primary", "ring-offset-2");
          }, 2000);
        }, 100);
      }
    }
  }, [transformedImage]);

  const handleDownload = async () => {
    if (!transformedImage) return;

    try {
      await downloadImage(
        transformedImage.secureUrl,
        `transformed-image-${transformedImage.id}`
      );

      toast.success("Image downloaded successfully", {
        id: `download-success-${transformedImage.id}`,
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image", {
        description: "Please try again later",
        id: `download-error-${transformedImage.id}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <Skeleton className="h-9 w-32" />

          {/* Main image skeleton */}
          <Skeleton className="aspect-video w-full rounded-lg" />

          {/* Image information card skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-3" />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Action buttons skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!transformedImage) {
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
            <h1 className="text-2xl font-bold mb-2">
              Transformed Image Not Found
            </h1>
            <p className="text-muted-foreground">
              The transformed image you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
            src={transformedImage.secureUrl}
            alt={`Transformed image ${transformedImage.id}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Image information */}
        <Card>
          <CardHeader>
            <CardTitle>Transformed Image</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  <span className="font-medium">Size:</span>{" "}
                  {formatBytes(transformedImage.size)}
                </span>
                <span>
                  <span className="font-medium">Nested Transformations:</span>{" "}
                  {transformedCount} image{transformedCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  <span className="font-medium">Transformed on:</span>{" "}
                  {format(new Date(transformedImage.createdAt), "PPp")}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
