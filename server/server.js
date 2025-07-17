const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FormRouter = require("./routes/FormRoute.js");
const DepartmentRouter = require("./routes/departmentRoute.js");
const TimeManagement = require("./routes/timeManagementRoute.js");
const AttendanceRoute = require("./routes/AttendanceRoute.js");
const AttendanceUserRoute = require("./routes/AttendanceUserRoute.js");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.route.js");
const FormSubmission = require("./routes/FormSubmissionRoute.js");
const TriviaRoute = require("./routes/TriviaRoute.js");
const userRoute = require("./routes/userRoute.js");
const workSwapRoute = require("./routes/workSwapRoute.js");
const workSellRoute = require("./routes/workSellRoute.js");
const logRoute = require("./routes/logRoute.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

const allowedOrigins = [
  "*",
  "http://haremhospital.local",
  "http://haremhospital.net",
  "http://172.18.1.31",
  "http://172.18.1.31:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://h.net",
];

app.use(
  cors({
    origin: allowedOrigins,
    // methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "11500mb" }));
app.use(express.urlencoded({ extended: true, limit: "11500mb" }));
app.use(cookieParser());

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

app.use("/api/auth", authRoutes);
app.use("/form", FormRouter);
app.use("/user", userRoute);
app.use("/department", DepartmentRouter);
app.use("/attendance", AttendanceRoute);
app.use("/attendanceUser", AttendanceUserRoute);
app.use("/timeManagement", TimeManagement);
app.use("/formSubmission", FormSubmission);
app.use("/trivia", TriviaRoute);
app.use("/work-swap", workSwapRoute);
app.use("/work-sell", workSellRoute);
app.use("/api/logs", logRoute);
app.use("/certificate", require("./routes/certificateRoute"));
app.use("/seminar", require("./routes/seminarRoute"));
app.use("/schedule", require("./routes/scheduleRoute"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/userAssignment", require("./routes/userAssignmentRoute"));
app.use("/employeeProfile", require("./routes/employeeProfileRoute"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
