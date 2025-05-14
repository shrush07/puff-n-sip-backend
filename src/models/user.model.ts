import { Schema, model } from 'mongoose';

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    address: string;
    isAdmin: boolean;
    token: string; 
    role?: 'admin' | 'user';
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export const UserSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Virtual field for `id` to map MongoDB's _id to id
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Optional: Virtual role field based on isAdmin
UserSchema.virtual('role').get(function () {
    return this.isAdmin ? 'admin' : 'user';
});

export const UserModel = model<User>('user', UserSchema);
