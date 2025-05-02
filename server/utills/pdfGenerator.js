const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

/**
 * Creates a PDF document with common header, footer, and styling
 * @returns {PDFDocument} - The created PDF document
 */
const createBaseDocument = () => {
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: "A4",
  });

  // Add document metadata
  doc.info.Title = "Exam Management System Document";
  doc.info.Author = "Exam Management System";
  doc.info.Creator = "Exam Management System";

  return doc;
};

/**
 * Generates header for PDF documents
 * @param {PDFDocument} doc - PDF document
 * @param {String} title - Document title
 */
const generateHeader = (doc, title) => {
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("Exam Management System", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(title, { align: "center" })
    .moveDown(0.5);

  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke()
    .moveDown(1);
};

/**
 * Generates footer for PDF documents
 * @param {PDFDocument} doc - PDF document
 */
const generateFooter = (doc) => {
  const pageCount = doc.bufferedPageRange().count;
  const now = moment().format("MMMM Do YYYY, h:mm:ss a");

  doc
    .fontSize(8)
    .font("Helvetica")
    .text(
      `Generated on: ${now} | Page ${pageCount}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );
};

/**
 * Generates an exam result PDF for a student
 * @param {Object} result - Exam result data
 * @param {Object} exam - Exam data
 * @param {Object} student - Student data
 * @returns {String} - Path to generated PDF file
 */
const generateExamResultPDF = async (result, exam, student) => {
  const doc = createBaseDocument();
  const outputDir = path.join(__dirname, "../uploads/results");

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `result_${student._id}_${exam._id}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Generate document content
  generateHeader(doc, "Exam Result");

  // Student and exam information
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Student Information:")
    .font("Helvetica")
    .text(`Name: ${student.name}`)
    .text(`Email: ${student.email}`)
    .text(`ID: ${student._id}`)
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Exam Information:")
    .font("Helvetica")
    .text(`Title: ${exam.title}`)
    .text(`Description: ${exam.description}`)
    .text(`Date: ${moment(exam.startTime).format("MMMM Do YYYY, h:mm a")}`)
    .text(`Duration: ${exam.duration} minutes`)
    .text(`Total Marks: ${exam.totalMarks}`)
    .text(`Passing Marks: ${exam.passingMarks}`)
    .moveDown(1);

  // Result information
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Result Summary", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Score: ${result.score}/${exam.totalMarks}`)
    .text(`Percentage: ${Math.round((result.score / exam.totalMarks) * 100)}%`)
    .text(`Status: ${result.score >= exam.passingMarks ? "PASSED" : "FAILED"}`)
    .text(
      `Time Taken: ${moment
        .duration(moment(result.endTime).diff(moment(result.startTime)))
        .asMinutes()} minutes`
    )
    .moveDown(1);

  // Question-wise breakdown
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Question-wise Breakdown:")
    .moveDown(0.5);

  // Add table headers
  const tableTop = doc.y;
  const tableHeaders = ["Question", "Your Answer", "Correct Answer", "Marks"];
  const columnWidth = (doc.page.width - 100) / tableHeaders.length;

  // Draw table header
  tableHeaders.forEach((header, i) => {
    doc.font("Helvetica-Bold").text(header, 50 + i * columnWidth, tableTop, {
      width: columnWidth,
      align: "center",
    });
  });

  doc
    .moveTo(50, tableTop + 20)
    .lineTo(doc.page.width - 50, tableTop + 20)
    .stroke();

  let tableY = tableTop + 30;

  // Draw table rows
  result.answers.forEach((answer, index) => {
    // Check if we need a new page
    if (tableY > doc.page.height - 100) {
      doc.addPage();
      tableY = 50;
    }

    doc
      .font("Helvetica")
      .text(`Q${index + 1}`, 50, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(answer.answer, 50 + columnWidth, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(answer.correctAnswer, 50 + 2 * columnWidth, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(
        `${answer.marksObtained}/${answer.totalMarks}`,
        50 + 3 * columnWidth,
        tableY,
        {
          width: columnWidth,
          align: "center",
        }
      );

    tableY += 30;

    // Add separator line
    doc
      .moveTo(50, tableY - 10)
      .lineTo(doc.page.width - 50, tableY - 10)
      .stroke();
  });

  // Add feedback section if available
  if (result.feedback) {
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Feedback", { align: "center" })
      .moveDown(0.5);

    doc.fontSize(12).font("Helvetica").text(result.feedback).moveDown(1);
  }

  // Add footer to each page
  let pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    generateFooter(doc);
  }

  // Finalize the PDF and end the stream
  doc.end();

  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(fileName));
    stream.on("error", reject);
  });
};

/**
 * Generates an exam summary report PDF
 * @param {Object} exam - Exam data
 * @param {Array} results - Array of exam results
 * @returns {String} - Path to generated PDF file
 */
const generateExamSummaryPDF = async (exam, results) => {
  const doc = createBaseDocument();
  const outputDir = path.join(__dirname, "../uploads/reports");

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `exam_summary_${exam._id}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Generate document content
  generateHeader(doc, "Exam Summary Report");

  // Exam information
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Exam Information:")
    .font("Helvetica")
    .text(`Title: ${exam.title}`)
    .text(`Description: ${exam.description}`)
    .text(`Date: ${moment(exam.startTime).format("MMMM Do YYYY, h:mm a")}`)
    .text(`Duration: ${exam.duration} minutes`)
    .text(`Total Students: ${results.length}`)
    .text(`Total Marks: ${exam.totalMarks}`)
    .text(`Passing Marks: ${exam.passingMarks}`)
    .moveDown(1);

  // Summary statistics
  const totalStudents = results.length;
  const passedStudents = results.filter(
    (r) => r.score >= exam.passingMarks
  ).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalStudents;
  const highestScore = Math.max(...results.map((r) => r.score));
  const lowestScore = Math.min(...results.map((r) => r.score));

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Performance Summary", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Total Students: ${totalStudents}`)
    .text(
      `Passed Students: ${passedStudents} (${Math.round(
        (passedStudents / totalStudents) * 100
      )}%)`
    )
    .text(
      `Failed Students: ${totalStudents - passedStudents} (${Math.round(
        ((totalStudents - passedStudents) / totalStudents) * 100
      )}%)`
    )
    .text(
      `Average Score: ${avgScore.toFixed(2)}/${exam.totalMarks} (${Math.round(
        (avgScore / exam.totalMarks) * 100
      )}%)`
    )
    .text(
      `Highest Score: ${highestScore}/${exam.totalMarks} (${Math.round(
        (highestScore / exam.totalMarks) * 100
      )}%)`
    )
    .text(
      `Lowest Score: ${lowestScore}/${exam.totalMarks} (${Math.round(
        (lowestScore / exam.totalMarks) * 100
      )}%)`
    )
    .moveDown(1);

  // Student results table
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Student Results", { align: "center" })
    .moveDown(0.5);

  // Add table headers
  const tableTop = doc.y;
  const tableHeaders = ["Student ID", "Name", "Score", "Percentage", "Status"];
  const columnWidth = (doc.page.width - 100) / tableHeaders.length;

  // Draw table header
  tableHeaders.forEach((header, i) => {
    doc.font("Helvetica-Bold").text(header, 50 + i * columnWidth, tableTop, {
      width: columnWidth,
      align: "center",
    });
  });

  doc
    .moveTo(50, tableTop + 20)
    .lineTo(doc.page.width - 50, tableTop + 20)
    .stroke();

  let tableY = tableTop + 30;

  // Draw table rows
  results.forEach((result, index) => {
    // Check if we need a new page
    if (tableY > doc.page.height - 100) {
      doc.addPage();
      tableY = 50;
    }

    const percentage = Math.round((result.score / exam.totalMarks) * 100);
    const status = result.score >= exam.passingMarks ? "PASSED" : "FAILED";

    doc
      .font("Helvetica")
      .text(result.student._id, 50, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(result.student.name, 50 + columnWidth, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(
        `${result.score}/${exam.totalMarks}`,
        50 + 2 * columnWidth,
        tableY,
        {
          width: columnWidth,
          align: "center",
        }
      )
      .text(`${percentage}%`, 50 + 3 * columnWidth, tableY, {
        width: columnWidth,
        align: "center",
      })
      .text(status, 50 + 4 * columnWidth, tableY, {
        width: columnWidth,
        align: "center",
      });

    tableY += 30;

    // Add separator line
    doc
      .moveTo(50, tableY - 10)
      .lineTo(doc.page.width - 50, tableY - 10)
      .stroke();
  });

  // Add feedback summary if available
  if (exam.feedbacks && exam.feedbacks.length > 0) {
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Feedback Summary", { align: "center" })
      .moveDown(0.5);

    const avgRating =
      exam.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
      exam.feedbacks.length;

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Average Rating: ${avgRating.toFixed(1)}/5`)
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Common Comments:")
      .moveDown(0.5);

    exam.feedbacks.forEach((feedback, index) => {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${index + 1}. ${feedback.comments}`)
        .moveDown(0.25);
    });
  }

  // Add footer to each page
  let pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    generateFooter(doc);
  }

  // Finalize the PDF and end the stream
  doc.end();

  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(fileName));
    stream.on("error", reject);
  });
};

