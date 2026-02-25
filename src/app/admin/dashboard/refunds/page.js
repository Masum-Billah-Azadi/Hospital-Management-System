"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

const TABLE_HEAD = [
  "Patient Info",
  "Doctor Info",
  "Date & Reason",
  "Refund Status",
  "Action",
];

export default function RefundsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/refunds");
      if (!res.ok) throw new Error("Failed to fetch rejected appointments");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleMarkRefunded = async (appointmentId) => {
    const confirm = window.confirm(
      "Are you sure you have refunded the money to this patient?",
    );
    if (!confirm) return;

    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setAppointments((prev) =>
        prev.map((app) =>
          app._id === appointmentId ? { ...app, isRefunded: true } : app,
        ),
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  if (error) return <Typography color="red">Error: {error}</Typography>;

  return (
    <Card className="h-full w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
      <CardHeader
        floated={false}
        shadow={false}
        className="rounded-none bg-transparent mb-4"
      >
        <div className="p-4">
          <Typography
            variant="h5"
            className="text-light-text-primary dark:text-dark-text-primary"
          >
            Refund Management
          </Typography>
          <Typography variant="small" className="text-gray-500 mt-1">
            List of rejected appointments that require a refund.
          </Typography>
        </div>
      </CardHeader>

      <CardBody className="p-0 overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 dark:border-gray-700 bg-blue-gray-50 dark:bg-gray-800/50 py-3 px-4"
                >
                  <Typography
                    variant="small"
                    className="font-bold leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((app, index) => {
                const isLast = index === appointments.length - 1;
                const classes = isLast
                  ? "py-3 px-4"
                  : "py-3 px-4 border-b border-blue-gray-50 dark:border-gray-700";

                return (
                  <tr
                    key={app._id}
                    className="hover:bg-blue-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className={classes}>
                      {/* ✅ এখানে ছবি এবং ফোন নাম্বার সুন্দর করে সাজানো হয়েছে */}
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={
                            app.patient?.image ||
                            `https://ui-avatars.com/api/?name=${app.patient?.name.replace(/\s/g, "+")}`
                          }
                          alt={app.patient?.name}
                          size="sm"
                          className="w-10 h-10"
                        />
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="inherit"
                            className="font-semibold"
                          >
                            {app.patient?.name}
                          </Typography>
                          <Typography
                            variant="small"
                            className="text-gray-500 text-xs"
                          >
                            {app.patient?.email}
                          </Typography>
                          {app.patient?.phone ? (
                            <Typography
                              variant="small"
                              className="text-blue-gray-700 dark:text-gray-300 font-medium text-xs mt-0.5"
                            >
                              📞 {app.patient.phone}
                            </Typography>
                          ) : (
                            <Typography
                              variant="small"
                              className="text-red-400 text-[10px] mt-0.5"
                            >
                              No Phone Provided
                            </Typography>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="inherit"
                        className="font-medium"
                      >
                        Dr. {app.doctor?.name}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="inherit"
                          className="font-medium"
                        >
                          {new Date(app.appointmentDate).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="small"
                          className="text-gray-500 text-xs max-w-[150px] truncate"
                          title={app.reason}
                        >
                          {app.reason}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          value={app.isRefunded ? "Refunded" : "Pending Refund"}
                          color={app.isRefunded ? "green" : "amber"}
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      {!app.isRefunded ? (
                        <Button
                          size="sm"
                          color="blue"
                          onClick={() => handleMarkRefunded(app._id)}
                        >
                          Mark Refunded
                        </Button>
                      ) : (
                        <Typography
                          variant="small"
                          color="green"
                          className="font-medium italic text-xs"
                        >
                          Refund Completed
                        </Typography>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Typography className="opacity-80">
                    No rejected appointments found.
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
