import { format } from "date-fns";
import { Code2, Download, Eye, Globe, Heart, Lock, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import DeleteImageDialog from "@/app/components/dialogs/delete-image-dialog";
import TransformImageDialog from "@/app/components/dialogs/transform-image-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useImages from "../../hooks/use-images";
import useTransformedImage from "../../hooks/use-transformed-image";
import useUser from "../../hooks/use-user";
import type { TransformedImage } from "../../types/general";
import { formatBytes, formatNumber } from "../../utils/format";
import { downloadImage } from "../../utils/image-utils";

interface TransformedImageCardProps {
  transformedImage: TransformedImage;
  originalImageName: string;
}

const TransformedImageCard = ({
  transformedImage,
  originalImageName,
}: TransformedImageCardProps) => {
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useUser();
  const { imagesQuery } = useImages();
  const {
    likeUnlikeTransformedImageMutation,
    downloadTransformedImageMutation,
    togglePublicTransformedImageMutation,
  } = useTransformedImage(transformedImage.id);

  const images = imagesQuery.data || [];
  const originalImage = images.find(
    (img) => img.id === transformedImage.originalImageId
  );
  const isOwner = user?.id === originalImage?.userId;

  const likesCount = transformedImage.likes?.length || 0;
  const isLiked = user
    ? transformedImage.likes?.some((like) => like.userId === user.id) ?? false
    : false;

  const handleLikeUnlike = () => {
    likeUnlikeTransformedImageMutation.mutate({ id: transformedImage.id });
  };

  const handleTogglePublic = () => {
    togglePublicTransformedImageMutation.mutate({ id: transformedImage.id });
  };

  const handleDownload = async () => {
    try {
      const [name, extension] = originalImageName.split(".");
      const transformedFilename = `transformed-${name}.${extension}`;

      await downloadTransformedImageMutation.mutateAsync({
        id: transformedImage.id,
      });

      await downloadImage(transformedImage.secureUrl, transformedFilename);

      const successMessage = transformedImage.parentId
        ? "Transformed transformed image downloaded successfully"
        : "Transformed image downloaded successfully";

      toast.success(successMessage, {
        id: `download-success-${transformedImage.id}`,
      });
    } catch (error) {
      const errorMessage = transformedImage.parentId
        ? "Failed to download transformed transformed image"
        : "Failed to download transformed image";

      console.error(errorMessage, ":", error);
      toast.error(errorMessage, {
        description: "Please try again later",
        id: `download-error-${transformedImage.id}`,
      });
    }
  };

  return (
    <>
      <Card
        id={`transformed-image-${transformedImage.id}`}
        className="transition-all duration-300 relative"
      >
        <CardContent className="px-4 py-0 space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border mb-3">
            <Image
              src={transformedImage.secureUrl}
              alt={`Transformed ${originalImageName}`}
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Size:</span>{" "}
              {formatBytes(transformedImage.size)}
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {format(new Date(transformedImage.createdAt), "PPp")}
            </div>
            {(likesCount > 0 || transformedImage.downloadsCount > 0) && (
              <div className="text-xs">
                <span className="inline-flex items-center gap-1.5">
                  {likesCount > 0 && (
                    <>
                      <Heart className="inline size-3" />
                      <span>
                        {formatNumber(likesCount)}{" "}
                        {likesCount === 1 ? "like" : "likes"}
                      </span>
                    </>
                  )}
                  {likesCount > 0 && transformedImage.downloadsCount > 0 && (
                    <span className="mx-1">•</span>
                  )}
                  {transformedImage.downloadsCount > 0 && (
                    <>
                      <Download className="inline size-3" />
                      <span>
                        {formatNumber(transformedImage.downloadsCount)}{" "}
                        {transformedImage.downloadsCount === 1
                          ? "download"
                          : "downloads"}
                      </span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2">
            {/* Actions on bottom left */}
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/transformed-images/${transformedImage.id}`}>
                      <Eye />
                      <span className="sr-only">
                        {transformedImage.parentId
                          ? "View transformed transformed image"
                          : "View transformed image"}
                      </span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {transformedImage.parentId
                      ? "View transformed transformed image"
                      : "View transformed image"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => setIsTransformDialogOpen(true)}
                  >
                    <Wand2 />
                    <span className="sr-only">
                      {transformedImage.parentId
                        ? "Transform transformed transformed image"
                        : "Transform transformed image"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {transformedImage.parentId
                      ? "Transform transformed transformed image"
                      : "Transform transformed image"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                  >
                    <Download />
                    <span className="sr-only">
                      {transformedImage.parentId
                        ? "Download transformed transformed image"
                        : "Download transformed image"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {transformedImage.parentId
                      ? "Download transformed transformed image"
                      : "Download transformed image"}
                  </p>
                </TooltipContent>
              </Tooltip>
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="icon"
                      onClick={handleLikeUnlike}
                    >
                      <Heart
                        className={isLiked ? "fill-current" : ""}
                        size={16}
                        strokeWidth={2}
                      />
                      <span className="sr-only">
                        {isLiked ? "Unlike" : "Like"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLiked ? "Unlike" : "Like"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {isOwner && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={transformedImage.isPublic ? "default" : "outline"}
                      size="icon"
                      onClick={handleTogglePublic}
                    >
                      {transformedImage.isPublic ? (
                        <Globe size={16} />
                      ) : (
                        <Lock size={16} />
                      )}
                      <span className="sr-only">
                        {transformedImage.isPublic
                          ? "Make private"
                          : "Make public"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {transformedImage.isPublic
                        ? "Make private"
                        : "Make public"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 />
                    <span className="sr-only">
                      {transformedImage.parentId
                        ? "Delete transformed transformed image"
                        : "Delete transformed image"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {transformedImage.parentId
                      ? "Delete transformed transformed image"
                      : "Delete transformed image"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* View transformation on bottom right */}
            <div>
              <Tooltip>
                <Popover>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Code2 />
                        <span className="sr-only">View transformation</span>
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        Transformation Details
                      </h4>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono">
                        {JSON.stringify(
                          transformedImage.transformation,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </PopoverContent>
                </Popover>
                <TooltipContent>
                  <p>View transformation details</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
        <TransformImageDialog
          open={isTransformDialogOpen}
          onOpenChange={setIsTransformDialogOpen}
          image={{
            id: transformedImage.id,
            secureUrl: transformedImage.secureUrl,
            originalName: originalImageName,
            parentId: transformedImage.parentId,
          }}
          isTransformedImage={true}
        />
      </Card>
      <DeleteImageDialog
        image={transformedImage}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};

export default TransformedImageCard;
