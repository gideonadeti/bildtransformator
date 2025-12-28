"use client";

import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteImageDialog from "../components/dialogs/delete-image-dialog";
import TransformImageDialog from "../components/dialogs/transform-image-dialog";
import UploadImageDialog from "../components/dialogs/upload-image-dialog";
import useImages from "../hooks/use-images";
import {
  defaultImagesFilters,
  useImagesFilter,
} from "../hooks/use-images-filter";
import { useImagesUrlFilters } from "../hooks/use-images-url-filters";
import { usePagination } from "../hooks/use-pagination";
import type { Image as ImageType } from "../types/general";
import ImageCard from "./components/image-card";
import ImagesToolbar from "./components/images-toolbar";

const IMAGES_PER_BATCH = 9;

const Page = () => {
  const { imagesQuery } = useImages();
  const images = imagesQuery.data || [];
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { filters, nameInput, setNameInput, replaceFiltersInUrl } =
    useImagesUrlFilters();

  const { displayedCount, reset, loadMore } = usePagination(IMAGES_PER_BATCH);

  const { minSizeInData, maxSizeInData, availableFormats } = useMemo(() => {
    if (images.length === 0) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
        availableFormats: [],
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    const formatsSet = new Set<string>();

    for (const image of images) {
      if (image.size < min) min = image.size;
      if (image.size > max) max = image.size;
      if (image.format) {
        formatsSet.add(image.format.toLowerCase());
      }
    }

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
        availableFormats: Array.from(formatsSet).sort(),
      };
    }

    return {
      minSizeInData: Math.floor(min),
      maxSizeInData: Math.ceil(max),
      availableFormats: Array.from(formatsSet).sort(),
    };
  }, [images]);

  const filteredAndSortedImages = useImagesFilter(images, filters);

  const displayedImages = filteredAndSortedImages.slice(0, displayedCount);
  const hasMore = displayedCount < filteredAndSortedImages.length;

  const hasActiveFilters =
    !!filters.name ||
    filters.minSize != null ||
    filters.maxSize != null ||
    filters.format != null ||
    !!filters.startDate ||
    !!filters.endDate;

  const updateFilters = (
    patch: Partial<typeof defaultImagesFilters>,
    options?: { resetPagination?: boolean }
  ) => {
    const shouldReset = options?.resetPagination ?? true;

    // Handle name separately (debounced in hook)
    if ("name" in patch) {
      setNameInput(patch.name ?? "");
    }

    const { name: _ignoredName, ...rest } = patch;

    if (Object.keys(rest).length > 0) {
      const nextFilters = {
        ...filters,
        ...rest,
      };

      replaceFiltersInUrl(nextFilters);
    }

    if (shouldReset) {
      reset();
    }
  };

  const handleClearFilters = () => {
    replaceFiltersInUrl(defaultImagesFilters);
    reset();
  };

  const handleDeleteClick = (image: ImageType) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  if (imagesQuery.isPending) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-56" />
          </div>

          {/* Filters skeleton: name, size, sort */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              {/* Name filter skeleton */}
              <div className="w-full lg:flex-1 lg:min-w-0 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>

              {/* Size filter skeleton */}
              <div className="w-full lg:w-auto space-y-1">
                <Skeleton className="h-4 w-20" />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Skeleton className="h-9 w-[160px]" />
                  <Skeleton className="h-9 w-[160px]" />
                </div>
              </div>

              {/* Format filter skeleton */}
              <div className="w-full sm:w-[180px] space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>

              {/* Sort skeleton */}
              <div className="w-full sm:w-[260px] space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[280px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const hasNoImages = images.length === 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {!hasNoImages && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Images</h1>
                  <p className="text-muted-foreground">
                    {filteredAndSortedImages.length} image
                    {filteredAndSortedImages.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/public-images">Public Images</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadImageDialogOpen(true)}
                  >
                    Upload Image
                  </Button>
                </div>
              </div>

              <ImagesToolbar
                filters={filters}
                minSizeInData={minSizeInData}
                maxSizeInData={maxSizeInData}
                availableFormats={availableFormats}
                nameValue={nameInput}
                onNameChange={(value) => updateFilters({ name: value })}
                hasActiveFilters={hasActiveFilters}
                onFiltersChange={(patch) => updateFilters(patch)}
                onClearFilters={handleClearFilters}
              />
            </>
          )}

          {hasNoImages ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>No images found</EmptyTitle>
                <EmptyDescription>
                  Get started by uploading your first image.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setIsUploadImageDialogOpen(true)}>
                  Upload Image
                </Button>
              </EmptyContent>
            </Empty>
          ) : displayedImages.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>No images found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your filters or upload a new image.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setIsUploadImageDialogOpen(true)}>
                  Upload Image
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedImages.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onTransformClick={() => {
                      setSelectedImage(image);
                      setIsTransformDialogOpen(true);
                    }}
                    onDeleteClick={() => handleDeleteClick(image)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="py-8 text-center">
                  <Button onClick={loadMore} variant="outline">
                    Load More
                  </Button>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Showing {displayedCount} of {filteredAndSortedImages.length}{" "}
                    images
                  </p>
                </div>
              )}
            </>
          )}
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
      <DeleteImageDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setImageToDelete(null);
          }
        }}
        image={imageToDelete}
      />
    </>
  );
};

export default Page;