/**
 * Generates a resource allocation report PDF
 * @param {Object} exam - Exam data
 * @param {Array} resources - Resource allocation data
 * @returns {String} - Path to generated PDF file
 */
const generateResourceAllocationPDF = async (exam, resources) => {
  const doc = createBaseDocument();
  const outputDir = path.join(__dirname, "../uploads/reports");

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `resource_allocation_${exam._id}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Generate document content
  generateHeader(doc, "Resource Allocation Report");

  // Exam information
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Exam Information:")
    .font("Helvetica")
    .text(`Title: ${exam.title}`)
    .text(`Date: ${moment(exam.startTime).format("MMMM Do YYYY, h:mm a")}`)
    .text(`Duration: ${exam.duration} minutes`)
    .moveDown(1);

  // Room allocation
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Room Allocation", { align: "center" })
    .moveDown(0.5);

  resources.rooms.forEach((room, index) => {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Room ${index + 1}: ${room.name}`)
      .font("Helvetica")
      .text(`Capacity: ${room.capacity}`)
      .text(`Location: ${room.location}`)
      .text(`Students Assigned: ${room.assignedStudents.length}`)
      .moveDown(0.5);
  });

  // Supervisor allocation
  doc.addPage();
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Supervisor Allocation", { align: "center" })
    .moveDown(0.5);

  resources.supervisors.forEach((supervisor, index) => {
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Supervisor ${index + 1}: ${supervisor.name}`)
      .font("Helvetica")
      .text(`Email: ${supervisor.email}`)
      .text(`Assigned Room: ${supervisor.assignedRoom}`)
      .text(`Role: ${supervisor.role}`)
      .moveDown(0.5);
  });

  // Equipment allocation
  if (resources.equipment && resources.equipment.length > 0) {
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Equipment Allocation", { align: "center" })
      .moveDown(0.5);

    resources.equipment.forEach((item, index) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Equipment ${index + 1}: ${item.name}`)
        .font("Helvetica")
        .text(`Type: ${item.type}`)
        .text(`Quantity: ${item.quantity}`)
        .text(`Assigned Room: ${item.assignedRoom}`)
        .moveDown(0.5);
    });
  }

  // Notes
  if (resources.notes) {
    doc.addPage();
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Additional Notes", { align: "center" })
      .moveDown(0.5);

    doc.fontSize(12).font("Helvetica").text(resources.notes).moveDown(1);
  }

  // Add footer to each page
  let pages = doc.bufferedPageRange().count;
  for (let i = 0; i < pages; i++) {
    doc.switchToPage(i);
    generateFooter(doc);
  }

  // Finalize the PDF and end the stream
  doc.end();

  // Return a promise that resolves when the PDF is written
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(fileName));
    stream.on("error", reject);
  });
};

module.exports = {
  generateExamResultPDF,
  generateExamSummaryPDF,
  generateResourceAllocationPDF,
};
