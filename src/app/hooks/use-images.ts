import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect } from "react";
import { toast } from "sonner";

import getSocketInstance from "../libs/socket-instance";
import type {
  Image,
  TransformedImage,
  TransformImageFormValues,
} from "../types/general";
import {
  fetchImages,
  fetchTransformedImages,
  transformImage,
  uploadImage,
} from "../utils/general-query-functions";

const useImages = () => {
  const socket = getSocketInstance();
  const queryClient = useQueryClient();
  const imagesQuery = useQuery<Image[], AxiosError<{ message: string }>>({
    queryKey: ["images"],
    queryFn: async () => await fetchImages(),
  });

  const transformedImagesQuery = useQuery<
    TransformedImage[],
    AxiosError<{ message: string }>
  >({
    queryKey: ["transformed-images"],
    queryFn: async () => await fetchTransformedImages(),
  });

  useEffect(() => {
    if (imagesQuery.isError) {
      const message =
        imagesQuery.error?.response?.data?.message || "Failed to fetch images";

      toast.error(message, { id: "fetch-images-error" });
    }
  }, [imagesQuery.error?.response?.data, imagesQuery.isError]);

  useEffect(() => {
    if (transformedImagesQuery.isError) {
      const message =
        transformedImagesQuery.error?.response?.data?.message ||
        "Failed to fetch transformed images";
      toast.error(message, { id: "fetch-transformed-images-error" });
    }
  }, [
    transformedImagesQuery.error?.response?.data,
    transformedImagesQuery.isError,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on(
        "image-transformation-completed",
        (transformedImage: TransformedImage) => {
          queryClient.setQueryData(
            ["transformed-images"],
            (oldTransformedImages: TransformedImage[]) => [
              transformedImage,
              ...oldTransformedImages,
            ]
          );

          toast.success("Image transformation completed", {
            id: "image-transformation-completed",
          });
        }
      );

      socket.on("image-transformation-failed", (error: { message: string }) => {
        toast.error(error.message, { id: "image-transformation-failed" });
      });
    }
  }, [socket, queryClient.setQueryData]);

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
    { jobId: string },
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
    onSuccess: (_, { onOpenChange }) => {
      onOpenChange(false);

      toast.success("Image transformation started", {
        id: "transform-image-success",
      });
    },
  });

  return {
    imagesQuery,
    transformedImagesQuery,
    uploadImageMutation,
    transformImageMutation,
  };
};

export default useImages;
