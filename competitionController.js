const Competition = require('../models/Competition');
const Registration = require('../models/Registration');

// Get Competition Details
exports.getCompetitionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] || 'user_123';

    const competition = await Competition.findById(id);
    if (!competition) return res.status(404).json({ message: 'Competition not found' });

    const userRegistration = await Registration.findOne({ userId, competitionId: id });

    res.json({
      success: true,
      serverTime: new Date(),
      data: competition,
      userState: {
        isRegistered: !!userRegistration,
        hasSubmitted: userRegistration?.status === 'SUBMITTED',
        submissionUrl: userRegistration?.submissionUrl || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register User (Atomic Operation to avoid double-booking)
exports.registerUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const existing = await Registration.findOne({ userId, competitionId: id });
    if (existing) return res.status(400).json({ message: 'User already registered' });

    // Atomic update check
    const updatedCompetition = await Competition.findOneAndUpdate(
      {
        _id: id,
        $expr: { $lt: ["$filledSpots", "$totalSpots"] }
      },
      { $inc: { filledSpots: 1 } },
      { new: true }
    );

    if (!updatedCompetition) {
      return res.status(400).json({ message: 'Registration full! No spots left.' });
    }

    try {
      const registration = await Registration.create({ userId, competitionId: id });
      return res.status(201).json({
        success: true,
        message: 'Registered successfully',
        registration,
        remainingSpots: updatedCompetition.totalSpots - updatedCompetition.filledSpots
      });
    } catch (err) {
      await Competition.updateOne({ _id: id }, { $inc: { filledSpots: -1 } });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload Submission
exports.submitEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, submissionUrl } = req.body;

    const registration = await Registration.findOneAndUpdate(
      { userId, competitionId: id },
      { status: 'SUBMITTED', submissionUrl, submittedAt: new Date() },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    res.json({ success: true, message: 'Submission saved successfully', registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};