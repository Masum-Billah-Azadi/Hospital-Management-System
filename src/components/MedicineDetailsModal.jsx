// src/components/MedicineDetailsModal.jsx
"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, IconButton, Typography } from "@material-tailwind/react";

const MedicineDetailsModal = ({ open, onClose, medicine, loading = false }) => {
  return (
    <Dialog open={open} handler={onClose} className="bg-light-card dark:bg-dark-card">
      <DialogHeader className="flex justify-between text-light-text-primary dark:text-dark-text-primary">
        <Typography variant="h5" color="inherit">{medicine?.brandName || "Medicine Details"}</Typography>
        <IconButton variant="text" color="blue-gray" onClick={onClose}><XMarkIcon className="h-5 w-5" /></IconButton>
      </DialogHeader>

      <DialogBody divider className="border-t border-b">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : medicine ? (
          <div className="flex flex-col gap-2 text-light-text-primary dark:text-dark-text-primary">
            <p><strong>Generic Name:</strong> {medicine.genericName || "—"}</p>
            <p><strong>Strength:</strong> {medicine.strength || "—"}</p>
            <p><strong>Manufacturer:</strong> {medicine.manufacturer || "—"}</p>
            <p><strong>Dosage Form:</strong> {medicine.dosageForm || "—"}</p>
            <p><strong>Package Container:</strong> {medicine.packageContainer || "—"}</p>
            <p><strong>Indications:</strong> {medicine.indications || medicine.indication || "Not available"}</p>
            {medicine.extra && <p><strong>Extra:</strong> {medicine.extra}</p>}
          </div>
        ) : (
          <Typography>No details available.</Typography>
        )}
      </DialogBody>

      <DialogFooter>
        <Button variant="gradient" color="green" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default MedicineDetailsModal;
