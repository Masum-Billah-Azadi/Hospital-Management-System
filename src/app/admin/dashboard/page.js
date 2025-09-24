// src/app/admin/dashboard/page.js
"use client";
import { Avatar, Card, CardBody, CardHeader, Option, Select, Spinner, Typography } from "@material-tailwind/react";
import { useEffect, useState } from 'react';
import { AdminNavbar } from './AdminNavbar';
import { AdminProfile } from './AdminProfile';
import { AdminSidebar } from './AdminSidebar';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        fetchUsers();
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
            <div className="lg:hidden sticky top-0 z-50 bg-light-bg dark:bg-dark-bg">
                <div className="p-2"><AdminNavbar /></div>
            </div>
            <div className="flex gap-4 p-4">
                <div className="hidden lg:block"><AdminSidebar /></div>
                <main className="flex-1 min-w-0">
                    <Typography variant="h3" className="mb-4 hidden lg:block text-light-text-primary dark:text-dark-text-primary">User Management</Typography>
                    
                    <Card className="w-full bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                    <CardHeader floated={false} shadow={false} className="rounded-none bg-transparent">
                        <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-300 dark:border-blue-gray-100/20">
                            
                            {/* The color="inherit" prop has been removed and a className was added */}
                            <Typography variant="h6" className="flex-1 text-light-text-primary dark:text-dark-text-primary">
                                User Info
                            </Typography>

                            {/* The color="inherit" prop has been removed and a className was added */}
                            <Typography variant="h6" className="w-48 text-center text-light-text-primary dark:text-dark-text-primary">
                                Current Role
                            </Typography>
                            
                            {/* The color="inherit" prop has been removed and a className was added */}
                            <Typography variant="h6" className="w-48 text-center text-light-text-primary dark:text-dark-text-primary">
                                Change Role
                            </Typography>

                        </div>
                    </CardHeader>
                        <CardBody className="p-0">
                            {loading ? ( <div className="..."><Spinner /></div> ) : (
                                <div>
                                    {users.map((user) => (
                                        <div key={user._id} className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-blue-gray-100/20 gap-4">
                                            <div className="flex items-center gap-4 flex-1 w-full">
                                                <Avatar src={user.image || `...`} alt={user.name} />
                                                <div>
                                                    <Typography variant="small" color="inherit" className="font-bold">{user.name}</Typography>
                                                    <Typography variant="small" color="inherit" className="opacity-80">{user.email}</Typography>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-48 text-left md:text-center">
                                                <Typography variant="small" className="md:hidden font-bold opacity-70">Current Role:</Typography>
                                                <Typography variant="small" color="inherit">{user.role}</Typography>
                                            </div>
                                            <div className="w-full md:w-48">
                                                 <Select
                                                    label="Change Role"
                                                    value={user.role}
                                                    onChange={(newRole) => handleRoleChange(user._id, newRole)}
                                                    className="text-light-text-primary dark:text-dark-text-primary"
                                                    labelProps={{ className: "before:content-none after:content-none" }}
                                                    menuProps={{ className: "bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary" }}
                                                >
                                                    <Option value="patient">Patient</Option>
                                                    <Option value="doctor">Doctor</Option>
                                                    <Option value="admin">Admin</Option>
                                                </Select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </main>
                <div className="hidden lg:block"><AdminProfile /></div>
            </div>
        </div>
    );
};

export default AdminDashboard;