const Trivia = require("../model/TriviaModel");

module.exports = {
  // Function to create a new trivia entry
  createTrivia: async (req, res) => {
    try {
      const { questions } = req.body;

      // Create a new trivia entry with the name, phone, and array of questions
      const newTrivia = new Trivia({ questions });

      // Save the trivia to the database
      await newTrivia.save();

      res.json({ message: "Trivia created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create Trivia", error });
    }
  },

  // Function to fetch trivia entries
  fetchTrivia: async (req, res) => {
    try {
      // Find and return all trivia entries with specific fields (name, phone, etc.)
      const Trivias = await Trivia.find({}).select("questions createdAt");

      res.json(Trivias);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Trivia", error });
    }
  },
};
