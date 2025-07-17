const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema(
  {
    userName: { type: String, required: true },
    employeeName: { type: String, required: true },
    workPlace: { type: String, required: true },
    Q1: { type: Number, required: true },
    Q2: { type: Number, required: true },
    Q3: { type: Number, required: true },
    Q4: { type: Number, required: true },
    Q5: { type: Number, required: true },
    Q6: { type: Number, required: true },
    Q7: { type: Number, required: true },
    Q8: { type: Number, required: true },
    Q9: { type: Number, required: true },
    Q10: { type: Number, required: true },
    Q11: { type: Number, required: true },
    message: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

// Use module.exports to export the model
module.exports = mongoose.model("Department", DepartmentSchema);
