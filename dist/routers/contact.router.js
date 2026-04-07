"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_model_1 = require("../models/contact.model");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, ratings, message } = req.body;
        // Basic validation
        if (!name || !email || !phone || !ratings || !message) {
            return res.status(400).send({ message: 'All fields are required' });
        }
        const contact = new contact_model_1.Contact({ name, email, phone, ratings, message });
        await contact.save();
        res.status(201).send({ message: 'Message received successfully' });
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).send({ message: 'Something went wrong. Try again.' });
    }
});
exports.default = router;
