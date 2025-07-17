const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: { type: String, required: true }, // The actual question
  options: [{ type: String, required: true }], // List of options (if multiple choice)
  correctAnswer: { type: String, required: true } // The correct answer
});

const triviaSchema = new Schema(
  {
    questions: [questionSchema] // Array of questions
  },
  {
    timestamps: true
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("Trivia", triviaSchema);
