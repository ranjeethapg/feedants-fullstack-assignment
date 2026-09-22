const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: [{ type: String }],
  prizePool: { type: Number, required: true },
  entryFee: { type: Number, required: true },
  totalSpots: { type: Number, required: true },
  filledSpots: { type: Number, default: 0 },
  judge: {
    name: String,
    title: String,
    experience: String,
    avatarUrl: String
  },
  dates: {
    registrationStart: Date,
    registrationEnd: Date,
    submissionStart: Date,
    submissionEnd: Date,
    resultDate: Date
  },
  rewards: [{ rank: String, amount: Number }],
  rulesAndEligibility: [String],
  judgingParameters: [String]
}, { timestamps: true });

module.exports = mongoose.model('Competition', competitionSchema);