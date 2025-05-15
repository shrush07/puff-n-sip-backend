import express, { Router } from 'express';
import { Contact } from '../models/contact.model';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, ratings, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !ratings || !message) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    const contact = new Contact({ name, email, phone, ratings, message });
    await contact.save();

    res.status(201).send({ message: 'Message received successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).send({ message: 'Something went wrong. Try again.' });
  }
});

export default router;