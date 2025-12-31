"use client";

import {
  Cloud,
  Download,
  Heart,
  Image as ImageIcon,
  Images,
  Upload,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TransformImageDialog from "@/app/components/dialogs/transform-image-dialog";
import UploadImageDialog from "@/app/components/dialogs/upload-image-dialog";
import useAuth from "@/app/hooks/use-auth";
import useImages from "@/app/hooks/use-images";
import ImageCard from "@/app/images/components/image-card";
import type { Image } from "@/app/types/general";
import { formatBytes, formatNumber } from "@/app/utils/format";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { statsQuery } = useAuth();
  const { imagesQuery, publicImagesQuery } = useImages();
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

  const stats = statsQuery.data;
  const images = imagesQuery.data || [];
  const publicImages = publicImagesQuery.data || [];

  // Get recent images (most recent first, limit to 3)
  const recentImages = images.slice(0, 3);
  const recentPublicImages = publicImages.slice(0, 3);

  const isLoading =
    statsQuery.isPending ||
    imagesQuery.isPending ||
    publicImagesQuery.isPending;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stats Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Statistics</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i.toString()}>
                <CardHeader>
                  <Skeleton className="h-8 w-8 mb-2" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <ImageIcon className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {stats
                    ? formatNumber(stats.images.private + stats.images.public)
                    : "0"}
                </CardTitle>
                <CardDescription>
                  Total Images
                  {stats && (
                    <span className="block text-xs mt-1">
                      {formatNumber(stats.images.private)} private,{" "}
                      {formatNumber(stats.images.public)} public
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Wand2 className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {stats
                    ? formatNumber(
                        stats.transformations.private +
                          stats.transformations.public
                      )
                    : "0"}
                </CardTitle>
                <CardDescription>
                  Total Transformations
                  {stats && (
                    <span className="block text-xs mt-1">
                      {formatNumber(stats.transformations.private)} private,{" "}
                      {formatNumber(stats.transformations.public)} public
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Download className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {stats
                    ? formatNumber(
                        stats.downloads.images + stats.downloads.transformations
                      )
                    : "0"}
                </CardTitle>
                <CardDescription>
                  Total Downloads
                  {stats && (
                    <span className="block text-xs mt-1">
                      {formatNumber(stats.downloads.images)} images,{" "}
                      {formatNumber(stats.downloads.transformations)}{" "}
                      transformations
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {stats
                    ? formatNumber(
                        stats.likes.images + stats.likes.transformations
                      )
                    : "0"}
                </CardTitle>
                <CardDescription>
                  Total Likes Received
                  {stats && (
                    <span className="block text-xs mt-1">
                      {formatNumber(stats.likes.images)} images,{" "}
                      {formatNumber(stats.likes.transformations)}{" "}
                      transformations
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Cloud className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {stats
                    ? formatBytes(
                        stats.storage.images + stats.storage.transformations
                      )
                    : "0 B"}
                </CardTitle>
                <CardDescription>
                  Total Storage Used
                  {stats && (
                    <span className="block text-xs mt-1">
                      {formatBytes(stats.storage.images)} images,{" "}
                      {formatBytes(stats.storage.transformations)}{" "}
                      transformations
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Images className="size-8 text-primary mb-2" />
                <CardTitle className="text-2xl">
                  {formatNumber(publicImages.length)}
                </CardTitle>
                <CardDescription>Total Public Images</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={() => setIsUploadImageDialogOpen(true)}>
            <Upload />
            Upload New Image
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/images">
              <Images />
              View All Images
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/public-images">
              <ImageIcon />
              Browse Public Gallery
            </Link>
          </Button>
        </div>
      </section>

      {/* Recent Images */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Images</h2>
          {images.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/images">View All</Link>
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i.toString()}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentImages.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No images yet</CardTitle>
              <CardDescription>
                Upload your first image to get started!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsUploadImageDialogOpen(true)}>
                <Upload />
                Upload Your First Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onTransformClick={() => {
                  setSelectedImage(image);
                  setIsTransformDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Public Images */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Public Images</h2>
          {publicImages.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/public-images">View All</Link>
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i.toString()}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentPublicImages.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No public images available</CardTitle>
              <CardDescription>
                There are no public images from the community at the moment.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPublicImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onTransformClick={() => {
                  setSelectedImage(image);
                  setIsTransformDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <UploadImageDialog
        open={isUploadImageDialogOpen}
        onOpenChange={setIsUploadImageDialogOpen}
      />
      {selectedImage && (
        <TransformImageDialog
          open={isTransformDialogOpen}
          image={selectedImage}
          onOpenChange={(open) => {
            setIsTransformDialogOpen(open);
            if (!open) {
              setSelectedImage(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
