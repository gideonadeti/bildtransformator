# Bildtransformator

A modern, responsive web application for uploading, transforming, and sharing images. Built with Next.js and featuring a beautiful UI with dark mode support, real-time transformation notifications, and social media functionality. This frontend client communicates with the [image-processing-service](https://github.com/gideonadeti/image-processing-service) backend API to provide a complete image processing experience that combines cloud storage capabilities (like Google Photos), image transformation features (like Cloudinary), and social media functionality (like Instagram).

## Table of Contents

- [Bildtransformator](#bildtransformator)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [User Authentication](#user-authentication)
    - [Image Upload](#image-upload)
    - [Image Transformation](#image-transformation)
    - [Image Management](#image-management)
    - [Social Features](#social-features)
    - [User Experience](#user-experience)
    - [Additional Features](#additional-features)
  - [Screenshots](#screenshots)
  - [Technologies Used](#technologies-used)
    - [Core Framework](#core-framework)
    - [State Management \& Data Fetching](#state-management--data-fetching)
    - [UI Components \& Styling](#ui-components--styling)
    - [Forms \& Validation](#forms--validation)
    - [HTTP Client](#http-client)
    - [Real-Time Communication](#real-time-communication)
    - [File Upload](#file-upload)
    - [Notifications](#notifications)
    - [Development Tools](#development-tools)
  - [Running Locally](#running-locally)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation Steps](#installation-steps)
  - [Deployment](#deployment)
    - [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
  - [Contributing](#contributing)
    - [Development Guidelines](#development-guidelines)
  - [Support](#support)
  - [Acknowledgements](#acknowledgements)

## Features

### User Authentication

- **Sign Up & Sign In** - Secure user registration and authentication
- **Password Reset** - Email-based password recovery
- **Persistent Sessions** - Automatic token refresh for seamless user experience
- **Account Deletion** - Users can delete their accounts

### Image Upload

- **Drag & Drop Upload** - Intuitive image upload flow supporting drag and drop
- **Click to Select** - Traditional file picker for image selection
- **File Size Validation** - Maximum 10 MB file size limit
- **Image Type Validation** - Ensures only valid image formats are accepted
- **Great Error Handling** - User-friendly error messages for upload failures

### Image Transformation

- **Available Transformations** - Resize, Rotate, Grayscale, and Tint
- **Transformation Ordering** - Customizable order of transformations to apply
- **Transform Transformed Images** - Ability to apply transformations to already transformed images
- **Intuitive Transformation Flow** - User-friendly interface for applying transformations
- **Real-Time Notifications** - WebSocket integration for real-time transformation result delivery

### Image Management

- **Image Gallery** - View all uploaded images with metadata
- **Filtering** - Filter images by name, size, and format
- **Sorting** - Sort images by upload date, name, size, download count, and likes count
- **Load-More Pagination** - Efficient pagination for large image collections
- **Image Details** - View detailed information about each image
- **Download Tracking** - Track download counts for images
- **Image Deletion** - Delete images with cascade deletion of transformed images

### Social Features

- **Public Images** - Make images (uploaded, transformed, and transformed-transformed) public for other users to see
- **Like System** - Like public images from other users
- **Public Gallery** - Browse public images from all users
- **Social Discovery** - Discover and interact with images shared by the community

### User Experience

- **Dark Mode** - Toggle between light and dark themes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Beautiful notification system for user feedback
- **Optimistic Updates** - Instant UI updates for better UX

### Additional Features

- **Protected Routes** - Secure page access with authentication guards
- **Real-Time Updates** - WebSocket integration for live transformation status updates
- **Image Preview** - Preview images before uploading
- **Transformation History** - View all transformations applied to an image
- **Cascade Deletion** - Automatic deletion of related transformed images

## Screenshots

For screenshots, please visit the [Bildtransformator repository](https://github.com/gideonadeti/bildtransformator/?tab=readme-ov-file#screenshots).

## Technologies Used

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with React Compiler
- **TypeScript** - Type-safe development

### State Management & Data Fetching

- **TanStack Query** - Powerful data synchronization and caching
- **Zustand** - Lightweight state management

### UI Components & Styling

- **Radix UI** - Accessible component primitives
  - Accordion, Dialog, Dropdown Menu, Label, Popover, Select, Slider, Switch, Tooltip
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme switching (dark mode)

### Forms & Validation

- **React Hook Form** - Performant forms with easy validation
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod resolver for React Hook Form

### HTTP Client

- **Axios** - Promise-based HTTP client

### Real-Time Communication

- **Socket.IO Client** - Real-time bidirectional event-based communication for transformation notifications

### File Upload

- **react-dropzone** - Drag and drop file upload component

### Notifications

- **Sonner** - Toast notification library

### Development Tools

- **Biome** - Fast formatter and linter
- **Babel React Compiler** - Optimized React compilation

## Running Locally

### Prerequisites

- Node.js (v22 or higher)
- Bun package manager (recommended) - alternatives like npm, yarn, or pnpm also work
- Backend API running (see [image-processing-service](../image-processing-service/README.md))

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API
NEXT_PUBLIC_BACKEND_BASE_URL="http://localhost:3000/api/v1"
```

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bildtransformator
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start the development server**

   ```bash
   bun run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3001`
   - The application will automatically reload when you make changes

## Deployment

### Vercel Deployment (Recommended)

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure environment variables**
   - Add `NEXT_PUBLIC_BACKEND_BASE_URL` environment variable in Vercel dashboard
   - Ensure backend URL points to your production API

4. **Deploy**
   - Click on Deploy
   - Note: Vercel will automatically deploy on every push to main branch

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and use Biome for formatting
- Use TypeScript for all new files
- Ensure responsive design works on all screen sizes
- Test dark mode compatibility
- Write meaningful component and function names
- Keep components focused and reusable

## Support

If you find this project helpful or interesting, consider supporting me:

[☕ Buy me a coffee](https://buymeacoffee.com/gideonadeti)

## Acknowledgements

This project is inspired by the [roadmap.sh Image Processing Service](https://roadmap.sh/projects/image-processing-service) project challenge.

Thanks to these technologies:

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) - Powerful data synchronization
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Socket.IO](https://socket.io/) - Real-time communication
