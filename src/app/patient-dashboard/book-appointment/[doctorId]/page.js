// "use client";

// import {
//   Avatar,
//   Button,
//   Card,
//   CardBody,
//   Input,
//   Spinner,
//   Textarea,
//   Typography,
// } from "@material-tailwind/react";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// const BookingPageLayout = ({ children }) => {
//   return (
//     <div className="min-h-screen w-full flex justify-center items-center bg-light-bg dark:bg-dark-bg p-4">
//       {children}
//     </div>
//   );
// };

// const BookingPage = () => {
//   const [doctor, setDoctor] = useState(null);
//   const [date, setDate] = useState("");
//   const [reason, setReason] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const params = useParams();
//   const { doctorId } = params;

//   // ডক্টরের তথ্য আনা
//   useEffect(() => {
//     if (doctorId) {
//       const fetchDoctorDetails = async () => {
//         try {
//           const res = await fetch(`/api/doctors/${doctorId}`);
//           if (!res.ok) throw new Error("Doctor not found");
//           const data = await res.json();
//           setDoctor(data);
//         } catch (err) {
//           setError(err.message);
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchDoctorDetails();
//     }
//   }, [doctorId]);

//   const getTodayString = () => new Date().toISOString().split("T")[0];

//   const handlePayAndBook = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError("");

//     if (!date || !reason) {
//       setError("Please select a date and reason.");
//       setSubmitting(false);
//       return;
//     }

//     try {
//       // আমরা নাম/মোবাইল পাঠাচ্ছি না, শুধু অ্যাপয়েন্টমেন্টের তথ্য পাঠাচ্ছি
//       // ব্যাকএন্ড সেশন থেকে বাকি সব বের করে নেবে
//       const res = await fetch("/api/payment/init", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: doctor.fees || 500,
//           appointmentId: doctorId,
//           appointmentDate: date,
//           reason: reason,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.error || "Failed to initiate payment.");

//       if (data.url) {
//         window.location.href = data.url;
//       } else {
//         setError("Payment gateway link generation failed.");
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const content = () => {
//     if (loading)
//       return (
//         <div className="flex justify-center p-10">
//           <Spinner className="h-12 w-12" />
//         </div>
//       );
//     if (!doctor)
//       return (
//         <Typography color="red" className="p-10">
//           {error || "Doctor not found."}
//         </Typography>
//       );

//     return (
//       <Card className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
//         <CardBody>
//           <div className="flex flex-col items-center text-center mb-6">
//             <Avatar
//               src={doctor.user.image || `/default-avatar.png`}
//               alt={`Dr. ${doctor.user.name}`}
//               size="xxl"
//               className="mb-4"
//             />
//             <Typography variant="h5">Book an Appointment with</Typography>
//             <Typography variant="h4" className="font-bold">
//               Dr. {doctor.user.name}
//             </Typography>
//             <Typography color="blue">{doctor.designation}</Typography>
//             <div className="mt-2 bg-blue-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
//               <Typography className="font-bold text-blue-600">
//                 Consultation Fee: ৳ {doctor.fees || 500}
//               </Typography>
//             </div>
//           </div>

//           <form onSubmit={handlePayAndBook} className="flex flex-col gap-6">
//             <Input
//               crossOrigin={""}
//               type="date"
//               label="Preferred Date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               required
//               color="blue-gray"
//               className="dark:text-white"
//               min={getTodayString()}
//             />
//             <Textarea
//               label="Reason for Visit"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               required
//               color="blue-gray"
//               className="dark:text-white"
//               placeholder="Describe your problem briefly..."
//             />

//             {error && (
//               <Typography color="red" className="text-center text-sm">
//                 {error}
//               </Typography>
//             )}

//             <Button
//               type="submit"
//               color="green"
//               fullWidth
//               disabled={submitting}
//               className="mt-2 text-md"
//             >
//               {submitting ? (
//                 <Spinner className="h-4 w-4 mx-auto" />
//               ) : (
//                 `Pay ৳${doctor.fees || 500} & Book Appointment`
//               )}
//             </Button>

//             <Typography
//               variant="small"
//               className="text-center text-gray-500 mt-2"
//             >
//               Secure Payment via SSLCommerz (Sandbox)
//             </Typography>
//           </form>
//         </CardBody>
//       </Card>
//     );
//   };

//   return <BookingPageLayout>{content()}</BookingPageLayout>;
// };

// export default BookingPage;
"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BookingPageLayout = ({ children }) => (
  <div className="min-h-screen w-full flex justify-center items-center bg-light-bg dark:bg-dark-bg p-4">
    {children}
  </div>
);

