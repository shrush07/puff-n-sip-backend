import {Schema, model} from 'mongoose';

export interface User{
    token: string;
    id:string;
    email:string;
    password: string;
    name:string;
    address:string;
    // token:string;
    isAdmin:boolean;
    //token?: string;
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export const UserSchema = new Schema<User>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    address: {type: String, required: true},
    isAdmin: {type: Boolean, required: true},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date}
}, {
    timestamps: true,
    toJSON:{
        virtuals: true
    },
    toObject:{
        virtuals: true
    }
});

export const UserModel = model<User>('user', UserSchema);