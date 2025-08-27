// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
        return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
    }

    // ফাইলটিকে বাইটে রূপান্তর
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public ফোল্ডারে একটি ইউনিক নামে ফাইল সেভ করা
    const filename = `${Date.now()}_${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filePath, buffer);

    // ক্লায়েন্টকে ছবির URL পাঠানো
    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ message: "File uploaded successfully.", url: publicUrl }, { status: 200 });
}