// src/lib/mongodbPresc.js
import mongoose from "mongoose";

const uri = process.env.MONGODB_PRESC_URI;
const dbName = process.env.MONGODB_PRESC_DB;

if (!uri) {
  throw new Error("MONGODB_PRESC_URI is not set");
}

let cached = global.mongoosePresc;

if (!cached) {
  cached = global.mongoosePresc = { conn: null, promise: null };
}

export default async function connectPrescDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // createConnection ব্যবহার করছি যাতে main DB থেকে আলাদা থাকে
    cached.promise = mongoose
      .createConnection(uri, { dbName, bufferCommands: false })
      .asPromise();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

