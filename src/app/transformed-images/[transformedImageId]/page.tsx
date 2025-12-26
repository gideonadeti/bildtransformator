"use client";

import { format } from "date-fns";
import { ArrowLeft, Code2, Download, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import TransformImageDialog from "@/app/components/dialogs/transform-image-dialog";
import useImages from "@/app/hooks/use-images";
import { usePagination } from "@/app/hooks/use-pagination";
import useTransformedImage from "@/app/hooks/use-transformed-image";
import {
  defaultTransformedImagesFilters,
  useTransformedImagesFilter,
} from "@/app/hooks/use-transformed-images-filter";
import { useTransformedImagesUrlFilters } from "@/app/hooks/use-transformed-images-url-filters";
import TransformedImageCard from "@/app/images/components/transformed-image-card";
import TransformedImagesToolbar from "@/app/images/components/transformed-images-toolbar";
import { formatBytes } from "@/app/utils/format";
import { downloadImage } from "@/app/utils/image-utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const TRANSFORMED_TRANSFORMED_IMAGES_PER_BATCH = 9;

const Page = () => {
  const params = useParams<{ transformedImageId: string }>();
  const router = useRouter();
  const transformedImageId = params.transformedImageId;
  const { transformedImageQuery } = useTransformedImage(transformedImageId);
  const { imagesQuery } = useImages();
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  const transformedImage = transformedImageQuery.data;
  const isLoading = transformedImageQuery.isPending;
  const images = imagesQuery.data || [];

  const transformedTransformedImages =
    transformedImage?.transformedTransformedImages || [];

  const transformedCount = transformedTransformedImages.length;

  // Get original image name from images query
  const originalImageName = useMemo(() => {
    if (!transformedImage) return "transformed-image";
    const originalImage = images.find(
      (img) => img.id === transformedImage.originalImageId
    );
    return originalImage?.originalName || "transformed-image";
  }, [transformedImage, images]);

  // Scroll to transformed transformed image if hash is present
  // biome-ignore lint/correctness/useExhaustiveDependencies: transformedImage is a necessary dependency to scroll to the transformed transformed image if the hash is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const transformedTransformedImageId = window.location.hash.substring(1); // Remove the #
      const element = document.getElementById(
        `transformed-image-${transformedTransformedImageId}`
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

  // Transformed transformed images filtering and sorting
  const { filters, replaceFiltersInUrl } = useTransformedImagesUrlFilters();
  const { displayedCount, reset, loadMore } = usePagination(
    TRANSFORMED_TRANSFORMED_IMAGES_PER_BATCH
  );

  const { minSizeInData, maxSizeInData } = useMemo(() => {
    if (transformedTransformedImages.length === 0) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const transformedTransformedImage of transformedTransformedImages) {
      if (transformedTransformedImage.size < min)
        min = transformedTransformedImage.size;
      if (transformedTransformedImage.size > max)
        max = transformedTransformedImage.size;
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
  }, [transformedTransformedImages]);

  const filteredAndSortedTransformedTransformedImages =
    useTransformedImagesFilter(transformedTransformedImages, filters);

  const displayedTransformedTransformedImages =
    filteredAndSortedTransformedTransformedImages.slice(0, displayedCount);
  const hasMore =
    displayedCount < filteredAndSortedTransformedTransformedImages.length;

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

  const handleTransform = () => {
    setIsTransformDialogOpen(true);
  };

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
          {/* Back buttons skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-36" />
          </div>

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
            <Skeleton className="h-9 w-40" />
          </div>

          {/* Transformed transformed images section skeleton */}
          {transformedCount > 0 && (
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
          )}
        </div>
      </div>
    );
  }

  if (!transformedImage) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft />
              Back
            </Button>
            <Button variant="outline" asChild>
              <Link href="/images">
                <ArrowLeft />
                Back to Images
              </Link>
            </Button>
          </div>
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
        {/* Back buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft />
            Back
          </Button>
          <Button variant="outline" asChild>
            <Link href="/images">
              <ArrowLeft />
              Back to Images
            </Link>
          </Button>
        </div>

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
          <Button variant="outline" onClick={handleTransform}>
            <Wand2 />
            Transform
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download />
            Download
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Code2 />
                View Transformation
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  Transformation Details
                </h4>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono max-h-[400px] overflow-y-auto">
                  {JSON.stringify(transformedImage.transformation, null, 2)}
                </pre>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Transformed transformed images section */}
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

            {displayedTransformedTransformedImages.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No transformed images found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedTransformedTransformedImages.map(
                    (transformedTransformedImage) => (
                      <TransformedImageCard
                        key={transformedTransformedImage.id}
                        transformedImage={transformedTransformedImage}
                        originalImageName={originalImageName}
                      />
                    )
                  )}
                </div>

                {hasMore && (
                  <div className="py-8 text-center">
                    <Button onClick={loadMore} variant="outline">
                      Load More
                    </Button>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Showing {displayedCount} of{" "}
                      {filteredAndSortedTransformedTransformedImages.length}{" "}
                      images
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Transform dialog */}
      <TransformImageDialog
        open={isTransformDialogOpen}
        onOpenChange={setIsTransformDialogOpen}
        image={{
          id: transformedImage.id,
          secureUrl: transformedImage.secureUrl,
          originalName: originalImageName,
        }}
        isTransformedImage={true}
      />
    </div>
  );
};

export default Page;
