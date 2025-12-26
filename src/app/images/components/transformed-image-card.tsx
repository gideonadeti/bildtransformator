import { format } from "date-fns";
import { Code2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

import type { TransformedImage } from "../../types/general";
import { formatBytes } from "../../utils/format";

interface TransformedImageCardProps {
  transformedImage: TransformedImage;
  originalImageName: string;
}

const TransformedImageCard = ({
  transformedImage,
  originalImageName,
}: TransformedImageCardProps) => {
  return (
    <Card
      id={`transformed-image-${transformedImage.id}`}
      className="transition-all duration-300 relative"
    >
      <CardContent className="p-4">
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
        </div>
        <div className="absolute right-2 bottom-2 z-10 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/transformed-images/${transformedImage.id}`}>
                  <Eye />
                  <span className="sr-only">View transformed image</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View transformed image</p>
            </TooltipContent>
          </Tooltip>
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
                    {JSON.stringify(transformedImage.transformation, null, 2)}
                  </pre>
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>
              <p>View transformation details</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransformedImageCard;
