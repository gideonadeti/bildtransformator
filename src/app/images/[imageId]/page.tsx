"use client";

import { format } from "date-fns";
import { ArrowLeft, Download, Heart, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import DeleteImageDialog from "@/app/components/dialogs/delete-image-dialog";
import TransformImageDialog from "@/app/components/dialogs/transform-image-dialog";
import useImages from "@/app/hooks/use-images";
import { usePagination } from "@/app/hooks/use-pagination";
import {
  defaultTransformedImagesFilters,
  useTransformedImagesFilter,
} from "@/app/hooks/use-transformed-images-filter";
import { useTransformedImagesUrlFilters } from "@/app/hooks/use-transformed-images-url-filters";
import useUser from "@/app/hooks/use-user";
import TransformedImageCard from "@/app/images/components/transformed-image-card";
import TransformedImagesToolbar from "@/app/images/components/transformed-images-toolbar";
import { formatBytes, formatNumber } from "@/app/utils/format";
import { downloadImage } from "@/app/utils/image-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TRANSFORMED_IMAGES_PER_BATCH = 9;

const Page = () => {
  const params = useParams<{ imageId: string }>();
  const imageId = params.imageId;
  const { user } = useUser();
  const {
    imagesQuery,
    likeUnlikeImageMutation,
    downloadImageMutation,
  } = useImages();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  const images = imagesQuery.data || [];
  const isLoading = imagesQuery.isPending;

  const image = useMemo(() => {
    return images.find((img) => img.id === imageId) || null;
  }, [images, imageId]);

  const transformedImages = image?.transformedImages || [];
  const transformedCount = transformedImages.length;
  const likesCount = image?.likes?.length || 0;

  // Check if current user has liked this image
  const isLiked = user && image
    ? image.likes?.some((like) => like.userId === user.id) ?? false
    : false;

  // Scroll to transformed image if hash is present
  // biome-ignore lint/correctness/useExhaustiveDependencies: image is a necessary dependency to scroll to the transformed image if the hash is present
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
  }, [image]);

  // Transformed images filtering and sorting
  const { filters, replaceFiltersInUrl } = useTransformedImagesUrlFilters();
  const { displayedCount, reset, loadMore } = usePagination(
    TRANSFORMED_IMAGES_PER_BATCH
  );

  const { minSizeInData, maxSizeInData } = useMemo(() => {
    if (transformedImages.length === 0) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const transformedImage of transformedImages) {
      if (transformedImage.size < min) min = transformedImage.size;
      if (transformedImage.size > max) max = transformedImage.size;
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
      };
    }

    return {
      minSizeInData: Math.floor(min),
      maxSizeInData: Math.ceil(max),
    };
  }, [transformedImages]);

  const filteredAndSortedTransformedImages = useTransformedImagesFilter(
    transformedImages,
    filters
  );

  const displayedTransformedImages = filteredAndSortedTransformedImages.slice(
    0,
    displayedCount
  );
  const hasMore = displayedCount < filteredAndSortedTransformedImages.length;

  const hasActiveFilters = filters.minSize != null || filters.maxSize != null;

  const updateFilters = (
    patch: Partial<typeof defaultTransformedImagesFilters>,
    options?: { resetPagination?: boolean }
  ) => {
    const shouldReset = options?.resetPagination ?? true;

    const nextFilters = {
      ...filters,
      ...patch,
    };

    replaceFiltersInUrl(nextFilters);

    if (shouldReset) {
      reset();
    }
  };

  const handleClearFilters = () => {
    replaceFiltersInUrl(defaultTransformedImagesFilters);
    reset();
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      // Increment the downloads count of the image
      await downloadImageMutation.mutateAsync({ id: image.id });

      // Download the image
      await downloadImage(image.secureUrl, image.originalName);

      toast.success("Image downloaded successfully", {
        id: `download-success-${image.id}`,
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image", {
        description: "Please try again later",
        id: `download-error-${image.id}`,
      });
    }
  };

  const handleLikeUnlike = () => {
    if (!image) return;
    likeUnlikeImageMutation.mutate({ id: image.id });
  };

  const handleTransform = () => {
    setIsTransformDialogOpen(true);
  };

  const formatDisplay = image?.format?.toUpperCase() || "N/A";

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
              <Skeleton className="h-7 w-64 mb-2" />
              <div className="space-y-2">
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </CardHeader>
          </Card>

          {/* Action buttons skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>

          {/* Transformed images section skeleton */}
          <div className="space-y-4">
            {/* Heading skeleton */}
            <Skeleton className="h-8 w-64" />

            {/* Toolbar skeleton */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                {/* Size filter skeleton */}
                <div className="w-full lg:w-auto space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Skeleton className="h-9 w-[160px]" />
                    <Skeleton className="h-9 w-[160px]" />
                  </div>
                </div>

                {/* Sort skeleton */}
                <div className="w-full sm:w-[260px] space-y-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i.toString()} className="h-[280px] w-full" />
              ))}
            </div>
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
                {(likesCount > 0 || image.downloadsCount > 0) && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="block text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        {likesCount > 0 && (
                          <>
                            <Heart className="inline size-3" />
                            <span>
                              {formatNumber(likesCount)}{" "}
                              {likesCount === 1 ? "like" : "likes"}
                            </span>
                          </>
                        )}
                        {likesCount > 0 && image.downloadsCount > 0 && (
                          <span className="mx-1">•</span>
                        )}
                        {image.downloadsCount > 0 && (
                          <>
                            <Download className="inline size-3" />
                            <span>
                              {formatNumber(image.downloadsCount)}{" "}
                              {image.downloadsCount === 1 ? "download" : "downloads"}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </div>
                )}
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
            <Button onClick={handleTransform}>
              <Wand2 />
              Transform
            </Button>
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLikeUnlike}
              disabled={likeUnlikeImageMutation.isPending}
            >
              <Heart
                className={isLiked ? "fill-current" : ""}
                size={16}
                strokeWidth={2}
              />
              {isLiked ? "Unlike" : "Like"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloadImageMutation.isPending}
            >
              <Download />
              Download
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>

          {/* Transformed images section */}
          {transformedCount > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Transformed Images ({transformedCount})
              </h2>

              <TransformedImagesToolbar
                filters={filters}
                minSizeInData={minSizeInData}
                maxSizeInData={maxSizeInData}
                hasActiveFilters={hasActiveFilters}
                onFiltersChange={(patch) => updateFilters(patch)}
                onClearFilters={handleClearFilters}
              />

              {displayedTransformedImages.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    No transformed images found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedTransformedImages.map((transformedImage) => (
                      <TransformedImageCard
                        key={transformedImage.id}
                        transformedImage={transformedImage}
                        originalImageName={image.originalName}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="py-8 text-center">
                      <Button onClick={loadMore} variant="outline">
                        Load More
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Showing {displayedCount} of{" "}
                        {filteredAndSortedTransformedImages.length} images
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteImageDialog
        image={image}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />

      {/* Transform dialog */}
      <TransformImageDialog
        open={isTransformDialogOpen}
        onOpenChange={setIsTransformDialogOpen}
        image={image}
      />
    </>
  );
};

export default Page;
