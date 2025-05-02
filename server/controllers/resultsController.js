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
    console.error(err.message);
    res.status(500).send("Server error");
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
    doc
      .fontSize(12)
      .text(`Date: ${new Date(result.exam.date).toLocaleDateString()}`);
    doc.fontSize(12).text(`Duration: ${result.exam.duration} minutes`);
    doc.moveDown();
    doc
      .fontSize(15)
      .text(`Score: ${result.totalScore} / ${result.maxPossibleScore}`);
    doc.fontSize(15).text(`Percentage: ${result.percentage.toFixed(2)}%`);

    if (result.feedback) {
      doc.moveDown();
      doc.fontSize(15).text("Feedback:");
      doc.fontSize(12).text(result.feedback);
    }

    if (result.additionalDetails) {
      doc.moveDown();
      doc.fontSize(15).text("Additional Details:");
      for (const [key, value] of Object.entries(result.additionalDetails)) {
        doc.fontSize(12).text(`${key}: ${value}`);
      }
    }

    doc.moveDown().moveDown();
    doc
      .fontSize(12)
      .text("This certificate was automatically generated.", {
        align: "center",
      });
    doc.fontSize(12).text(new Date().toLocaleDateString(), { align: "center" });

    // Finalize PDF
    doc.end();

    // Update result with PDF URL
    result.pdfGenerated = true;
    result.pdfUrl = `/pdfs/${pdfFileName}`;
    await result.save();

    res.json({
      msg: "PDF generated successfully",
      pdfUrl: result.pdfUrl,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
