import type { VariantProps } from "class-variance-authority";

import { Button, type buttonVariants } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface CustomDialogFooterProps {
  normalText: string;
  pendingText: string;
  isPending: boolean;
  disabled?: boolean;
  variant?: VariantProps<typeof buttonVariants>;
  handleCancel: () => void;
  handleSubmit: () => void;
}

const CustomDialogFooter = ({
  normalText,
  pendingText,
  isPending,
  disabled,
  variant,
  handleCancel,
  handleSubmit,
}: CustomDialogFooterProps) => {
  return (
    <DialogFooter className="flex flex-row gap-2 justify-end">
      <Button
        variant="outline"
        onClick={() => handleCancel()}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        onClick={() => handleSubmit()}
        disabled={disabled || isPending}
        variant={variant?.variant}
      >
        {isPending ? (
          <>
            <Spinner />
            {pendingText}
          </>
        ) : (
          normalText
        )}
      </Button>
    </DialogFooter>
  );
};

export default CustomDialogFooter;
