// src/app/patient-dashboard/doctors/page.js
"use client";

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { 
    Typography, 
    Input, 
    Card, 
    CardBody, 
    CardFooter, 
    Avatar, 
    Button, 
    Spinner,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem
} from '@material-tailwind/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const specialties = [
    "MEDICINE", "OBSTETRICS & GYNECOLOGY", "PAEDIATRIC MEDICINE", 
    "GENERAL & LAPAROSCOPIC SURGERY", "ORTHOPEDICS", "CARDIOLOGY", 
    "ENT", "NEURO MEDICINE", "RADIOLOGY & IMAGING", "ONCOLOGY"
];

const FindDoctorsPage = () => {
    const [doctorProfiles, setDoctorProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/doctors?designation=${encodeURIComponent(selectedDesignation)}&name=${encodeURIComponent(searchTerm)}`);
            const data = await res.json();
            setDoctorProfiles(data.filter(profile => profile.user));
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        } finally {
            setLoading(false);
        }
    }, [selectedDesignation, searchTerm]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    return (
        <div className="flex flex-col gap-6">
            <Card className="w-full bg-light-card dark:bg-dark-card">
                <CardBody>
                    <Typography variant="h5" className="mb-4 text-light-text-primary dark:text-dark-text-primary">
                        Find Your Doctor
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Menu>
                            <MenuHandler>
                                <Button
                                    variant="outlined"
                                    // পরিবর্তন: color="blue-gray" সরিয়ে class দিয়ে রঙ নিয়ন্ত্রণ করা হয়েছে
                                    className="w-full flex justify-between items-center border-gray-400 text-light-text-primary dark:text-dark-text-primary dark:border-dark-text-secondary"
                                >
                                    {selectedDesignation || "All Specialties"}
                                    <ChevronDownIcon
                                        strokeWidth={2.5}
                                        className={`h-4 w-4 transition-transform`}
                                    />
                                </Button>
                            </MenuHandler>
                            <MenuList className="w-full md:w-72 bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary border-gray-300 dark:border-gray-700">
                                <MenuItem onClick={() => setSelectedDesignation('')}>All Specialties</MenuItem>
                                {specialties.map(specialty => (
                                    <MenuItem key={specialty} onClick={() => setSelectedDesignation(specialty)}>
                                        {specialty}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                        
                        {/* ===== Input পরিবর্তন ===== */}
                        <Input 
                            crossOrigin={""} 
                            label="Search by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            color="blue-gray"
                            className="dark:text-white"
                            // পরিবর্তন: placeholder/label এর রঙ ঠিক করার জন্য labelProps যোগ করা হয়েছে
                            labelProps={{
                                className: "text-light-text-secondary dark:text-dark-text-secondary"
                            }}
                        />
                    </div>
                </CardBody>
            </Card>

            <main>
                {loading ? ( <div className="flex justify-center py-10"><Spinner className="h-12 w-12" /></div> ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {doctorProfiles.length > 0 ? doctorProfiles.map(profile => (
                            <Card key={profile._id} className="flex flex-col text-center bg-light-card dark:bg-dark-card text-light-text-primary dark:text-dark-text-primary">
                                <CardBody className="flex flex-col items-center flex-1 p-4">
                                    <Avatar src={profile.user.image || `https://ui-avatars.com/api/?name=${profile.user.name.replace(/\s/g, '+')}&background=random`} alt={`Dr. ${profile.user.name}`} size="xxl" className="mb-4"/>
                                    <Typography variant="h6" color="inherit">Dr. {profile.user.name}</Typography>
                                    <Typography color="blue" textGradient className="font-medium mb-4 text-sm">
                                        {profile.designation || 'Doctor'}
                                    </Typography>
                                </CardBody>
                                <CardFooter className="pt-0 p-4">
                                    <Link href={`/patient-dashboard/book-appointment/${profile.user._id}`}>
                                        <Button color="blue" fullWidth>Book Appointment</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )) : ( <div className="col-span-full text-center py-10"><Typography className="text-light-text-secondary dark:text-dark-text-secondary">No doctors found.</Typography></div> )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FindDoctorsPage;