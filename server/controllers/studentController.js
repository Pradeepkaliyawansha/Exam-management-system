const Exam = require("../models/Exam");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const Notification = require("../models/Notification");
const PDFDocument = require("pdfkit");
const moment = require("moment");

exports.getNotifications = async (req, res) => {
  try {
    // Define a model check
    const hasNotificationModel = typeof Notification !== "undefined";

    // Return empty array if model doesn't exist
    if (!hasNotificationModel) {
      console.log("Notification model not defined, returning empty array");
      return res.json([]);
    }

    // Get only unread notifications
    const notifications = await Notification.find(
      {
        userId: req.user.id,
        isRead: false,
      },
      "message isRead createdAt type" // Only select needed fields
    )
      .sort({ createdAt: -1 })
      .limit(10); // Return top 10 unread notifications

    // Transform to a lighter format
    const lightNotifications = notifications.map((n) => ({
      id: n._id,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      type: n.type,
    }));

    return res.json(lightNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    // Return empty array on error to prevent client issues
    return res.json([]);
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};
// @route   GET api/student/exams
// @desc    Get available exams for logged in student
// @access  Private/Student
exports.getAvailableExams = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();

    // Find active exams that are today or in the future
    const exams = await Exam.find({
      isActive: true,
      date: { $gte: new Date(currentDate.setHours(0, 0, 0, 0)) },
    })
      .populate("coordinator", "name")
      .sort({ date: 1 });

    // Check if student has already taken the exam
    const results = await Result.find({ student: req.user.id });

    // Map exams with additional info
    const mappedExams = exams.map((exam) => {
      const takenResult = results.find(
        (result) => result.exam.toString() === exam._id.toString()
      );

      return {
        ...exam._doc,
        taken: !!takenResult,
        resultId: takenResult ? takenResult._id : null,
      };
    });

    res.json(mappedExams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/exams/:id
// @desc    Get exam details
// @access  Private/Student
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      "coordinator",
      "name"
    );

    if (!exam) {
      return res.status(404).json({ msg: "Exam not found" });
    }

    // Check if exam is active
    if (!exam.isActive) {
      return res.status(403).json({ msg: "This exam is not active" });
    }

    // Check if student has already taken this exam
    const result = await Result.findOne({
      student: req.user.id,
      exam: req.params.id,
    });

    const quizzes = await Quiz.find({ examId: req.params.id }).select(
      "_id title description timeLimit"
    );

    res.json({
      exam,
      quizzes,
      taken: !!result,
      resultId: result ? result._id : null,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Exam not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/quizzes/:id
// @desc    Get quiz by ID to take it
// @access  Private/Student
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "examId",
      "title date"
    );

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Check if the exam is active
    const exam = await Exam.findById(quiz.examId);
    if (!exam || !exam.isActive) {
      return res.status(403).json({ msg: "This exam is not active" });
    }

    // Remove correct answers from response
    const sanitizedQuiz = {
      ...quiz._doc,
      questions: quiz.questions.map((question) => ({
        ...question._doc,
        options: question.options.map((option) => ({
          _id: option._id,
          text: option.text,
        })),
      })),
    };

    res.json(sanitizedQuiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   POST api/student/quizzes/:id/submit
// @desc    Submit answers for a quiz
// @access  Private/Student
exports.submitQuiz = async (req, res) => {
  const { answers } = req.body;

  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      const selectedOption = question.options[answer.selectedOptionIndex];
      const isCorrect = selectedOption.isCorrect;

      if (isCorrect) {
        score += question.marks;
      }

      return {
        questionIndex: answer.questionIndex,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        marks: isCorrect ? question.marks : 0,
      };
    });

    // Calculate total possible marks
    const totalPossible = quiz.questions.reduce(
      (total, question) => total + question.marks,
      0
    );

    // Check if result document exists for this student and exam
    let result = await Result.findOne({
      student: req.user.id,
      exam: quiz.examId,
    });

    if (!result) {
      // Create new result document
      result = new Result({
        student: req.user.id,
        exam: quiz.examId,
        quizResults: [
          {
            quizId: quiz._id,
            answers: gradedAnswers,
            score,
            totalPossible,
            completedAt: Date.now(),
          },
        ],
        totalScore: score,
        totalPossible: totalPossible,
      });
    } else {
      // Check if quiz already taken
      const quizIndex = result.quizResults.findIndex(
        (qr) => qr.quizId.toString() === quiz._id.toString()
      );

      if (quizIndex !== -1) {
        return res
          .status(400)
          .json({ msg: "You have already submitted this quiz" });
      }

      // Add new quiz result
      result.quizResults.push({
        quizId: quiz._id,
        answers: gradedAnswers,
        score,
        totalPossible,
        completedAt: Date.now(),
      });

      // Update total score and total possible
      result.totalScore = (result.totalScore || 0) + score;
      result.totalPossible = (result.totalPossible || 0) + totalPossible;
    }

    await result.save();

    res.json({
      score,
      totalPossible,
      percentage: Math.round((score / totalPossible) * 100),
      resultId: result._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   POST api/student/results/:id/details
// @desc    Add additional details to result and generate PDF
// @access  Private/Student
exports.addResultDetails = async (req, res) => {
  const { additionalDetails } = req.body;

  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ msg: "Result not found" });
    }

    // Check if this result belongs to the current student
    if (result.student.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Add additional details
    result.additionalDetails = additionalDetails;
    result.pdfGenerated = true;

    await result.save();

    res.json(result);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Result not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   GET api/student/results
// @desc    Get all results for logged in student
// @access  Private/Student
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate("exam", "title date")
      .sort({ submittedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getNotifications = async (req, res) => {
  try {
    // Define a model check
    const hasNotificationModel = typeof Notification !== "undefined";

    // Return empty array if model doesn't exist
    if (!hasNotificationModel) {
      console.log("Notification model not defined, returning empty array");
      return res.json([]);
    }

    // Limit fields and results to reduce response size
    const notifications = await Notification.find(
      { userId: req.user.id },
      "message isRead createdAt type" // Only select needed fields
    )
      .sort({ createdAt: -1 })
      .limit(5); // Only return 5 most recent

    // Transform to a lighter format
    const lightNotifications = notifications.map((n) => ({
      id: n._id,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      type: n.type,
    }));

    return res.json(lightNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    // Return empty array on error to prevent client issues
    return res.json([]);
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    // Check if model exists
    const hasNotificationModel = typeof Notification !== "undefined";
    if (!hasNotificationModel) {
      return res.json({ success: true });
    }

    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    // Return success anyway to prevent UI issues
    return res.json({ success: true });
  }
};

exports.downloadTimetablePDF = async (req, res) => {
  try {
    // Get student's available exams
    const currentDate = new Date();
    const exams = await Exam.find({
      isActive: true,
      date: { $gte: new Date(currentDate.setHours(0, 0, 0, 0)) },
    })
      .populate("coordinator", "name")
      .sort({ date: 1 })
      .limit(10); // Limit to next 10 exams

    // Create a PDF document
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="exam-timetable.pdf"'
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add title and header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Exam Timetable", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm a")}`, {
        align: "center",
      });
    doc.moveDown();

    // Add a line separator
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown();

    // Check if there are any exams
    if (exams.length === 0) {
      doc
        .fontSize(14)
        .font("Helvetica")
        .text("No upcoming exams found.", { align: "center" });
    } else {
      // Add exam timetable
      exams.forEach((exam, index) => {
        // Add page break for every 3 exams (after the first 3)
        if (index > 0 && index % 3 === 0) {
          doc.addPage();
        }

        // Exam header
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${exam.title}`);
        doc.moveDown(0.3);

        // Exam details
        doc.fontSize(12).font("Helvetica");
        doc.text(`Description: ${exam.description || "N/A"}`);
        doc.text(
          `Date & Time: ${moment(exam.date).format("MMMM Do YYYY, h:mm a")}`
        );
        doc.text(`Duration: ${exam.duration} minutes`);
        doc.text(`Max Students: ${exam.maxStudents}`);
        if (exam.coordinator) {
          doc.text(`Coordinator: ${exam.coordinator.name}`);
        }
        if (exam.specialRequirements) {
          doc.text(`Special Requirements: ${exam.specialRequirements}`);
        }

        doc.moveDown();

        // Add a separator line between exams
        if (index < exams.length - 1) {
          doc
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .stroke();
          doc.moveDown();
        }
      });
    }

    // Add footer to each page
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(10)
        .text(`Page ${i + 1} of ${pages}`, 0, doc.page.height - 50, {
          align: "center",
        });
    }

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating timetable PDF:", error);
    res
      .status(500)
      .json({ msg: "Error generating timetable PDF", error: error.message });
  }
};