const BookingPage = () => {
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  // ✅ নতুন দুটি স্টেট: সিলেক্ট করা স্লট এবং বুক হওয়া স্লটের জন্য
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();
  const { doctorId } = params;

  // ডক্টরের তথ্য আনা
  useEffect(() => {
    if (doctorId) {
      const fetchDoctorDetails = async () => {
        try {
          const res = await fetch(`/api/doctors/${doctorId}`);
          if (!res.ok) throw new Error("Doctor not found");
          const data = await res.json();
          setDoctor(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctorDetails();
    }
  }, [doctorId]);

  // ✅ ডেট চেঞ্জ হলে বুকড স্লটগুলো API থেকে নিয়ে আসা
  useEffect(() => {
    if (date && doctorId) {
      const fetchBookedSlots = async () => {
        try {
          const res = await fetch("/api/appointments/check-slots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorId, date }),
          });
          const data = await res.json();
          if (res.ok) {
            setBookedSlots(data.bookedSlots || []);
          }
        } catch (err) {
          console.error("Failed to fetch booked slots", err);
        }
      };
      fetchBookedSlots();
      setSelectedSlot(""); // ডেট পাল্টালে আগের সিলেক্ট করা স্লট মুছে যাবে
    }
  }, [date, doctorId]);

  const handlePayAndBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // স্লট সিলেক্ট করেছে কিনা চেক করা
    if (!date || !reason || !selectedSlot) {
      setError("Please select a date, time slot, and provide a reason.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: doctor.fees || 500,
          appointmentId: doctorId,
          appointmentDate: date,
          timeSlot: selectedSlot, // ✅ টাইম স্লট পাঠানো হচ্ছে
          reason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to initiate payment.");
      if (data.url) window.location.href = data.url;
      else setError("Payment gateway link generation failed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const content = () => {
    if (loading)
      return (
        <div className="flex justify-center p-10">
          <Spinner className="h-12 w-12" />
        </div>
      );
    if (!doctor)
      return (
        <Typography color="red" className="p-10">
          {error || "Doctor not found."}
        </Typography>
      );

    const availableSlots = doctor.availableSlots || [];

    return (
      <Card className="w-full max-w-2xl mx-auto bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
        <CardBody>
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar
              src={doctor.user?.image || `/default-avatar.png`}
              alt={`Dr. ${doctor.user?.name}`}
              size="xxl"
              className="mb-4"
            />
            <Typography variant="h5">Book an Appointment with</Typography>
            <Typography variant="h4" className="font-bold">
              Dr. {doctor.user?.name}
            </Typography>
            <Typography color="blue">{doctor.designation}</Typography>
            <div className="mt-2 bg-blue-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <Typography className="font-bold text-blue-600">
                Consultation Fee: ৳ {doctor.fees || 500}
              </Typography>
            </div>
          </div>

          <form onSubmit={handlePayAndBook} className="flex flex-col gap-6">
            <Input
              crossOrigin={""}
              type="date"
              label="Preferred Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              color="blue-gray"
              className="dark:text-white"
              min={getTodayString()}
            />

            {/* ✅ Time Slot UI */}
            {date && (
              <div className="flex flex-col gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Typography variant="h6" className="text-sm">
                  Select a Time Slot for {date}
                </Typography>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {availableSlots.map((slot, index) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <Button
                          key={index}
                          type="button"
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                          disabled={isBooked}
                          variant={isSelected ? "filled" : "outlined"}
                          color={
                            isBooked ? "red" : isSelected ? "green" : "blue"
                          }
                          className={`p-2 text-sm ${isBooked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {slot} {isBooked && "(Booked)"}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <Typography color="red" className="text-sm">
                    No time slots available for this doctor.
                  </Typography>
                )}
              </div>
            )}

            <Textarea
              label="Reason for Visit (Briefly describe your problem...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              color="blue-gray"
              className="dark:text-white"
            />

            {error && (
              <Typography color="red" className="text-center text-sm">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              color="green"
              fullWidth
              disabled={submitting || !selectedSlot}
              className="mt-2 text-md"
            >
              {submitting ? (
                <Spinner className="h-4 w-4 mx-auto" />
              ) : (
                `Pay ৳${doctor.fees || 500} & Book Appointment`
              )}
            </Button>
          </form>
        </CardBody>
      </Card>
    );
  };

  return <BookingPageLayout>{content()}</BookingPageLayout>;
};

export default BookingPage;
