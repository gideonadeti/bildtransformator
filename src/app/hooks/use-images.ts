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
  deleteImage,
  downloadImage,
  fetchImages,
  likeUnlikeImage,
  togglePublicImage,
  transformImage,
  uploadImage,
} from "../utils/general-query-functions";
import useAccessToken from "./use-access-token";
import useUser from "./use-user";

const useImages = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAccessToken();
  const { user } = useUser();
  const imagesQuery = useQuery<Image[], AxiosError<{ message: string }>>({
    queryKey: ["images"],
    queryFn: async () => await fetchImages(),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (imagesQuery.isError) {
      const message =
        imagesQuery.error?.response?.data?.message || "Failed to fetch images";

      toast.error(message, { id: "fetch-images-error" });
    }
  }, [imagesQuery.error?.response?.data, imagesQuery.isError]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    socket.auth = { token: accessToken };
    socket.connect();

    const handleSuccess = (transformedImage: TransformedImage) => {
      toast.success("Image transformation completed", {
        id: "image-transformation-completed",
        action: {
          label: "View",
          onClick: () => {
            router.push(
              `/images/${transformedImage.originalImageId}#${transformedImage.id}`
            );
          },
        },
      });

      queryClient.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        return oldImages.map((image) => {
          if (image.id !== transformedImage.originalImageId) {
            return image;
          }

          const exists = image.transformedImages.some(
            (img) => img.id === transformedImage.id
          );

          if (exists) {
            return image;
          }

          return {
            ...image,
            transformedImages: [...image.transformedImages, transformedImage],
          };
        });
      });
    };

    const handleFailure = (err: { message: string }) => {
      toast.error(err.message, { id: "image-transformation-failed" });
    };

    socket.on("image-transformation-completed", handleSuccess);
    socket.on("image-transformation-failed", handleFailure);

    return () => {
      socket.off("image-transformation-completed", handleSuccess);
      socket.off("image-transformation-failed", handleFailure);
    };
  }, [accessToken, queryClient, router]);

  const uploadImageMutation = useMutation<
    Image,
    AxiosError<{ message: string }>,
    { image: File; onOpenChange: (open: boolean) => void }
  >({
    mutationFn: async ({ image }) => {
      return uploadImage(image);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to upload image";

      toast.error(message, { id: "upload-image-error" });
    },
    onSuccess: (newImage, { onOpenChange }) => {
      onOpenChange(false);
      toast.success("Image uploaded successfully", {
        id: "upload-image-success",
      });

      queryClient.setQueryData(["images"], (oldImages: Image[]) => [
        newImage,
        ...oldImages,
      ]);
    },
  });

  const transformImageMutation = useMutation<
    { jobId: string } | TransformedImage,
    AxiosError<{ message: string }>,
    {
      id: string;
      formValues: TransformImageFormValues;
      onOpenChange: (open: boolean) => void;
    }
  >({
    mutationFn: async ({ id, formValues }) => {
      return transformImage(id, formValues);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to transform image";

      toast.error(message, { id: "transform-image-error" });
    },
    onSuccess: (data, { onOpenChange }) => {
      onOpenChange(false);

      if ("id" in data && "originalImageId" in data) {
        toast.success("Image transformation already exists", {
          id: "transform-image-already-exists",
          action: {
            label: "View",
            onClick: () => {
              router.push(`/images/${data.originalImageId}#${data.id}`);
            },
          },
        });
      } else {
        toast.success("Image transformation started", {
          id: "transform-image-started",
        });
      }
    },
  });

  const deleteImageMutation = useMutation<
    Image,
    AxiosError<{ message: string }>,
    {
      id: string;
      onOpenChange: (open: boolean) => void;
    }
  >({
    mutationFn: async ({ id }) => {
      return deleteImage(id);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to delete image";

      toast.error(message, { id: "delete-image-error" });
    },
    onSuccess: (deletedImage, { onOpenChange }) => {
      onOpenChange(false);

      toast.success("Image deleted successfully", {
        id: "delete-image-success",
      });

      // Remove from images query cache
      queryClient.setQueryData(["images"], (oldImages: Image[]) =>
        oldImages.filter((img) => img.id !== deletedImage.id)
      );

      router.push("/images");
    },
  });

  const likeUnlikeImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    { previousImages: Image[] | undefined }
  >({
    mutationFn: async ({ id }) => {
      return likeUnlikeImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);

      if (!user) {
        return { previousImages };
      }

      const existingLike = previousImages
        ?.find((image) => image.id === id)
        ?.likes.find((like) => like.userId === user.id);

      if (existingLike) {
        // Unlike: remove the existing like
        context.client.setQueryData<Image[]>(["images"], (oldImages) => {
          if (!oldImages) return oldImages;

          return oldImages.map((image) => {
            if (image.id !== id) {
              return image;
            }

            return {
              ...image,
              likes: image.likes.filter((like) => like.id !== existingLike.id),
            };
          });
        });
      } else {
        // Like: add a new like
        context.client.setQueryData<Image[]>(["images"], (oldImages) => {
          if (!oldImages) return oldImages;

          return oldImages.map((image) => {
            if (image.id !== id) {
              return image;
            }

            return {
              ...image,
              likes: [
                ...image.likes,
                {
                  id: `temp-${Date.now()}`,
                  userId: user.id,
                  imageId: id,
                  transformedImageId: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            };
          });
        });
      }

      return { previousImages };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message || "Failed to like or unlike image";

      toast.error(message, { id: "like-unlike-image-error" });

      // Restore previous images data if available
      if (onMutateResult?.previousImages) {
        queryClient.setQueryData<Image[]>(
          ["images"],
          onMutateResult.previousImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const downloadImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    { previousImages: Image[] | undefined }
  >({
    mutationFn: async ({ id }) => {
      return downloadImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);

      // Optimistically increment downloadsCount
      context.client.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        return oldImages.map((image) => {
          if (image.id === id) {
            return { ...image, downloadsCount: image.downloadsCount + 1 };
          }

          return image;
        });
      });

      return { previousImages };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message || "Failed to download image";

      toast.error(message, { id: "download-image-error" });

      // Restore previous images data if available
      if (onMutateResult?.previousImages) {
        queryClient.setQueryData<Image[]>(
          ["images"],
          onMutateResult.previousImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
    },
  });

  const togglePublicImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    { previousImages: Image[] | undefined }
  >({
    mutationFn: async ({ id }) => {
      return togglePublicImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);

      // Optimistically toggle isPublic
      context.client.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        return oldImages.map((image) => {
          if (image.id === id) {
            return { ...image, isPublic: !image.isPublic };
          }

          return image;
        });
      });

      return { previousImages };
    },
    onError: (error, _variables, onMutateResult, _context) => {
      const message =
        error.response?.data?.message || "Failed to toggle image public status";

      toast.error(message, { id: "toggle-public-image-error" });

      // Restore previous images data if available
      if (onMutateResult?.previousImages) {
        queryClient.setQueryData<Image[]>(
          ["images"],
          onMutateResult.previousImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
    },
  });

  return {
    imagesQuery,
    uploadImageMutation,
    transformImageMutation,
    deleteImageMutation,
    likeUnlikeImageMutation,
    downloadImageMutation,
    togglePublicImageMutation,
  };
};

export default useImages;
