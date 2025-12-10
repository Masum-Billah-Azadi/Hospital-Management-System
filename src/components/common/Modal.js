// src/components/common/Modal.js
"use client";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen} 
      handler={onClose} 
      className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary"
    >
      <DialogHeader className="flex justify-between items-center">
        <Typography variant="h5" color="inherit">
          {title || ''}
        </Typography>
        <IconButton
          color="blue-gray"
          size="sm"
          variant="text"
          onClick={onClose}
        >
          <XMarkIcon strokeWidth={2} className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      <DialogBody divider className="border-t border-b border-gray-300 dark:border-gray-700">
        {children}
      </DialogBody>
      {/* যদি ফুটার পাস করা হয়, তবেই এটি দেখা যাবে */}
      {footer && (
        <DialogFooter>{footer}</DialogFooter>
      )}
    </Dialog>
  );
};

export default Modal;