const Result = require("../models/Result");
const Exam = require("../models/Exam");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

// @route   GET api/results/student
// @desc    Get all results for the current student
// @access  Private (Student only)
exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate("exam", "title date duration")
      .sort({ startTime: -1 });

    res.json(results);
  } catch (err) {
    console.error("Error in getStudentResults:", err.message);
    console.error(err.stack);
    res.status(500).json({
      error: "Server error while fetching student results",
      details: err.message,
    });
  }
};

// @route   GET api/results/admin/exam/:examId
// @desc    Get all results for a specific exam
// @access  Private (Admin only)
exports.getExamResults = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate("student", "name email")
      .sort({ totalScore: -1 });

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// @route   GET api/results/:id
// @desc    Get result by ID
// @access  Private
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("exam", "title description date duration")
      .populate("student", "name email");

    if (!result) {
      return res.status(404).json({ msg: "Result not found" });
    }

    // Check if the user is authorized to view this result
    if (
      result.student._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    res.json(result);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Result not found" });
    }
    res.status(500).send("Server error");
  }
};

// @route   PUT api/results/:id/feedback
// @desc    Add feedback to a result
// @access  Private (Admin only)
exports.addFeedback = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { feedback } = req.body;

  try {
    let result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ msg: "Result not found" });
    }

    result.feedback = feedback;
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

// @route   POST api/results/:id/generate-pdf
// @desc    Generate PDF certificate for an exam result
// @access  Private
exports.generatePDF = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("exam", "title description date duration")
      .populate("student", "name email");

    if (!result) {
      return res.status(404).json({ msg: "Result not found" });
    }

    // Check if the user is authorized to generate this PDF
    if (
      result.student._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Create a PDF document
    const doc = new PDFDocument();

    // Set up the PDF filename
    const pdfFileName = `exam_result_${result._id}.pdf`;
    const pdfPath = path.join(__dirname, "../public/pdfs", pdfFileName);

    // Create directory if it doesn't exist
    const dir = path.join(__dirname, "../public/pdfs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add content to PDF
    doc.fontSize(25).text("Exam Result Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(15).text(`Student: ${result.student.name}`);
    doc.fontSize(15).text(`Email: ${result.student.email}`);
    doc.moveDown();
    doc.fontSize(15).text(`Exam: ${result.exam.title}`);
    doc.fontSize(12).text(`Description: ${result.exam.description}`);

    // Format date properly
    const examDate = result.exam.date ? new Date(result.exam.date) : new Date();
    doc.fontSize(12).text(`Date: ${examDate.toLocaleDateString()}`);

    doc.fontSize(12).text(`Duration: ${result.exam.duration || "N/A"} minutes`);
    doc.moveDown();

    // Calculate total score and percentage with proper error handling
    let totalScore = 0;
    let totalPossible = 0;

    // Check different paths to get the scores
    if (
      result.quizResults &&
      Array.isArray(result.quizResults) &&
      result.quizResults.length > 0
    ) {
      // Sum up scores from all quizzes
      result.quizResults.forEach((quizResult) => {
        totalScore += quizResult.score || 0;
        totalPossible += quizResult.totalPossible || 0;
      });
    } else if (
      result.totalScore !== undefined &&
      result.totalPossible !== undefined
    ) {
      // Use direct properties if available
      totalScore = result.totalScore;
      totalPossible = result.totalPossible;
    } else if (result.answers && Array.isArray(result.answers)) {
      // Calculate from answers if available
      result.answers.forEach((answer) => {
        if (answer.isCorrect) {
          totalScore += answer.quiz?.points || answer.marks || 1;
        }
      });

      // Estimate total possible from the exam or result
      totalPossible = result.maxPossibleScore || result.answers.length * 1;
    }

    // Ensure we have valid numbers
    totalScore = isNaN(totalScore) ? 0 : totalScore;
    totalPossible =
      isNaN(totalPossible) || totalPossible === 0 ? 1 : totalPossible;

    // Calculate percentage safely
    const percentage = Math.round((totalScore / totalPossible) * 100);

    // Display score with error handling
    doc.fontSize(15).text(`Score: ${totalScore} / ${totalPossible}`);
    doc.fontSize(15).text(`Percentage: ${percentage}%`);

    // Add feedback if available
    if (result.feedback) {
      doc.moveDown();
      doc.fontSize(15).text("Feedback:");
      doc.fontSize(12).text(result.feedback);
    }

    // Add additional details if available
    if (
      result.additionalDetails &&
      typeof result.additionalDetails === "object"
    ) {
      doc.moveDown();
      doc.fontSize(15).text("Additional Details:");
      for (const [key, value] of Object.entries(result.additionalDetails)) {
        if (key && value) {
          doc.fontSize(12).text(`${key}: ${value}`);
        }
      }
    }

    doc.moveDown().moveDown();
    doc.fontSize(12).text("This certificate was automatically generated.", {
      align: "center",
    });
    doc.fontSize(12).text(new Date().toLocaleDateString(), { align: "center" });

    // Finalize PDF
    doc.end();

    // Wait for the PDF to be written to disk
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Update result with PDF URL
    result.pdfGenerated = true;
    result.pdfUrl = `/pdfs/${pdfFileName}`;
    await result.save();

    res.json({
      msg: "PDF generated successfully",
      pdfUrl: result.pdfUrl,
    });
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({
      msg: "Error generating PDF",
      error: err.message,
    });
  }
};
