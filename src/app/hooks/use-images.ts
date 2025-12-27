import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import type {
  Image,
  TransformedImage,
  TransformImageFormValues,
} from "../types/general";
import {
  deleteImage,
  fetchImages,
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

  return {
    imagesQuery,
    uploadImageMutation,
    transformImageMutation,
    deleteImageMutation,
  };
};

export default useImages;
