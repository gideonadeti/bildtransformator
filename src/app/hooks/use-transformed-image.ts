import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import getSocketInstance from "../libs/socket-instance";
import type {
  TransformedImage,
  TransformImageFormValues,
} from "../types/general";
import {
  fetchTransformedImage,
  transformTransformedImage,
} from "../utils/general-query-functions";
import useAccessToken from "./use-access-token";

// Global listener manager to prevent duplicate socket listeners
type TransformedImageTransformationCallback = (
  transformedTransformedImage: TransformedImage
) => void;
type TransformedImageTransformationFailedCallback = (error: {
  message: string;
}) => void;

const transformedImageTransformationCallbacks =
  new Set<TransformedImageTransformationCallback>();
const transformedImageTransformationFailedCallbacks =
  new Set<TransformedImageTransformationFailedCallback>();
let currentTransformedImageSocketInstance: ReturnType<
  typeof getSocketInstance
> | null = null;
let globalTransformedImageQueryClient: ReturnType<
  typeof useQueryClient
> | null = null;
let globalTransformedImageCompletedHandler:
  | ((transformedTransformedImage: TransformedImage) => void)
  | null = null;
let globalTransformedImageFailedHandler:
  | ((error: { message: string }) => void)
  | null = null;

const setupGlobalTransformedImageListeners = (
  socket: ReturnType<typeof getSocketInstance>,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (!socket) return;

  // Update global queryClient reference
  globalTransformedImageQueryClient = queryClient;

  // If socket instance changed, reset and re-register
  if (currentTransformedImageSocketInstance !== socket) {
    // Remove old listeners if socket changed
    if (
      currentTransformedImageSocketInstance &&
      globalTransformedImageCompletedHandler &&
      globalTransformedImageFailedHandler
    ) {
      currentTransformedImageSocketInstance.off(
        "transformed-image-transformation-completed",
        globalTransformedImageCompletedHandler
      );
      currentTransformedImageSocketInstance.off(
        "transformed-image-transformation-failed",
        globalTransformedImageFailedHandler
      );
    }
    currentTransformedImageSocketInstance = socket;
    globalTransformedImageCompletedHandler = null;
    globalTransformedImageFailedHandler = null;
  }

  // Only register if not already registered
  if (
    globalTransformedImageCompletedHandler &&
    globalTransformedImageFailedHandler
  ) {
    return;
  }

  globalTransformedImageCompletedHandler = (
    transformedTransformedImage: TransformedImage
  ) => {
    // Update query cache for the parent transformed image
    if (
      globalTransformedImageQueryClient &&
      transformedTransformedImage.parentId
    ) {
      globalTransformedImageQueryClient.setQueryData<TransformedImage>(
        ["transformed-images", transformedTransformedImage.parentId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            transformedTransformedImages: [
              ...oldData.transformedTransformedImages,
              transformedTransformedImage,
            ],
          };
        }
      );
    }

    // Notify all component callbacks for UI updates
    transformedImageTransformationCallbacks.forEach((callback) => {
      try {
        callback(transformedTransformedImage);
      } catch (error) {
        console.error(
          "Error in transformed image transformation callback:",
          error
        );
      }
    });
  };

  globalTransformedImageFailedHandler = (error: { message: string }) => {
    transformedImageTransformationFailedCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (error) {
        console.error(
          "Error in transformed image transformation failed callback:",
          error
        );
      }
    });
  };

  socket.on(
    "transformed-image-transformation-completed",
    globalTransformedImageCompletedHandler
  );
  socket.on(
    "transformed-image-transformation-failed",
    globalTransformedImageFailedHandler
  );
};

const useTransformedImage = (id: string) => {
  const { accessToken } = useAccessToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const socket = getSocketInstance();
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

  useEffect(() => {
    if (!socket) return;

    setupGlobalTransformedImageListeners(socket, queryClient);

    const handleTransformationCompleted = (
      transformedTransformedImage: TransformedImage
    ) => {
      // Only show toast if this transformation is for the current transformed image
      if (transformedTransformedImage.parentId === id) {
        toast.success("Transformed image transformation completed", {
          id: "transformed-image-transformation-completed",
          action: {
            label: "View",
            onClick: () => {
              router.push(
                `/transformed-images/${id}#${transformedTransformedImage.id}`
              );
            },
          },
        });
      }
    };

    const handleTransformationFailed = (error: { message: string }) => {
      toast.error(error.message, {
        id: "transformed-image-transformation-failed",
      });
    };

    transformedImageTransformationCallbacks.add(handleTransformationCompleted);
    transformedImageTransformationFailedCallbacks.add(
      handleTransformationFailed
    );

    return () => {
      transformedImageTransformationCallbacks.delete(
        handleTransformationCompleted
      );
      transformedImageTransformationFailedCallbacks.delete(
        handleTransformationFailed
      );
    };
  }, [socket, id, queryClient, router]);

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

  return {
    transformedImageQuery,
    transformTransformedImageMutation,
  };
};

export default useTransformedImage;
