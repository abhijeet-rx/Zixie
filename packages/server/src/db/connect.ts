import mongoose from 'mongoose';

let connectionPromise: Promise<typeof mongoose.connection> | undefined;

export async function connectToDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('MONGODB_URI is required. Set it in the server environment.');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  mongoose.set('bufferCommands', false);
  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => mongoose.connection)
    .finally(() => { connectionPromise = undefined; });
  return connectionPromise;
}
