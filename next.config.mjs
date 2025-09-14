/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            port: '',
            pathname: '/**',
        },
        // যদি অন্য কোনো ডোমেইন থেকে ছবি লোড করার প্রয়োজন হয়, এখানে যোগ করতে পারেন
        ],
        domains: ['ui-avatars.com', 'lh3.googleusercontent.com'],
    },
};

export default nextConfig;
