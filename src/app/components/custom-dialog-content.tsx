"use client";

import {
  DialogContent as BaseDialogContent,
  type DialogContentProps,
} from "@/components/ui/dialog";

const CustomDialogContent = ({
  className,
  children,
  ...props
}: DialogContentProps) => {
  return (
    <BaseDialogContent
      className={className}
      showCloseButton={false}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      {...props}
    >
      {children}
    </BaseDialogContent>
  );
};

export default CustomDialogContent;

