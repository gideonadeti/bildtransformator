"use client";

import { Cloud, Heart, Sparkles, Upload, Users, Wand2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LandingPage = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">Bildtransformator</span>
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground">
            Your all-in-one image processing platform. Upload, transform, and
            share your images with powerful tools and social features—all in one
            place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-muted/30">
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center">
            Why Choose Bildtransformator?
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl">
            Experience the perfect blend of cloud storage, image transformation,
            and social sharing in one powerful platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-8">
            <Card>
              <CardHeader>
                <Cloud className="size-8 text-primary mb-2" />
                <CardTitle>Cloud Storage</CardTitle>
                <CardDescription>
                  Store and manage your images securely in the cloud, just like
                  Google Photos. Access your images from anywhere, anytime.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Wand2 className="size-8 text-primary mb-2" />
                <CardTitle>Image Transformation</CardTitle>
                <CardDescription>
                  Transform your images with powerful tools like resize, rotate,
                  grayscale, and tint—similar to Cloudinary, all in real-time.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="size-8 text-primary mb-2" />
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>
                  Share your images publicly and discover amazing creations from
                  the community, just like Instagram.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Upload className="size-8 text-primary mb-2" />
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription>
                  Intuitive drag-and-drop interface or click to select. Upload
                  images up to 10MB with great error handling.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Sparkles className="size-8 text-primary mb-2" />
                <CardTitle>Advanced Transformations</CardTitle>
                <CardDescription>
                  Apply multiple transformations in any order. Transform already
                  transformed images for endless creative possibilities.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="size-8 text-primary mb-2" />
                <CardTitle>Social Engagement</CardTitle>
                <CardDescription>
                  Like and interact with public images from other users. Build
                  your collection and share your creativity with the world.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Transform Your Images?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join thousands of creators who trust Bildtransformator for their
            image processing needs. Start uploading, transforming, and sharing
            today!
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/auth/sign-up">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
