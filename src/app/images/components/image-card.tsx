import { format } from "date-fns";
import { Download, Eye, Trash2, Wand2 } from "lucide-react";
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

import type { Image as ImageType } from "../../types/general";
import { formatBytes } from "../../utils/format";
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
  const handleDownload = async () => {
    try {
      await downloadImage(image.secureUrl, image.originalName);
    } catch (error) {
      console.error("Failed to download image:", error);
      toast.error("Failed to download image", {
        description: "Please try again later",
        id: `download-error-${image.id}`,
      });
    }
  };
  const transformedCount = image.transformedImages?.length || 0;
  const formatDisplay = image.format?.toUpperCase() || "N/A";

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
                <Link href={`/images/${image.id}`}>
                  <Eye />
                  <span className="sr-only">View</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="icon" onClick={onTransformClick}>
                <Wand2 />
                <span className="sr-only">Transform</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Transform</p>
            </TooltipContent>
          </Tooltip>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="icon" onClick={onDeleteClick}>
                <Trash2 />
                <span className="sr-only">Delete</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
