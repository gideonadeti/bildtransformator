import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { socket } from "@/lib/socket";
import type {
  Image,
  TransformedImage,
  TransformImageFormValues,
} from "../types/general";
import {
  deleteTransformedImage,
  downloadTransformedImage,
  fetchPublicTransformedImage,
  fetchTransformedImage,
  likeUnlikeTransformedImage,
  togglePublicTransformedImage,
  transformTransformedImage,
} from "../utils/general-query-functions";
import useAccessToken from "./use-access-token";
import useUser from "./use-user";

const useTransformedImage = (id: string) => {
  const { accessToken } = useAccessToken();
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const transformedImageQuery = useQuery<
    TransformedImage,
    AxiosError<{ message: string }>
  >({
    queryKey: ["transformed-images", id],
    queryFn: async () => await fetchTransformedImage(id),
    enabled: !!accessToken && !!id,
  });

  const publicTransformedImageQuery = useQuery<
    TransformedImage,
    AxiosError<{ message: string }>
  >({
    queryKey: ["public-transformed-images", id],
    queryFn: async () => await fetchPublicTransformedImage(id),
    enabled: !!accessToken && !!id,
  });

  useEffect(() => {
    if (transformedImageQuery.isError) {
      const message =
        transformedImageQuery.error?.response?.data?.message ||
        "Failed to fetch transformed image";

      toast.error(message, { id: "fetch-transformed-image-error" });
    }
  }, [
    transformedImageQuery.error?.response?.data,
    transformedImageQuery.isError,
  ]);

  useEffect(() => {
    if (publicTransformedImageQuery.isError) {
      const errorMessage =
        publicTransformedImageQuery.error?.response?.data?.message || "";
      const isNotFoundError =
        publicTransformedImageQuery.error?.response?.status === 400 ||
        errorMessage.toLowerCase().includes("not found");

      // Silently fail for "not found" errors (expected when image is private)
      if (!isNotFoundError) {
        const message =
          errorMessage || "Failed to fetch public transformed image";

        toast.error(message, { id: "fetch-public-transformed-image-error" });
      }
    }
  }, [
    publicTransformedImageQuery.error?.response?.data,
    publicTransformedImageQuery.error?.response?.status,
    publicTransformedImageQuery.isError,
  ]);

  useEffect(() => {
    if (!accessToken || !id) {
      return;
    }

    socket.auth = { token: accessToken };
    socket.connect();

    const handleSuccess = (transformedTransformedImage: TransformedImage) => {
      const message = transformedImageQuery.data?.parentId
        ? "Transformed transformed image transformation completed"
        : "Transformed image transformation completed";

      toast.success(message, {
        id: "transformed-image-transformation-completed",
        action: {
          label: "View",
          onClick: () => {
            router.push(
              `/transformed-images/${transformedTransformedImage.parentId}#${transformedTransformedImage.id}`
            );
          },
        },
      });

      queryClient.setQueryData<TransformedImage>(
        ["transformed-images", transformedTransformedImage.parentId],
        (oldData) => {
          if (!oldData) return oldData;

          // Only add if it doesn't already exist
          // Because of the socket
          const exists = oldData.transformedTransformedImages.some(
            (img) => img.id === transformedTransformedImage.id
          );

          if (exists) return oldData;

          return {
            ...oldData,
            transformedTransformedImages: [
              ...oldData.transformedTransformedImages,
              transformedTransformedImage,
            ],
          };
        }
      );
    };

    const handleFailure = (err: { message: string }) => {
      toast.error(err.message, {
        id: "transformed-image-transformation-failed",
      });
    };

    socket.on("transformed-image-transformation-completed", handleSuccess);
    socket.on("transformed-image-transformation-failed", handleFailure);

    return () => {
      socket.off("transformed-image-transformation-completed", handleSuccess);
      socket.off("transformed-image-transformation-failed", handleFailure);
    };
  }, [
    accessToken,
    id,
    queryClient,
    router,
    transformedImageQuery.data?.parentId,
  ]);

  const transformTransformedImageMutation = useMutation<
    { jobId: string } | TransformedImage,
    AxiosError<{ message: string }>,
    {
      id: string;
      formValues: TransformImageFormValues;
      onOpenChange: (open: boolean) => void;
    }
  >({
    mutationFn: async ({ id, formValues }) => {
      return transformTransformedImage(id, formValues);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        "Failed to transform transformed image";

      toast.error(message, { id: "transform-transformed-image-error" });
    },
    onSuccess: (data, { id, onOpenChange }) => {
      onOpenChange(false);

      if ("id" in data && "originalImageId" in data) {
        const message = transformedImageQuery.data?.parentId
          ? "Transformed transformed image transformation already exists"
          : "Transformed image transformation already exists";

        toast.success(message, {
          id: "transform-transformed-image-already-exists",
          action: {
            label: "View",
            onClick: () => {
              router.push(`/transformed-images/${id}#${data.id}`);
            },
          },
        });
      } else {
        const message = transformedImageQuery.data?.parentId
          ? "Transformed transformed image transformation started"
          : "Transformed image transformation started";

        toast.success(message, {
          id: "transform-transformed-image-started",
        });
      }
    },
  });

  const deleteTransformedImageMutation = useMutation<
    TransformedImage,
    AxiosError<{ message: string }>,
    {
      id: string;
      onOpenChange: (open: boolean) => void;
    }
  >({
    mutationFn: async ({ id }) => {
      return deleteTransformedImage(id);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete transformed image";

      toast.error(message, { id: "delete-transformed-image-error" });
    },
    onSuccess: (deletedTransformedImage, { onOpenChange }) => {
      onOpenChange(false);

      const message = deletedTransformedImage.parentId
        ? "Transformed transformed image deleted successfully"
        : "Transformed image deleted successfully";

      toast.success(message, {
        id: "delete-transformed-image-success",
      });

      if (deletedTransformedImage.parentId) {
        // Update the parent transformed image query cache
        queryClient.setQueryData<TransformedImage>(
          ["transformed-images", deletedTransformedImage.parentId],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              transformedTransformedImages:
                oldData.transformedTransformedImages.filter(
                  (ti: TransformedImage) => ti.id !== deletedTransformedImage.id
                ),
            };
          }
        );

        router.push(`/transformed-images/${deletedTransformedImage.parentId}`);
      } else {
        // Update the original image query cache
        queryClient.setQueryData<Image[]>(["images"], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((image) =>
            image.id === deletedTransformedImage.originalImageId
              ? {
                  ...image,
                  transformedImages: image.transformedImages.filter(
                    (ti: TransformedImage) =>
                      ti.id !== deletedTransformedImage.id
                  ),
                }
              : image
          );
        });

        router.push(`/images/${deletedTransformedImage.originalImageId}`);
      }
    },
  });

  const likeUnlikeTransformedImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    {
      previousTransformedImage: TransformedImage | undefined;
      previousPublicTransformedImage: TransformedImage | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return likeUnlikeTransformedImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({
        queryKey: ["transformed-images", id],
      });
      await context.client.cancelQueries({
        queryKey: ["public-transformed-images", id],
      });

      const previousTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "transformed-images",
          id,
        ]);
      const previousPublicTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "public-transformed-images",
          id,
        ]);

      if (!user || !previousTransformedImage) {
        return { previousTransformedImage, previousPublicTransformedImage };
      }

      const existingLike = previousTransformedImage.likes.find(
        (like) => like.userId === user.id
      );

      const updatedTransformedImage: TransformedImage = existingLike
        ? {
            ...previousTransformedImage,
            likes: previousTransformedImage.likes.filter(
              (like) => like.id !== existingLike.id
            ),
          }
        : {
            ...previousTransformedImage,
            likes: [
              ...previousTransformedImage.likes,
              {
                id: `temp-${Date.now()}`,
                userId: user.id,
                imageId: null,
                transformedImageId: id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };

      context.client.setQueryData<TransformedImage>(
        ["transformed-images", id],
        updatedTransformedImage
      );

      // Also update public-transformed-images query if it exists
      if (previousPublicTransformedImage) {
        const existingPublicLike = previousPublicTransformedImage.likes.find(
          (like) => like.userId === user.id
        );

        const updatedPublicTransformedImage: TransformedImage =
          existingPublicLike
            ? {
                ...previousPublicTransformedImage,
                likes: previousPublicTransformedImage.likes.filter(
                  (like) => like.id !== existingPublicLike.id
                ),
              }
            : {
                ...previousPublicTransformedImage,
                likes: [
                  ...previousPublicTransformedImage.likes,
                  {
                    id: `temp-${Date.now()}`,
                    userId: user.id,
                    imageId: null,
                    transformedImageId: id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              };

        context.client.setQueryData<TransformedImage>(
          ["public-transformed-images", id],
          updatedPublicTransformedImage
        );
      }

      if (previousTransformedImage.parentId) {
        // Also update parent transformed image if this is a nested transformed image

        context.client.setQueryData<TransformedImage>(
          ["transformed-images", previousTransformedImage.parentId],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              transformedTransformedImages:
                oldData.transformedTransformedImages.map((ti) =>
                  ti.id === id ? updatedTransformedImage : ti
                ),
            };
          }
        );
      } else {
        // Also update the images query cache if this is a direct transformed image

        context.client.setQueryData<Image[]>(["images"], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((image) =>
            image.id === previousTransformedImage.originalImageId
              ? {
                  ...image,
                  transformedImages: image.transformedImages.map((ti) =>
                    ti.id === id ? updatedTransformedImage : ti
                  ),
                }
              : image
          );
        });
      }

      return { previousTransformedImage, previousPublicTransformedImage };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message ||
        "Failed to like or unlike transformed image";

      toast.error(message, { id: "like-unlike-transformed-image-error" });

      // Restore previous transformed image data if available
      if (onMutateResult?.previousTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["transformed-images", id],
          onMutateResult.previousTransformedImage
        );
      }

      // Restore previous public transformed image data if available
      if (onMutateResult?.previousPublicTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["public-transformed-images", id],
          onMutateResult.previousPublicTransformedImage
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["transformed-images", id],
      });
      context.client.invalidateQueries({
        queryKey: ["public-transformed-images", id],
      });
    },
  });

  const downloadTransformedImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    {
      previousTransformedImage: TransformedImage | undefined;
      previousPublicTransformedImage: TransformedImage | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return downloadTransformedImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({
        queryKey: ["transformed-images", id],
      });
      await context.client.cancelQueries({
        queryKey: ["public-transformed-images", id],
      });
      await context.client.cancelQueries({ queryKey: ["images"] });

      const previousTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "transformed-images",
          id,
        ]);
      const previousPublicTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "public-transformed-images",
          id,
        ]);

      if (!previousTransformedImage) {
        return { previousTransformedImage, previousPublicTransformedImage };
      }

      // Optimistically increment downloadsCount
      const updatedTransformedImage: TransformedImage = {
        ...previousTransformedImage,
        downloadsCount: previousTransformedImage.downloadsCount + 1,
      };

      context.client.setQueryData<TransformedImage>(
        ["transformed-images", id],
        updatedTransformedImage
      );

      // Also update public-transformed-images query if it exists
      if (previousPublicTransformedImage) {
        const updatedPublicTransformedImage: TransformedImage = {
          ...previousPublicTransformedImage,
          downloadsCount: previousPublicTransformedImage.downloadsCount + 1,
        };

        context.client.setQueryData<TransformedImage>(
          ["public-transformed-images", id],
          updatedPublicTransformedImage
        );
      }

      if (previousTransformedImage.parentId) {
        // Also update parent transformed image if this is a nested transformed image
        context.client.setQueryData<TransformedImage>(
          ["transformed-images", previousTransformedImage.parentId],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              transformedTransformedImages:
                oldData.transformedTransformedImages.map((ti) =>
                  ti.id === id ? updatedTransformedImage : ti
                ),
            };
          }
        );
      } else {
        // Also update the images query cache if this is a direct transformed image
        context.client.setQueryData<Image[]>(["images"], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((image) =>
            image.id === previousTransformedImage.originalImageId
              ? {
                  ...image,
                  transformedImages: image.transformedImages.map((ti) =>
                    ti.id === id ? updatedTransformedImage : ti
                  ),
                }
              : image
          );
        });
      }

      return { previousTransformedImage, previousPublicTransformedImage };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message || "Failed to download transformed image";

      toast.error(message, { id: "download-transformed-image-error" });

      // Restore previous transformed image data if available
      if (onMutateResult?.previousTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["transformed-images", id],
          onMutateResult.previousTransformedImage
        );
      }

      // Restore previous public transformed image data if available
      if (onMutateResult?.previousPublicTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["public-transformed-images", id],
          onMutateResult.previousPublicTransformedImage
        );
      }
    },
    onSettled: (_data, _error, { id }, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["transformed-images", id],
      });
      context.client.invalidateQueries({
        queryKey: ["public-transformed-images", id],
      });
      context.client.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const togglePublicTransformedImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    {
      previousTransformedImage: TransformedImage | undefined;
      previousPublicTransformedImage: TransformedImage | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return togglePublicTransformedImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({
        queryKey: ["transformed-images", id],
      });
      await context.client.cancelQueries({
        queryKey: ["public-transformed-images", id],
      });
      await context.client.cancelQueries({ queryKey: ["images"] });

      const previousTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "transformed-images",
          id,
        ]);
      const previousPublicTransformedImage =
        context.client.getQueryData<TransformedImage>([
          "public-transformed-images",
          id,
        ]);

      if (!previousTransformedImage) {
        return { previousTransformedImage, previousPublicTransformedImage };
      }

      // Optimistically toggle isPublic
      const updatedTransformedImage: TransformedImage = {
        ...previousTransformedImage,
        isPublic: !previousTransformedImage.isPublic,
      };

      context.client.setQueryData<TransformedImage>(
        ["transformed-images", id],
        updatedTransformedImage
      );

      // Update public-transformed-images query cache
      const willBePublic = !previousTransformedImage.isPublic;
      context.client.setQueryData<TransformedImage>(
        ["public-transformed-images", id],
        (oldData) => {
          if (!oldData) {
            // If cache is empty and making public, add the transformed image
            return willBePublic && previousTransformedImage
              ? { ...previousTransformedImage, isPublic: true }
              : undefined;
          }

          if (willBePublic) {
            // Making public: update existing entry or add new one
            return { ...oldData, isPublic: true };
          } else {
            // Making private: remove from cache
            return undefined;
          }
        }
      );

      if (previousTransformedImage.parentId) {
        // Also update parent transformed image if this is a nested transformed image
        context.client.setQueryData<TransformedImage>(
          ["transformed-images", previousTransformedImage.parentId],
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              transformedTransformedImages:
                oldData.transformedTransformedImages.map((ti) =>
                  ti.id === id ? updatedTransformedImage : ti
                ),
            };
          }
        );
      } else {
        // Also update the images query cache if this is a direct transformed image
        context.client.setQueryData<Image[]>(["images"], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((image) =>
            image.id === previousTransformedImage.originalImageId
              ? {
                  ...image,
                  transformedImages: image.transformedImages.map((ti) =>
                    ti.id === id ? updatedTransformedImage : ti
                  ),
                }
              : image
          );
        });
      }

      return { previousTransformedImage, previousPublicTransformedImage };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message ||
        "Failed to toggle transformed image public status";

      toast.error(message, { id: "toggle-public-transformed-image-error" });

      // Restore previous transformed image data if available
      if (onMutateResult?.previousTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["transformed-images", id],
          onMutateResult.previousTransformedImage
        );
      }

      // Restore previous public transformed image data if available
      if (onMutateResult?.previousPublicTransformedImage) {
        queryClient.setQueryData<TransformedImage>(
          ["public-transformed-images", id],
          onMutateResult.previousPublicTransformedImage
        );
      }
    },
    onSettled: (_data, _error, { id }, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: ["transformed-images", id],
      });
      context.client.invalidateQueries({
        queryKey: ["public-transformed-images", id],
      });
      context.client.invalidateQueries({ queryKey: ["images"] });
    },
  });

  return {
    transformedImageQuery,
    publicTransformedImageQuery,
    transformTransformedImageMutation,
    deleteTransformedImageMutation,
    likeUnlikeTransformedImageMutation,
    downloadTransformedImageMutation,
    togglePublicTransformedImageMutation,
  };
};

export default useTransformedImage;
