import { format } from "date-fns";
import { Download, Eye, Trash2, Wand2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      toast.success("Download started", {
        description: image.originalName,
        id: `download-${image.id}`,
      });
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
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{image.originalName}</CardTitle>
        <CardDescription className="space-y-0.5">
          <span className="block">
            {formatBytes(image.size)} • {formatDisplay}
          </span>
          <span className="block text-xs">
            Uploaded on {format(new Date(image.createdAt), "PPp")}
          </span>
          {transformedCount > 0 && (
            <span className="block text-xs">
              {transformedCount} transformed image
              {transformedCount !== 1 ? "s" : ""}
            </span>
          )}
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
          <Button variant="outline" size="icon" asChild title="View">
            <Link href={`/images/${image.id}`}>
              <Eye className="size-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onTransformClick}
            title="Transform"
          >
            <Wand2 className="size-4" />
            <span className="sr-only">Transform</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="size-4" />
            <span className="sr-only">Download</span>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onDeleteClick}
            title="Delete"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
