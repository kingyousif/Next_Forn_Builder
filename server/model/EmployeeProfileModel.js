const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nameMother: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    certificate: { type: String, required: false },
    graduationYear: { type: String, required: false },
    specialty: { type: String, required: false }, // پسپۆڕی
    workPosition: { type: String, required: false },
    profession: { type: String, required: false }, // پیشە
    residence: { type: String, required: false }, // شوێنی نیشتەجێبوون
    maritalStatus: { type: String, required: false }, // باری خێزانداری
    numberOfChildren: { type: String, required: false },
    bloodType: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    workStartDate: { type: String, required: false },
    establishmentType: { type: String, required: false }, // جۆری دامەزراندن
    salary: { type: String, required: false },
    workLocation: { type: String, required: false }, // شوێنی کار لە کەرتی گشتی
    profileImage: { type: String, required: false },
    nationalIdFront: { type: String, required: false },
    nationalIdBack: { type: String, required: false },
    passportFront: { type: String, required: false },
    passportBack: { type: String, required: false },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    }, // Reference to user
    assignedUserName: { type: String, required: false }, // Store user name for display
    createdBy: { type: String, required: false }, // Who created this profile
    department: { type: String, required: false }, // Department of the employee
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);
