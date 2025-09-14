// src/app/api/report/route.js

import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
    }

    // ফাইলটিকে বাইটে রূপান্তর
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // একটি ইউনিক ফাইল নাম তৈরি
    const filename = Date.now() + '-' + file.name.replace(/\s/g, '_');
    const savePath = path.join(process.cwd(), 'public/reports', filename);

    // ফাইলটি সার্ভারে লেখা হচ্ছে
    await writeFile(savePath, buffer);
    console.log(`File uploaded to: ${savePath}`);

    // ফাইলের পাবলিক URL ফেরত পাঠানো হচ্ছে
    const publicUrl = `/reports/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl, fileName: file.name });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, message: 'File upload failed.' }, { status: 500 });
  }
}