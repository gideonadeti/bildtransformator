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
  deleteTransformedImage,
  fetchTransformedImage,
  transformTransformedImage,
} from "../utils/general-query-functions";
import useAccessToken from "./use-access-token";

const useTransformedImage = (id: string) => {
  const { accessToken } = useAccessToken();
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
        toast.success("Transformed image transformation already exists", {
          id: "transform-transformed-image-already-exists",
          action: {
            label: "View",
            onClick: () => {
              router.push(`/transformed-images/${id}#${data.id}`);
            },
          },
        });
      } else {
        toast.success("Transformed image transformation started", {
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

      toast.success("Transformed image deleted successfully", {
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

  return {
    transformedImageQuery,
    transformTransformedImageMutation,
    deleteTransformedImageMutation,
  };
};

export default useTransformedImage;
