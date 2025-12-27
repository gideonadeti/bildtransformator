import { format } from "date-fns";
import { Code2, Download, Eye, Trash2, Wand2 } from "lucide-react";
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
import type { TransformedImage } from "../../types/general";
import { formatBytes } from "../../utils/format";
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

  const handleDownload = async () => {
    try {
      const [name, extension] = originalImageName.split(".");
      const transformedFilename = `transformed-${name}.${extension}`;

      await downloadImage(transformedImage.secureUrl, transformedFilename);

      toast.success("Transformed image downloaded successfully", {
        id: `download-success-${transformedImage.id}`,
      });
    } catch (error) {
      console.error("Failed to download transformed image:", error);
      toast.error("Failed to download transformed image", {
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
          </div>
          <div className="flex justify-between gap-2">
            {/* Actions on bottom left */}
            <div className="flex gap-2">
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
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => setIsTransformDialogOpen(true)}
                  >
                    <Wand2 />
                    <span className="sr-only">Transform transformed image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Transform transformed image</p>
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
                    <span className="sr-only">Download transformed image</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download transformed image</p>
                </TooltipContent>
              </Tooltip>
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
