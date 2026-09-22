const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  competitionId: {
    type: String,
    required: [true, 'Competition ID is required']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);