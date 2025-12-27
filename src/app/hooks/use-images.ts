import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import getSocketInstance from "../libs/socket-instance";
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

// Global listener manager to prevent duplicate socket listeners
type TransformationCallback = (transformedImage: TransformedImage) => void;
type TransformationFailedCallback = (error: { message: string }) => void;

const transformationCallbacks = new Set<TransformationCallback>();
const transformationFailedCallbacks = new Set<TransformationFailedCallback>();
let currentSocketInstance: ReturnType<typeof getSocketInstance> | null = null;
let globalQueryClient: ReturnType<typeof useQueryClient> | null = null;
let globalCompletedHandler:
  | ((transformedImage: TransformedImage) => void)
  | null = null;
let globalFailedHandler: ((error: { message: string }) => void) | null = null;

const setupGlobalListeners = (
  socket: ReturnType<typeof getSocketInstance>,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  if (!socket) return;

  // Update global queryClient reference
  globalQueryClient = queryClient;

  // If socket instance changed, reset and re-register
  if (currentSocketInstance !== socket) {
    // Remove old listeners if socket changed
    if (
      currentSocketInstance &&
      globalCompletedHandler &&
      globalFailedHandler
    ) {
      currentSocketInstance.off(
        "image-transformation-completed",
        globalCompletedHandler
      );
      currentSocketInstance.off(
        "image-transformation-failed",
        globalFailedHandler
      );
    }
    currentSocketInstance = socket;
    globalCompletedHandler = null;
    globalFailedHandler = null;
  }

  // Only register if not already registered
  if (globalCompletedHandler && globalFailedHandler) {
    return;
  }

  globalCompletedHandler = (transformedImage: TransformedImage) => {
    // Update query cache once (only one listener ensures this runs once)
    // Only add direct transformations (parentId === null) to the original image's array
    // Nested transformations should only be added to their parent's transformedTransformedImages array
    if (globalQueryClient && transformedImage.parentId === null) {
      globalQueryClient.setQueryData(
        ["images"],
        (oldImages: Image[] | undefined) => {
          if (!oldImages) return oldImages;

          return oldImages.map((image) =>
            image.id === transformedImage.originalImageId
              ? {
                  ...image,
                  transformedImages: [
                    ...(image.transformedImages || []).filter(
                      (ti) => ti.id !== transformedImage.id
                    ),
                    transformedImage,
                  ],
                }
              : image
          );
        }
      );
    }

    // Notify all component callbacks for UI updates
    transformationCallbacks.forEach((callback) => {
      try {
        callback(transformedImage);
      } catch (error) {
        console.error("Error in transformation callback:", error);
      }
    });
  };

  globalFailedHandler = (error: { message: string }) => {
    transformationFailedCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (error) {
        console.error("Error in transformation failed callback:", error);
      }
    });
  };

  // Register listeners immediately
  socket.off("image-transformation-completed", globalCompletedHandler);
  socket.off("image-transformation-failed", globalFailedHandler);
  socket.on("image-transformation-completed", globalCompletedHandler);
  socket.on("image-transformation-failed", globalFailedHandler);
};

const useImages = () => {
  const socket = getSocketInstance();
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
    if (!socket) return;

    // Setup global listeners - this ensures listeners are registered
    setupGlobalListeners(socket, queryClient);

    const handleTransformationCompleted = (
      transformedImage: TransformedImage
    ) => {
      // Only show toast for direct transformations (parentId === null)
      // Nested transformations are handled by use-transformed-image hook
      if (transformedImage.parentId === null) {
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
      }
    };

    const handleTransformationFailed = (error: { message: string }) => {
      toast.error(error.message, { id: "image-transformation-failed" });
    };

    // Register callbacks
    transformationCallbacks.add(handleTransformationCompleted);
    transformationFailedCallbacks.add(handleTransformationFailed);

    // Re-register listeners on connect/reconnect to handle connection issues
    // This ensures listeners are always registered even if socket reconnects
    const handleConnect = () => {
      // Re-setup listeners with current socket instance
      setupGlobalListeners(socket, queryClient);
    };

    // Register connect handler
    socket.on("connect", handleConnect);

    // If already connected, ensure listeners are registered
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      transformationCallbacks.delete(handleTransformationCompleted);
      transformationFailedCallbacks.delete(handleTransformationFailed);
      socket.off("connect", handleConnect);
    };
  }, [socket, queryClient, router]);

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
