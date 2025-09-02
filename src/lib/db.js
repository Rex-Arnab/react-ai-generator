// lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        // console.log('Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        // console.log('Creating new database connection');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('Database connected successfully!');
            return mongoose;
        }).catch(err => {
            console.error("Database connection error:", err);
            cached.promise = null; // Reset promise on error
            throw err; // Rethrow error
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null; // Ensure promise is cleared on error during await
        throw e;
    }
    return cached.conn;
}

export default dbConnect;