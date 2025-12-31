"use client";

import { DialogContent as BaseDialogContent } from "@/components/ui/dialog";

const CustomDialogContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseDialogContent>) => {
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
