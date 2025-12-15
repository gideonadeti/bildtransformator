import { format } from "date-fns";
import Image from "next/image";

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

interface ImageCardProps {
  image: ImageType;
  onTransformClick: () => void;
}

const ImageCard = ({ image, onTransformClick }: ImageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{image.originalName}</CardTitle>
        <CardDescription className="space-y-0.5">
          <span className="block">
            {formatBytes(image.size)} •{" "}
            {format(new Date(image.createdAt), "PPp")}
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
        <Button variant="outline" className="w-full" onClick={onTransformClick}>
          Transform
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
