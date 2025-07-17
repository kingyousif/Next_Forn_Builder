const mongoose = require("mongoose");

const workSwapSchema = new mongoose.Schema(
  {
    createdName: { type: String, required: true },
    position: { type: String, required: true },
    swapingName: { type: String, required: true },
    Createdsheft: { type: String, required: true },
    createdDate: { type: Date, required: true },
    forSheft: { type: String, required: true },
    forDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reason: { type: String },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkSwap", workSwapSchema);
