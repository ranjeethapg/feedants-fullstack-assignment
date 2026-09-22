const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// 1. Competition Schema
const competitionSchema = new mongoose.Schema({
  title: String,
  organizer: String,
  category: String,
  status: String,
  description: String,
});
const Competition = mongoose.model('Competition', competitionSchema);

// 2. Registration Schema (Updated competitionId to String to prevent CastError)
const registrationSchema = new mongoose.Schema({
  competitionId: { 
    type: String, 
    required: true 
  },
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  }
});
const Registration = mongoose.model('Registration', registrationSchema);

// GET: Fetch all competitions
app.get('/api/competitions', async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch competition by ID
app.get('/api/competitions/:id', async (req, res) => {
  try {
    // Check if ID is a valid 24-char ObjectId before querying MongoDB
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      const competition = await Competition.findById(req.params.id);
      if (competition) return res.json(competition);
    }

    // Fallback response if dummy ID is passed
    res.json({
      _id: req.params.id,
      title: "Feedants Classical Dance",
      organizer: "Feedants Cultural Team",
      category: "Arts",
      status: "Active",
      description: "Showcase your classical dance talents in Bharatanatyam, Kathak, or Kuchipudi. Open to all students!"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Register participant for a competition
app.post('/api/competitions/:id/register', async (req, res) => {
  try {
    const { fullName, email } = req.body;
    
    if (!fullName || !email) {
      return res.status(400).json({ message: 'Full name and email are required.' });
    }

    const newRegistration = new Registration({
      competitionId: req.params.id,
      fullName,
      email
    });

    await newRegistration.save();
    console.log(`[Registration Saved] Name: ${fullName}, Email: ${email}`);
    
    res.status(201).json({ 
      message: 'Registration successful!', 
      registration: newRegistration 
    });
  } catch (err) {
    console.error('Registration processing error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));