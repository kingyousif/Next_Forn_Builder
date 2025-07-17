const Seminar = require("../model/SeminarModel");
const Users = require("../model/user.model");

module.exports = {
  // Create seminar
  createSeminar: async (req, res) => {
    try {
      const {
        username,
        fullName,
        seminarTitle,
        description,
        department,
        date,
        fromTime,
        toTime,
        duration,
        location,
        maxAttendees,
      } = req.body;

      // Validate required fields
      if (
        !username ||
        !fullName ||
        !seminarTitle ||
        !description ||
        !date ||
        !fromTime ||
        !toTime ||
        !department
      ) {
        return res.status(400).json({
          message: "All required fields must be provided",
        });
      }

      // Validate time format and logic
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(fromTime) || !timeRegex.test(toTime)) {
        return res.status(400).json({
          message: "Invalid time format. Use HH:MM format",
        });
      }

      // Check if end time is after start time
      const fromMinutes = timeToMinutes(fromTime);
      const toMinutes = timeToMinutes(toTime);

      if (fromMinutes >= toMinutes) {
        return res.status(400).json({
          message: "End time must be after start time",
        });
      }

      // Check for duplicate seminar (same organizer, title, and date)
      const existingSeminar = await Seminar.findOne({
        username: username,
        seminarTitle: seminarTitle,
        date: new Date(date),
      });

      if (existingSeminar) {
        return res.status(409).json({
          message: "A seminar with the same title already exists for this date",
        });
      }

      // Check for time conflicts for the same organizer on the same date
      const conflictingSeminar = await Seminar.findOne({
        username: username,
        date: new Date(date),
        $or: [
          {
            $and: [
              { fromTime: { $lte: fromTime } },
              { toTime: { $gt: fromTime } },
            ],
          },
          {
            $and: [{ fromTime: { $lt: toTime } }, { toTime: { $gte: toTime } }],
          },
          {
            $and: [
              { fromTime: { $gte: fromTime } },
              { toTime: { $lte: toTime } },
            ],
          },
        ],
      });

      if (conflictingSeminar) {
        return res.status(409).json({
          message: "You have a time conflict with another seminar on this date",
        });
      }

      // Create new seminar
      const newSeminar = new Seminar({
        username,
        fullName,
        seminarTitle: seminarTitle.trim(),
        description: description.trim(),
        department: department.trim(),
        date: new Date(date),
        fromTime,
        toTime,
        duration: duration || calculateDuration(fromTime, toTime),
        location: location?.trim(),
        maxAttendees: maxAttendees || 50,
      });

      await newSeminar.save();

      res.status(201).json({
        message: "Seminar created successfully",
        seminar: newSeminar,
      });
    } catch (error) {
      console.error("Seminar creation error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Fetch all seminars
  fetchSeminars: async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
    let user = await Users.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      let seminars;
      if (user.role === "admin") {
        seminars = await Seminar.find({ department: user.department }).sort({
          date: 1,
          fromTime: 1,
        });
      } else if (user.role === "super admin") {
        seminars = await Seminar.find({}).sort({ date: 1, fromTime: 1 });
      } else {
        seminars = await Seminar.find({ username }).sort({
          date: 1,
          fromTime: 1,
        });
      }
      res.status(200).json(seminars);
    } catch (error) {
      console.error("Fetch seminars error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Fetch seminars by organizer
  fetchSeminarsByOrganizer: async (req, res) => {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const seminars = await Seminar.find({ username, active: true }).sort({
        date: 1,
        fromTime: 1,
      });
      res.status(200).json(seminars);
    } catch (error) {
      console.error("Fetch organizer seminars error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Fetch upcoming seminars
  fetchUpcomingSeminars: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const seminars = await Seminar.find({
        date: { $gte: today },
        active: true,
      }).sort({ date: 1, fromTime: 1 });

      res.status(200).json(seminars);
    } catch (error) {
      console.error("Fetch upcoming seminars error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Register for seminar
  registerForSeminar: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, fullName } = req.body;

      if (!username || !fullName) {
        return res
          .status(400)
          .json({ message: "Username and fullName are required" });
      }

      const seminar = await Seminar.findById(id);

      if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
      }

      // Check if already registered
      const alreadyRegistered = seminar.attendees.some(
        (attendee) => attendee.username === username
      );

      if (alreadyRegistered) {
        return res
          .status(409)
          .json({ message: "Already registered for this seminar" });
      }

      // Check if seminar is full
      if (seminar.attendees.length >= seminar.maxAttendees) {
        return res.status(409).json({ message: "Seminar is full" });
      }

      // Add attendee
      seminar.attendees.push({ username, fullName });
      await seminar.save();

      res.status(200).json({
        message: "Successfully registered for seminar",
        seminar,
      });
    } catch (error) {
      console.error("Register for seminar error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Update seminar status
  updateSeminarStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "approved", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const seminar = await Seminar.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
      }

      res.status(200).json({
        message: "Seminar status updated successfully",
        seminar,
      });
    } catch (error) {
      console.error("Update seminar status error:", error);
      res.status(500).json({
        message: "Something went wrong!",
        error: error.message,
      });
    }
  },

  // Delete seminar
  deleteSeminar: async (req, res) => {
    try {
      const { id } = req.params;

      const seminar = await Seminar.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      );

      if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
      }

      res.status(200).json({
        message: "Seminar deleted successfully",
        seminar,
      });
    } catch (error) {
      console.error("Delete seminar error:", error);
      res.status(500).json({
        message: "Failed to delete seminar",
        error: error.message,
      });
    }
  },
};

// Helper functions
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateDuration(fromTime, toTime) {
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);

  if (fromMinutes >= toMinutes) return "";

  const durationMinutes = toMinutes - fromMinutes;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minutes`;
  }
}
