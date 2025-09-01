//src\lib\dbConnect.js
import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    console.log("Already connected to the database.");
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log("Use previous connection to the database.");
      return;
    }
    await mongoose.disconnect();
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("New connection to the database.");
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    // process.exit(1); // Optional: exit process on connection failure
  }
}

export default dbConnect;