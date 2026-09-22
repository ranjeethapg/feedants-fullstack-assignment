const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');

// POST: Register for a competition
router.post('/:id/register', async (req, res) => {
  try {
    const competitionId = req.params.id;
    const { fullName, email } = req.body;

    // 1. Basic Field Validation
    if (!fullName || !email) {
      return res.status(400).json({ 
        message: 'Full name and email are required.' 
      });
    }

    // 2. Create Registration Document in MongoDB
    const newRegistration = new Registration({
      competitionId,
      fullName,
      email
    });

    await newRegistration.save();

    console.log(`[Registration Success] ${fullName} (${email}) for competition ${competitionId}`);

    return res.status(201).json({
      message: 'Registration successful!',
      registration: newRegistration
    });

  } catch (error) {
    console.error('Error saving registration:', error);
    return res.status(500).json({ 
      message: 'Failed to process registration.', 
      error: error.message 
    });
  }
});

module.exports = router;