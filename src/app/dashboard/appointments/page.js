// src/app/dashboard/appointments/page.js
"use client";

import { useState, useEffect } from 'react';
import { 
    Typography, 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Avatar, 
    Chip,
    Spinner,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input
} from '@material-tailwind/react';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [scheduledTime, setScheduledTime] = useState('');

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/appointments/doctor');
            if (!res.ok) throw new Error('Failed to fetch appointments');
            const data = await res.json();
            setAppointments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);
    
    const handleUpdateStatus = async (appointmentId, status, time = null) => {
        try {
            const res = await fetch('/api/appointments/update-status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, status, scheduledTime: time }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            if (status === 'rejected') {
                setAppointments(prev => prev.filter(app => app._id !== appointmentId));
            } else {
                setAppointments(prev => 
                    prev.map(app => 
                        app._id === appointmentId ? { ...app, status, scheduledTime: time } : app
                    )
                );
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleAddPatient = async (patientId) => {
        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to add patient.');
            }
            alert('Patient added to your list successfully!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleAcceptClick = (appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };
    
    const handleModalSubmit = (e) => {
        e.preventDefault();
        if (!scheduledTime) {
            alert("Please set a time.");
            return;
        }
        handleUpdateStatus(selectedAppointment._id, 'accepted', scheduledTime);
        closeModal();
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAppointment(null);
        setScheduledTime('');
    };
    
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending': return 'amber';
            case 'accepted': return 'green';
            case 'rejected': return 'red';
            default: return 'blue-gray';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner className="h-12 w-12" /></div>;
    if (error) return <Typography color="red">Error: {error}</Typography>;

    return (
        <>
            <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Typography variant="h5" className="text-light-text-primary dark:text-dark-text-primary">
                            My Appointments
                        </Typography>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="hidden md:flex items-center p-4 bg-gray-50 dark:bg-gray-800/50">
                        <Typography variant="small" className="font-bold flex-[2] opacity-70">Patient Name</Typography>
                        <Typography variant="small" className="font-bold flex-1 opacity-70">Date</Typography>
                        <Typography variant="small" className="font-bold flex-[3] opacity-70">Reason</Typography>
                        <Typography variant="small" className="font-bold flex-1 text-center opacity-70">Status</Typography>
                        <Typography variant="small" className="font-bold flex-[2] text-center opacity-70">Actions</Typography>
                    </div>
                    <div>
                        {appointments.length > 0 ? (
                            appointments.map(app => (
                                <div key={app._id} className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-2 md:mb-0 flex-[2]">
                                        <Avatar 
                                            src={app.patient?.image || `https://ui-avatars.com/api/?name=${app.patient?.name.replace(/\s/g, '+')}`} 
                                            alt={app.patient?.name} 
                                            size="sm" 
                                        />
                                        <Typography color="inherit" className="font-semibold">{app.patient.name}</Typography>
                                    </div>
                                    <div className="mb-2 md:mb-0 flex-1 pr-4"><Typography variant="small" color="inherit">{new Date(app.appointmentDate).toLocaleDateString()}</Typography></div>
                                    <div className="mb-2 md:mb-0 flex-[3]"><Typography variant="small" color="inherit">{app.reason}</Typography></div>
                                    <div className="mb-2 md:mb-0 flex-1 flex justify-start md:justify-center">
                                        <Chip size="sm" value={app.status} color={getStatusChipColor(app.status)} />
                                    </div>
                                    <div className="flex gap-2 justify-start md:justify-center flex-[2] w-full md:w-auto">
                                        {app.status === 'pending' && (
                                            <>
                                                <Button size="sm" color="green" onClick={() => handleAcceptClick(app)}>Accept</Button>
                                                <Button size="sm" variant="outlined" color="red" onClick={() => handleUpdateStatus(app._id, 'rejected')}>Reject</Button>
                                            </>
                                        )}
                                        {app.status === 'accepted' && (
                                            <Button size="sm" color="blue" onClick={() => handleAddPatient(app.patient._id)}>Add Patient</Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-10"><Typography className="opacity-80">No appointments found.</Typography></div>
                        )}
                    </div>
                </CardBody>
            </Card>

            <Dialog open={isModalOpen} handler={closeModal} className="bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                <DialogHeader className="text-light-text-primary dark:text-dark-text-primary">Set Appointment Time</DialogHeader>
                <form onSubmit={handleModalSubmit}>
                    <DialogBody>
                        <Typography color="inherit" className="mb-4">
                            Please set a time for the appointment with: <strong>{selectedAppointment?.patient?.name}</strong>
                        </Typography>
                        <Input
                            crossOrigin={""}
                            label="Scheduled Time (e.g., 3:00 PM - 3:30 PM)"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required
                            color="blue-gray"
                            className="dark:text-white"
                            labelProps={{
                                className: "peer-focus:!text-blue-500 dark:peer-focus:!text-blue-500"
                            }}
                        />
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="text" color="red" onClick={closeModal} className="mr-1">
                            <span>Cancel</span>
                        </Button>
                        <Button variant="gradient" color="green" type="submit">
                            <span>Confirm Appointment</span>
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>
        </>
    );
};

export default AppointmentsPage;