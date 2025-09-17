// src/app/admin/dashboard/page.js
"use client";
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.scss'; // SCSS ফাইল তৈরি করতে হবে

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        fetchUsers(); // তালিকা রিফ্রেশ করার জন্য
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}> {/* **নতুন:** হেডার সেকশন */}
                <h1>Admin Dashboard - User Management</h1>
                <button 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className={styles.logoutButton}
                >
                    Logout
                </button>
                <button className={styles.AdminButton}>
                    <a href="http://anirban.lovestoblog.com/admin/login.php" target="_blank" rel="noopener noreferrer">
                            Blood Bank Admin
                        </a>
                </button>
                
            </div>
            <table className={styles.userTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <select 
                                    defaultValue={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;