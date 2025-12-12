import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  normalText: string;
  pendingText: string;
  isDisabled?: boolean;
  isPending: boolean;
}

const SubmitButton = ({
  normalText,
  pendingText,
  isDisabled,
  isPending,
}: SubmitButtonProps) => (
  <Button
    disabled={isDisabled || isPending}
    type="submit"
    className="w-full"
    size="lg"
  >
    {isPending ? (
      <>
        <Loader className="animate-spin" />
        {pendingText}
      </>
    ) : (
      normalText
    )}
  </Button>
);

export default SubmitButton;
