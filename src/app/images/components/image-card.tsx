import { format } from "date-fns";
import { Download, Eye, Globe, Heart, Lock, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useImages from "../../hooks/use-images";
import useUser from "../../hooks/use-user";
import type { Image as ImageType } from "../../types/general";
import { formatBytes, formatNumber } from "../../utils/format";
import { downloadImage } from "../../utils/image-utils";

interface ImageCardProps {
  image: ImageType;
  onTransformClick: () => void;
  onDeleteClick?: () => void;
}

const ImageCard = ({
  image,
  onTransformClick,
  onDeleteClick = () => {},
}: ImageCardProps) => {
  const { user } = useUser();
  const isOwner = user?.id === image.userId;
  const {
    likeUnlikeImageMutation,
    downloadImageMutation,
    togglePublicImageMutation,
  } = useImages();

  const handleDownload = async () => {
    try {
      // Increment the downloads count of the image
      await downloadImageMutation.mutateAsync({ id: image.id });

      // Download the image
      await downloadImage(image.secureUrl, image.originalName);

      toast.success("Image downloaded successfully", {
        id: `download-success-${image.id}`,
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image", {
        description: "Please try again later",
        id: `download-error-${image.id}`,
      });
    }
  };

  const handleLikeUnlike = () => {
    likeUnlikeImageMutation.mutate({ id: image.id });
  };

  const handleTogglePublic = () => {
    togglePublicImageMutation.mutate({ id: image.id });
  };

  const transformedCount = image.transformedImages?.length || 0;
  const likesCount = image.likes?.length || 0;
  const formatDisplay = image.format?.toUpperCase() || "N/A";

  // Check if current user has liked this image
  const isLiked = user
    ? image.likes?.some((like) => like.userId === user.id) ?? false
    : false;

  return (
    <Card className="relative">
      {transformedCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="default" className="absolute right-2 top-2 z-10">
              {transformedCount}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {transformedCount} transformed image
              {transformedCount !== 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
      <CardHeader>
        <CardTitle className="truncate">{image.originalName}</CardTitle>
        <CardDescription className="space-y-0.5">
          <span className="block">
            {formatBytes(image.size)} • {formatDisplay}
          </span>
          {(likesCount > 0 || image.downloadsCount > 0) && (
            <span className="block text-xs">
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
                {likesCount > 0 && image.downloadsCount > 0 && (
                  <span className="mx-1">•</span>
                )}
                {image.downloadsCount > 0 && (
                  <>
                    <Download className="inline size-3" />
                    <span>
                      {formatNumber(image.downloadsCount)}{" "}
                      {image.downloadsCount === 1 ? "download" : "downloads"}
                    </span>
                  </>
                )}
              </span>
            </span>
          )}
          <span className="block text-xs">
            Uploaded on {format(new Date(image.createdAt), "PPp")}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
          <Image
            src={image.secureUrl}
            alt={image.originalName}
            fill
            className="object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link
                  href={`/${image.isPublic ? "public-images" : "images"}/${
                    image.id
                  }`}
                >
                  <Eye />
                  <span className="sr-only">View</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View</p>
            </TooltipContent>
          </Tooltip>
          {isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={onTransformClick}
                >
                  <Wand2 />
                  <span className="sr-only">Transform</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Transform</p>
              </TooltipContent>
            </Tooltip>
          )}
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
                  <span className="sr-only">{isLiked ? "Unlike" : "Like"}</span>
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
                  variant={image.isPublic ? "default" : "outline"}
                  size="icon"
                  onClick={handleTogglePublic}
                >
                  {image.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                  <span className="sr-only">
                    {image.isPublic ? "Make private" : "Make public"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{image.isPublic ? "Make private" : "Make public"}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download />
                <span className="sr-only">Download</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
          {isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onDeleteClick}
                >
                  <Trash2 />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
