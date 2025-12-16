"use client";

import { format } from "date-fns";
import { ArrowLeft, Download, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import TransformedImagesToolbar from "@/app/images/components/transformed-images-toolbar";
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

const TRANSFORMED_IMAGES_PER_BATCH = 9;

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const imageId = params?.imageId as string;
  const { imagesQuery, deleteImageMutation } = useImages();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  const images = imagesQuery.data || [];
  const isLoading = imagesQuery.isPending;

  const image = useMemo(() => {
    return images.find((img) => img.id === imageId) || null;
  }, [images, imageId]);

  const transformedImages = image?.transformedImages || [];
  const transformedCount = transformedImages.length;

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

  const handleDelete = () => {
    if (!imageId) return;

    deleteImageMutation.mutate({
      id: imageId,
      onOpenChange: setIsDeleteDialogOpen,
      onSuccess: () => {
        router.push("/images");
      },
    });
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      await downloadImage(image.secureUrl, image.originalName);
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
                              {format(
                                new Date(transformedImage.createdAt),
                                "PPp"
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        image={image}
        onConfirm={handleDelete}
        isPending={deleteImageMutation.isPending}
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
