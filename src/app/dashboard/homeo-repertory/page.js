"use client";

import {
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  Input,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

const HomeoRepertorySetupPage = () => {
  const [repertories, setRepertories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // নতুন ক্যাটাগরি তৈরি করার স্টেট
  const [newCatData, setNewCatData] = useState({ category: "", order: "" });

  // নতুন লক্ষণ যোগ করার মডাল স্টেট
  const [addSymptomModal, setAddSymptomModal] = useState(false);
  const [addSympData, setAddSympData] = useState({
    categoryId: "",
    categoryName: "",
    symptomName: "",
    medicines: "",
  });

  // Edit Modals State
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editCatData, setEditCatData] = useState({
    id: "",
    name: "",
    order: "",
  });

  const [editSymptomModal, setEditSymptomModal] = useState(false);
  const [editSympData, setEditSympData] = useState({
    categoryId: "",
    symptomId: "",
    name: "",
    medicines: "",
  });

  const fetchRepertories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/homeo-repertory");
      if (res.ok) setRepertories(await res.json());
    } catch (error) {
      console.error("Failed to fetch repertories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepertories();
  }, []);

  // --- ১. নতুন ক্যাটাগরি যুক্ত করা ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/homeo-repertory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addCategory",
          category: newCatData.category,
          order: newCatData.order,
        }),
      });
      if (!res.ok) throw new Error("Failed to add category");
      setNewCatData({ category: "", order: "" });
      fetchRepertories();
    } catch (error) {
      alert("Error adding category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ২. নির্দিষ্ট ক্যাটাগরিতে নতুন লক্ষণ যুক্ত করা ---
  const handleAddSymptom = async () => {
    if (!addSympData.symptomName || !addSympData.medicines) {
      alert("লক্ষণ এবং ঔষধের নাম অবশ্যই দিতে হবে!");
      return;
    }
    try {
      const res = await fetch("/api/homeo-repertory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addSymptom",
          categoryId: addSympData.categoryId,
          symptomName: addSympData.symptomName,
          medicines: addSympData.medicines,
        }),
      });
      if (!res.ok) throw new Error("Failed to add symptom");
      setAddSymptomModal(false);
      setAddSympData({
        categoryId: "",
        categoryName: "",
        symptomName: "",
        medicines: "",
      });
      fetchRepertories();
    } catch (error) {
      alert("Error adding symptom");
    }
  };

  // --- Delete Actions ---
  const handleDeleteCategory = async (id) => {
    if (
      !window.confirm(
        "আপনি কি নিশ্চিত যে পুরো ক্যাটাগরিটি ডিলিট করতে চান? এর ভেতরের সব লক্ষণ মুছে যাবে!",
      )
    )
      return;
    try {
      await fetch(`/api/homeo-repertory?id=${id}`, { method: "DELETE" });
      fetchRepertories();
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  const handleDeleteSymptom = async (categoryId, symptomId) => {
    if (!window.confirm("লক্ষণটি ডিলিট করতে চান?")) return;
    try {
      await fetch(
        `/api/homeo-repertory?id=${categoryId}&symptomId=${symptomId}`,
        { method: "DELETE" },
      );
      fetchRepertories();
    } catch (error) {
      alert("Failed to delete symptom");
    }
  };

  // --- Update Actions ---
  const handleUpdateCategory = async () => {
    try {
      await fetch("/api/homeo-repertory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateCategory",
          id: editCatData.id,
          newCategoryName: editCatData.name,
          order: editCatData.order,
        }),
      });
      setEditCategoryModal(false);
      fetchRepertories();
    } catch (error) {
      alert("Failed to update category");
    }
  };

  const handleUpdateSymptom = async () => {
    try {
      await fetch("/api/homeo-repertory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSymptom",
          id: editSympData.categoryId,
          symptomId: editSympData.symptomId,
          symptomName: editSympData.name,
          medicines: editSympData.medicines,
        }),
      });
      setEditSymptomModal(false);
      fetchRepertories();
    } catch (error) {
      alert("Failed to update symptom");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      {/* 🌟 বর্তমান রেপার্টরি তালিকা (সবচেয়ে উপরে) 🌟 */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-transparent border-b border-gray-200 dark:border-gray-700 p-5"
        >
          <Typography
            variant="h4"
            className="font-bold text-blue-800 dark:text-blue-300"
          >
            বর্তমান রেপার্টরি তালিকা (অর্ডার অনুযায়ী)
          </Typography>
        </CardHeader>
        <CardBody className="p-6">
          <div className="flex flex-col gap-8">
            {repertories.map((cat) => (
              <div
                key={cat._id}
                className="border-2 border-blue-100 dark:border-blue-900/50 rounded-xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm"
              >
                {/* ক্যাটাগরি হেডার */}
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-blue-50 dark:bg-blue-900/30 p-4 border-b border-blue-100 dark:border-blue-900/50 gap-4">
                  <Typography className="font-bold text-2xl text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    📂 {cat.category}
                    <span className="text-sm font-medium bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full ml-2">
                      অর্ডার: {cat.order || 0}
                    </span>
                  </Typography>

                  <div className="flex gap-3">
                    {/* ✅ নতুন: লক্ষণ যোগ করার প্লাস বাটন */}
                    <Button
                      size="sm"
                      color="green"
                      className="flex items-center gap-2 px-4 py-2"
                      onClick={() => {
                        setAddSympData({
                          categoryId: cat._id,
                          categoryName: cat.category,
                          symptomName: "",
                          medicines: "",
                        });
                        setAddSymptomModal(true);
                      }}
                    >
                      <PlusCircleIcon className="h-5 w-5" />
                      লক্ষণ যোগ করুন
                    </Button>
                    <IconButton
                      variant="text"
                      color="blue"
                      className="bg-blue-50 dark:bg-blue-900/20"
                      onClick={() => {
                        setEditCatData({
                          id: cat._id,
                          name: cat.category,
                          order: cat.order || 0,
                        });
                        setEditCategoryModal(true);
                      }}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                      variant="text"
                      color="red"
                      className="bg-red-50 dark:bg-red-900/20"
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>

                {/* লক্ষণ লিস্ট */}
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                  {cat.symptoms.length > 0 ? (
                    cat.symptoms.map((symp) => (
                      <div
                        key={symp._id}
                        className="flex flex-col sm:flex-row justify-between sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <Typography className="font-semibold text-lg min-w-[200px] text-gray-800 dark:text-gray-200">
                            👉 {symp.name}
                          </Typography>
                          <Typography className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-md font-mono border border-gray-200 dark:border-gray-700 text-lg">
                            💊 {symp.medicines.join(", ")}
                          </Typography>
                        </div>
                        <div className="flex gap-2 mt-3 sm:mt-0">
                          <IconButton
                            variant="text"
                            color="blue"
                            className="w-8 h-8"
                            onClick={() => {
                              setEditSympData({
                                categoryId: cat._id,
                                symptomId: symp._id,
                                name: symp.name,
                                medicines: symp.medicines.join(", "),
                              });
                              setEditSymptomModal(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            variant="text"
                            color="red"
                            className="w-8 h-8"
                            onClick={() =>
                              handleDeleteSymptom(cat._id, symp._id)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 italic">
                      এই ক্যাটাগরিতে এখনো কোনো লক্ষণ নেই। উপরের "লক্ষণ যোগ করুন"
                      বাটনে ক্লিক করুন।
                    </div>
                  )}
                </div>
              </div>
            ))}
            {repertories.length === 0 && (
              <Typography className="text-center opacity-70 text-lg py-10">
                এখনো কোনো ডাটা যুক্ত করা হয়নি। নিচের ফর্ম থেকে ক্যাটাগরি তৈরি
                করুন।
              </Typography>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 🌟 নতুন মেইন ক্যাটাগরি যুক্ত করার ফর্ম (একেবারে নিচে) 🌟 */}
      <Card className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border-2 border-dashed border-blue-300 dark:border-blue-800 shadow-none mt-4">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none bg-transparent border-b border-gray-200 dark:border-gray-700 p-5"
        >
          <Typography
            variant="h5"
            className="font-bold text-gray-800 dark:text-gray-200"
          >
            নতুন মেইন ক্যাটাগরি তৈরি করুন
          </Typography>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col md:flex-row gap-6 items-end"
          >
            <div className="w-full md:w-[60%]">
              <Input
                label="মেইন ক্যাটাগরি (যেমন: ভয়, জ্বর) *"
                value={newCatData.category}
                onChange={(e) =>
                  setNewCatData({ ...newCatData, category: e.target.value })
                }
                color="blue"
                className="dark:text-white text-lg"
                required
              />
            </div>
            <div className="w-full md:w-[20%]">
              <Input
                type="number"
                label="অর্ডার (যেমন: 1) *"
                value={newCatData.order}
                onChange={(e) =>
                  setNewCatData({ ...newCatData, order: e.target.value })
                }
                color="blue"
                className="dark:text-white text-lg"
                required
              />
            </div>
            <div className="w-full md:w-[20%]">
              <Button
                color="blue"
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base py-3"
              >
                {isSubmitting ? "তৈরি হচ্ছে..." : "+ ক্যাটাগরি তৈরি করুন"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* ✅ Add Symptom Modal (লক্ষণ যোগ করার মডাল) */}
      <Dialog
        open={addSymptomModal}
        handler={() => setAddSymptomModal(false)}
        className="bg-white dark:bg-gray-900 text-black dark:text-white"
      >
        <DialogHeader className="border-b border-gray-200 dark:border-gray-800">
          <span className="text-blue-600 dark:text-blue-400">
            "{addSympData.categoryName}"
          </span>
          -এ নতুন লক্ষণ যোগ করুন
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5 py-6">
          <Input
            label="লক্ষণের নাম (যেমন: অন্ধকারে) *"
            value={addSympData.symptomName}
            onChange={(e) =>
              setAddSympData({ ...addSympData, symptomName: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
            required
          />
          <Input
            label="ঔষধের নাম্বারসমূহ (কমা দিয়ে, যেমন: 19, 85) *"
            value={addSympData.medicines}
            onChange={(e) =>
              setAddSympData({ ...addSympData, medicines: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
            required
          />
        </DialogBody>
        <DialogFooter className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <Button
            variant="text"
            color="red"
            onClick={() => setAddSymptomModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleAddSymptom}>
            Save Symptom
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={editCategoryModal}
        handler={() => setEditCategoryModal(false)}
        className="bg-white dark:bg-gray-900 text-black dark:text-white"
      >
        <DialogHeader>ক্যাটাগরি আপডেট করুন</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input
            label="ক্যাটাগরির নাম"
            value={editCatData.name}
            onChange={(e) =>
              setEditCatData({ ...editCatData, name: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
          />
          <Input
            type="number"
            label="অর্ডার/সিরিয়াল"
            value={editCatData.order}
            onChange={(e) =>
              setEditCatData({ ...editCatData, order: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setEditCategoryModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleUpdateCategory}>
            Update
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Symptom Modal */}
      <Dialog
        open={editSymptomModal}
        handler={() => setEditSymptomModal(false)}
        className="bg-white dark:bg-gray-900 text-black dark:text-white"
      >
        <DialogHeader>লক্ষণ ও ঔষধ আপডেট করুন</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input
            label="লক্ষণের নাম"
            value={editSympData.name}
            onChange={(e) =>
              setEditSympData({ ...editSympData, name: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
          />
          <Input
            label="ঔষধসমূহ (কমা দিয়ে)"
            value={editSympData.medicines}
            onChange={(e) =>
              setEditSympData({ ...editSympData, medicines: e.target.value })
            }
            color="blue"
            className="dark:text-white text-lg"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => setEditSymptomModal(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button color="green" onClick={handleUpdateSymptom}>
            Update
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default HomeoRepertorySetupPage;
