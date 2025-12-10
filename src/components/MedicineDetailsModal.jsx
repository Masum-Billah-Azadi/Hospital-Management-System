// src/components/MedicineDetailsModal.jsx
"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  IconButton,
  Typography,
  Input,
  Textarea,
  Spinner,
} from "@material-tailwind/react";

// ✅ Updated StarRatingDisplay — higher contrast in dark mode
const StarRatingDisplay = ({ value = 0, size = 18 }) => {
  const stars = [0, 1, 2, 3, 4];
  const normalized = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 select-none" aria-hidden>
        {stars.map((i) => {
          const fill = Math.max(0, Math.min(1, normalized - i)) * 100;

          // ✅ in light mode: gray background
          // ✅ in dark mode: lighter gray for contrast
          const baseColor = typeof window !== "undefined" && document.documentElement.classList.contains("dark")
            ? "#848484"   // brighter gray for dark mode
            : "#d1d1d1";  // standard light gray

          const style = {
            background: `linear-gradient(90deg, #ffcc40 ${fill}%, ${baseColor} ${fill}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            fontSize: size,
            fontWeight: "bold",
            lineHeight: 1,
          };

          return (
            <span key={i} style={style}>★</span>
          );
        })}
      </div>

      <div className="text-sm opacity-90">{normalized.toFixed(1)}</div>
    </div>
  );
};


const MedicineDetailsModal = ({ open, onClose, medicine, loading = false, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [ratingValue, setRatingValue] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "success" });

  useEffect(() => {
    if (medicine) {
      setEditData({ ...medicine });
      setRatingValue(
        typeof medicine.rating === "number"
          ? medicine.rating
          : medicine.rating
          ? Number(medicine.rating)
          : 0
      );
      setIsEditing(false);
    } else {
      setEditData({});
      setRatingValue(0);
    }
  }, [medicine]);

  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2000);
  };

  const setField = (k, v) => setEditData((p) => ({ ...p, [k]: v }));

  const handleRatingChange = (val) => {
    const parsed = Number(val);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, Math.min(5, parsed));
    setRatingValue(clamped);
    setField("rating", clamped);
  };

  const handleSave = async () => {
    if (!medicine || !medicine._id) {
      showToast("Invalid medicine", "error");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...editData };
      if (payload.rating !== undefined) payload.rating = Number(payload.rating);

      const res = await fetch(`/api/medicines/${medicine._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updated = await res.json();
      setEditData(updated);
      setRatingValue(updated.rating || 0);
      setIsEditing(false);

      if (typeof onUpdate === "function") onUpdate({ ...updated });

      showToast("Updated successfully");
    } catch (err) {
      console.error("Failed to update medicine:", err);
      showToast("Update failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        handler={onClose}
        size="lg"
        className="max-w-lg mx-auto bg-light-card dark:bg-dark-card dark:text-white"
      >
        <DialogHeader className="flex items-center justify-between text-light-text-primary dark:text-white">
          <Typography variant="h5" className="font-semibold">
            {medicine?.brandName || "Medicine Details"}
          </Typography>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <IconButton variant="text" onClick={() => setIsEditing(true)}>
                <PencilIcon className="h-5 w-5 text-light-text-secondary dark:text-gray-300" />
              </IconButton>
            )}
            <IconButton variant="text" onClick={onClose}>
              <XMarkIcon className="h-5 w-5 text-light-text-secondary dark:text-gray-300" />
            </IconButton>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[70vh] overflow-y-auto px-4 dark:text-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-8 w-8" />
            </div>
          ) : !isEditing ? (
            <div className="flex flex-col gap-3 py-2">
              <div className="flex items-center gap-4">
                <StarRatingDisplay value={ratingValue} size={18} />
                <div className="text-sm opacity-70">({ratingValue.toFixed(1)})</div>
              </div>

              <p><strong>Generic:</strong> {medicine?.genericName || "—"}</p>
              <p><strong>Strength:</strong> {medicine?.strength || "—"}</p>
              <p><strong>Price:</strong> {medicine?.price || "—"}</p>
              <p><strong>Manufacturer:</strong> {medicine?.manufacturer || "—"}</p>

              <p>
                <strong>Indications:</strong>{" "}
                {isExpanded
                  ? medicine?.indications || "—"
                  : ((medicine?.indications || "").slice(0, 120) || "—") +
                    ((medicine?.indications || "").length > 120 ? "..." : "")}
              </p>

              {isExpanded && (
                <>
                  <p><strong>Dosage Form:</strong> {medicine?.dosageForm || "—"}</p>
                  <p><strong>Package Container:</strong> {medicine?.packageContainer || "—"}</p>
                  {medicine?.efficacy && <p><strong>Efficacy:</strong> {medicine.efficacy}</p>}
                  {medicine?.sideEffects && <p><strong>Side Effects:</strong> {medicine.sideEffects}</p>}
                </>
              )}

              <div className="flex justify-center mt-4">
                <Button
                  size="sm"
                  variant="outlined"
                  className="rounded-full shadow-sm border-gray-400 text-gray-800 dark:border-gray-300 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setIsExpanded((s) => !s)}
                >
                  {isExpanded ? "View Less" : "View More"}
                </Button>
              </div>
            </div>
          ) : (
            // ---------- EDIT MODE (DARK THEME FIXES BELOW) ----------
            <div className="flex flex-col gap-4 py-2 dark:text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["brandName", "Brand Name"],
                  ["genericName", "Generic Name"],
                  ["strength", "Strength"],
                  ["price", "Price"],
                  ["dosageForm", "Dosage Form"],
                  ["packageContainer", "Package Container"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block mb-1 font-semibold dark:text-gray-200">
                      {label}
                    </label>
                    <Input
                      value={editData[key] || ""}
                      onChange={(e) => setField(key, e.target.value)}
                      className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500"
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-gray-200">
                  Indications
                </label>
                <Textarea
                  value={editData.indications || ""}
                  onChange={(e) => setField("indications", e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-gray-200">
                  Efficacy
                </label>
                <Textarea
                  value={editData.efficacy || ""}
                  onChange={(e) => setField("efficacy", e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-gray-200">
                  Side Effects
                </label>
                <Textarea
                  value={editData.sideEffects || ""}
                  onChange={(e) => setField("sideEffects", e.target.value)}
                  className="bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500"
                />
              </div>

              {/* Rating input */}
              <div>
                <label className="block mb-1 font-semibold dark:text-gray-200">
                  Rating
                </label>
                <div className="flex items-center gap-3">
                  <StarRatingDisplay value={ratingValue} size={20} />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={Number(ratingValue).toFixed(1)}
                    onChange={(e) => handleRatingChange(e.target.value)}
                    className="w-20 px-2 py-1 border rounded-md text-center
                  bg-white dark:bg-gray-800 dark:text-white dark:border-gray-500"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="flex gap-2 justify-end px-4 py-3">
          {isEditing ? (
            <>
              <Button
                variant="text"
                color="red"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ ...medicine });
                  setRatingValue(medicine?.rating || 0);
                }}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={handleSave}
                disabled={isSaving}
                className="dark:text-white"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button
              variant="gradient"
              color="blue-gray"
              onClick={onClose}
              className="dark:text-white"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Toast */}
      <div
        aria-live="polite"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6"
        style={{ zIndex: 60 }}
      >
        <div className="w-full flex flex-col items-center gap-2">
          <div
            className={`transform transition-all duration-300 pointer-events-auto max-w-xs w-full rounded-md shadow-lg overflow-hidden ${
              toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            role="status"
          >
            <div
              className={`p-3 ${
                toast.type === "error" ? "bg-red-500" : "bg-green-600"
              } text-white text-sm`}
            >
              {toast.text}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicineDetailsModal;
