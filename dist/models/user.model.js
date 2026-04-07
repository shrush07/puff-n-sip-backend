"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
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
exports.UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
// Optional: Virtual role field based on isAdmin
exports.UserSchema.virtual('role').get(function () {
    return this.isAdmin ? 'admin' : 'user';
});
exports.UserModel = (0, mongoose_1.model)('user', exports.UserSchema);
