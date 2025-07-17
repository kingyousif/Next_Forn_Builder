const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const formSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    direction: { type: String, required: true },
    elements: { type: Array, required: true },
    active: { type: Boolean, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String },
    settings: { type: Object, required: true },
    department: { type: String, required: true },
    percentage: { type: Number, required: true },
    highestScore: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("Form", formSchema);
