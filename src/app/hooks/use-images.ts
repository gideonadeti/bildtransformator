import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { socket } from "@/lib/socket";
import type {
  Image,
  Like,
  TransformedImage,
  TransformImageFormValues,
} from "../types/general";
import {
  deleteImage,
  downloadImage,
  fetchImages,
  likeUnlikeImage,
  transformImage,
  uploadImage,
} from "../utils/general-query-functions";
import useAccessToken from "./use-access-token";

const useImages = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAccessToken();
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
    Like & { action: "liked" | "unliked" },
    AxiosError<{ message: string }>,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      return likeUnlikeImage(id);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to like or unlike image";

      toast.error(message, { id: "like-unlike-image-error" });
    },
    onSuccess: (data) => {
      // Update the images query cache optimistically
      queryClient.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        if (data.action === "liked") {
          return oldImages.map((image) => {
            if (image.id !== data.imageId) {
              return image;
            }

            return { ...image, likes: [...image.likes, data] };
          });
        } else {
          return oldImages.map((image) => {
            if (image.id !== data.imageId) {
              return image;
            }

            return {
              ...image,
              likes: image.likes.filter((like) => like.id !== data.id),
            };
          });
        }
      });
    },
  });

  const downloadImageMutation = useMutation<
    boolean,
    AxiosError<{ message: string }>,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      return downloadImage(id);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to download image";

      toast.error(message, { id: "download-image-error" });
    },
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<Image[]>(["images"], (oldImages) => {
        if (!oldImages) return oldImages;

        return oldImages.map((image) => {
          if (image.id === id) {
            return { ...image, downloadsCount: image.downloadsCount + 1 };
          }

          return image;
        });
      });
    },
  });

  return {
    imagesQuery,
    uploadImageMutation,
    transformImageMutation,
    deleteImageMutation,
    likeUnlikeImageMutation,
    downloadImageMutation,
  };
};

export default useImages;
