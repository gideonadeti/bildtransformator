"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TransformImageDialog from "../components/dialogs/transform-image-dialog";
import UploadImageDialog from "../components/dialogs/upload-image-dialog";
import ViewImageDialog from "../components/dialogs/view-image-dialog";
import useImages from "../hooks/use-images";
import {
  defaultImagesFilters,
  useImagesFilter,
} from "../hooks/use-images-filter";
import { usePagination } from "../hooks/use-pagination";
import type { Image as ImageType, TransformedImage } from "../types/general";

const IMAGES_PER_BATCH = 20;

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

  const [filters, setFilters] = useState(defaultImagesFilters);

  const { displayedCount, reset, loadMore } = usePagination(IMAGES_PER_BATCH);

  const { minSizeInData, maxSizeInData } = useMemo(() => {
    if (images.length === 0) {
      return {
        minSizeInData: 0,
        maxSizeInData: 0,
      };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const image of images) {
      if (image.size < min) min = image.size;
      if (image.size > max) max = image.size;
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
  }, [images]);

  const filteredAndSortedImages = useImagesFilter(images, filters);

  const displayedImages = filteredAndSortedImages.slice(0, displayedCount);
  const hasMore = displayedCount < filteredAndSortedImages.length;

  const hasActiveFilters =
    !!filters.name ||
    filters.minSize != null ||
    filters.maxSize != null ||
    !!filters.startDate ||
    !!filters.endDate;

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );
    const value = bytes / 1024 ** index;

    return `${value.toFixed(value < 10 ? 1 : 0)} ${units[index]}`;
  };

  const parseSizeInput = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const numeric = Number.parseFloat(trimmed.replace(",", "."));
    if (!Number.isFinite(numeric) || numeric < 0) return null;

    // Treat the input as MB for a more human-friendly scale.
    return Math.round(numeric * 1024 * 1024);
  };

  const updateFilters = (
    patch: Partial<typeof filters>,
    options?: { resetPagination?: boolean }
  ) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        ...patch,
      };

      return next;
    });

    if (options?.resetPagination ?? true) {
      reset();
    }
  };

  const handleNameChange = (value: string) => {
    updateFilters({ name: value });
  };

  const handleMinSizeChange = (value: string) => {
    updateFilters({ minSize: parseSizeInput(value) });
  };

  const handleMaxSizeChange = (value: string) => {
    updateFilters({ maxSize: parseSizeInput(value) });
  };

  const handleSortChange = (value: string) => {
    // value is encoded as "<field>-<order>"
    const [sortBy, sortOrder] = value.split("-") as [
      "date" | "name" | "size",
      "asc" | "desc"
    ];

    updateFilters({ sortBy, sortOrder });
  };

  const handleClearFilters = () => {
    setFilters(defaultImagesFilters);
    reset();
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

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Images</h1>
              <p className="text-muted-foreground">
                {filteredAndSortedImages.length} image
                {filteredAndSortedImages.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsUploadImageDialogOpen(true)}
            >
              Upload Image
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              {/* Name filter - always first, takes most horizontal space */}
              <div className="w-full lg:flex-1 lg:min-w-0 space-y-1">
                <p className="text-sm font-medium">Name filter</p>
                <InputGroup className="min-w-0">
                  <InputGroupAddon>
                    <InputGroupText>
                      <Search className="size-4" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    className="min-w-0"
                    placeholder="Search by image name"
                    value={filters.name}
                    onChange={(event) => handleNameChange(event.target.value)}
                  />
                </InputGroup>
              </div>

              {/* Size filter - sits after name filter */}
              <div className="w-full lg:w-auto space-y-1">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Size filter</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <InputGroup className="max-w-[160px]">
                      <InputGroupAddon>
                        <InputGroupText>Min</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        inputMode="decimal"
                        placeholder={formatBytes(minSizeInData)}
                        onChange={(event) =>
                          handleMinSizeChange(event.target.value)
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>MB</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>

                    <InputGroup className="max-w-[160px]">
                      <InputGroupAddon>
                        <InputGroupText>Max</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        inputMode="decimal"
                        placeholder={formatBytes(maxSizeInData)}
                        onChange={(event) =>
                          handleMaxSizeChange(event.target.value)
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>MB</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              </div>
              {/* Sort - always last, fixed visual width */}
              <div className="w-full sm:w-[260px]">
                <p className="mb-1 text-sm font-medium">Sort</p>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort images" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">
                      Upload date — newest first
                    </SelectItem>
                    <SelectItem value="date-asc">
                      Upload date — oldest first
                    </SelectItem>
                    <SelectItem value="name-asc">Name — A → Z</SelectItem>
                    <SelectItem value="name-desc">Name — Z → A</SelectItem>
                    <SelectItem value="size-asc">
                      File size — smallest first
                    </SelectItem>
                    <SelectItem value="size-desc">
                      File size — largest first
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {displayedImages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                No images found. Try adjusting your filters or upload a new
                image.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedImages.map((image) => (
                  <Card key={image.id}>
                    <CardHeader>
                      <CardTitle className="truncate">
                        {image.originalName}
                      </CardTitle>
                      <CardDescription className="space-y-0.5">
                        <span className="block">
                          {formatBytes(image.size)} •{" "}
                          {format(new Date(image.createdAt), "PPp")}
                        </span>
                      </CardDescription>
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
