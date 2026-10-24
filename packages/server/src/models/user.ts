import mongoose from 'mongoose';

export interface UserRecord {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<UserRecord>({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true, versionKey: false });

export const UserModel: mongoose.Model<UserRecord> =
  (mongoose.models.User as mongoose.Model<UserRecord> | undefined)
  ?? mongoose.model<UserRecord>('User', userSchema);
