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
  fetchPublicImages,
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

  const publicImagesQuery = useQuery<Image[], AxiosError<{ message: string }>>({
    queryKey: ["public-images"],
    queryFn: async () => await fetchPublicImages(),
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
    if (publicImagesQuery.isError) {
      const message =
        publicImagesQuery.error?.response?.data?.message ||
        "Failed to fetch public images";

      toast.error(message, { id: "fetch-public-images-error" });
    }
  }, [publicImagesQuery.error?.response?.data, publicImagesQuery.isError]);

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
    {
      previousImages: Image[] | undefined;
      previousPublicImages: Image[] | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return likeUnlikeImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });
      await context.client.cancelQueries({ queryKey: ["public-images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);
      const previousPublicImages = context.client.getQueryData<Image[]>([
        "public-images",
      ]);

      if (!user) {
        return { previousImages, previousPublicImages };
      }

      const updateImageLikes = (oldImages: Image[] | undefined) => {
        if (!oldImages) return oldImages;

        const targetImage = oldImages.find((image) => image.id === id);

        if (!targetImage) return oldImages;

        const existingLike = targetImage.likes.find(
          (like) => like.userId === user.id
        );

        if (existingLike) {
          // Unlike: remove the existing like
          return oldImages.map((image) => {
            if (image.id !== id) {
              return image;
            }

            return {
              ...image,
              likes: image.likes.filter((like) => like.id !== existingLike.id),
            };
          });
        } else {
          // Like: add a new like
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
        }
      };

      // Update both queries
      context.client.setQueryData<Image[]>(["images"], updateImageLikes);
      context.client.setQueryData<Image[]>(["public-images"], updateImageLikes);

      return { previousImages, previousPublicImages };
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

      // Restore previous public images data if available
      if (onMutateResult?.previousPublicImages) {
        queryClient.setQueryData<Image[]>(
          ["public-images"],
          onMutateResult.previousPublicImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
      context.client.invalidateQueries({ queryKey: ["public-images"] });
    },
  });

  const downloadImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    {
      previousImages: Image[] | undefined;
      previousPublicImages: Image[] | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return downloadImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });
      await context.client.cancelQueries({ queryKey: ["public-images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);
      const previousPublicImages = context.client.getQueryData<Image[]>([
        "public-images",
      ]);

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

      context.client.setQueryData<Image[]>(
        ["public-images"],
        (oldPublicImages) => {
          if (!oldPublicImages) return oldPublicImages;

          return oldPublicImages.map((image) => {
            if (image.id === id) {
              return { ...image, downloadsCount: image.downloadsCount + 1 };
            }

            return image;
          });
        }
      );

      return { previousImages, previousPublicImages };
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

      if (onMutateResult?.previousPublicImages) {
        queryClient.setQueryData<Image[]>(
          ["public-images"],
          onMutateResult.previousPublicImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
      context.client.invalidateQueries({ queryKey: ["public-images"] });
    },
  });

  const togglePublicImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string },
    {
      previousImages: Image[] | undefined;
      previousPublicImages: Image[] | undefined;
    }
  >({
    mutationFn: async ({ id }) => {
      return togglePublicImage(id);
    },
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey: ["images"] });
      await context.client.cancelQueries({ queryKey: ["public-images"] });

      const previousImages = context.client.getQueryData<Image[]>(["images"]);
      const previousPublicImages = context.client.getQueryData<Image[]>([
        "public-images",
      ]);

      // Find the image to determine its current public status
      const targetImage = previousImages?.find((image) => image.id === id);
      const willBePublic = targetImage ? !targetImage.isPublic : false;

      // Update images query cache
      context.client.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        return oldImages.map((image) => {
          if (image.id === id) {
            return { ...image, isPublic: !image.isPublic };
          }

          return image;
        });
      });

      // Update public-images query cache
      context.client.setQueryData<Image[]>(
        ["public-images"],
        (oldPublicImages) => {
          if (!oldPublicImages) {
            // If cache is empty and making public, add the image
            return willBePublic && targetImage
              ? [{ ...targetImage, isPublic: true }]
              : [];
          }

          if (willBePublic && targetImage) {
            // Making public: add or update in public-images cache
            const exists = oldPublicImages.some((img) => img.id === id);
            if (exists) {
              // Update existing entry
              return oldPublicImages.map((image) => {
                if (image.id === id) {
                  return { ...image, isPublic: true };
                }
                return image;
              });
            }
            // Add new entry
            return [{ ...targetImage, isPublic: true }, ...oldPublicImages];
          } else {
            // Making private: remove from public-images cache
            return oldPublicImages.filter((image) => image.id !== id);
          }
        }
      );

      return { previousImages, previousPublicImages };
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

      // Restore previous public images data if available
      if (onMutateResult?.previousPublicImages) {
        queryClient.setQueryData<Image[]>(
          ["public-images"],
          onMutateResult.previousPublicImages
        );
      }
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["images"] });
      context.client.invalidateQueries({ queryKey: ["public-images"] });
    },
  });

  return {
    imagesQuery,
    publicImagesQuery,
    uploadImageMutation,
    transformImageMutation,
    deleteImageMutation,
    likeUnlikeImageMutation,
    downloadImageMutation,
    togglePublicImageMutation,
  };
};

export default useImages;
