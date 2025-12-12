"use client";

import useAuth from "@/app/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomDialogFooter from "./custom-dialog-footer";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog = ({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) => {
  const { deleteAccountMutation } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be
            undone. This will permanently delete your account and your data.
          </DialogDescription>
        </DialogHeader>
        <CustomDialogFooter
          normalText="Delete Account"
          pendingText="Deleting Account..."
          isPending={deleteAccountMutation.isPending}
          variant={{ variant: "destructive" }}
          handleCancel={() => onOpenChange(false)}
          handleSubmit={() => deleteAccountMutation.mutate({ onOpenChange })}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog;
