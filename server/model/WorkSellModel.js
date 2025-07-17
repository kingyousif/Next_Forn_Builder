const mongoose = require("mongoose");

const workSellSchema = new mongoose.Schema(
  {
    createdName: { type: String, required: true },
    position: { type: String, required: true },
    sellingName: { type: String, required: true },
    Createdsheft: { type: String, required: true },
    createdDate: { type: Date, required: true },
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

module.exports = mongoose.model("WorkSell", workSellSchema);
