const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.error(err));

const competitionSchema = new mongoose.Schema({
  title: String,
  organizer: String,
  category: String,
  status: String,
  description: String,
  deadline: Date
});

const Competition = mongoose.model('Competition', competitionSchema);

async function seedData() {
  try {
    // 1. Clear old incomplete entries
    await Competition.deleteMany({}); 

    // 2. Create the new competition record in MongoDB
    const newCompetition = await Competition.create({
      title: "Feedants Classical Dance",
      organizer: "Feedants Cultural Team",
      category: "Arts",
      status: "Active",
      description: "Showcase your classical dance talents in Bharatanatyam, Kathak, or Kuchipudi. Open to all students!",
      deadline: new Date("2026-10-30T23:59:59")
    });

    console.log(`Database Seeded Successfully!`);
    console.log(`NEW COMPETITION ID: ${newCompetition._id}`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();