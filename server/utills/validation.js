const Joi = require("joi");

/**
 * User validation schema
 * Validates user registration and update data
 */
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "student", "examManager").required(),
  });
  return schema.validate(data);
};

/**
 * Login validation schema
 * Validates user login data
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

/**
 * Exam validation schema
 * Validates exam creation and update data
 */
const validateExam = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref("startTime")).required(),
    duration: Joi.number().integer().min(1).required(),
    totalMarks: Joi.number().integer().min(1).required(),
    passingMarks: Joi.number().integer().min(0).required(),
    instructions: Joi.string().min(10).max(2000).required(),
    specialRequirements: Joi.string().allow("", null),
    numberOfStudents: Joi.number().integer().min(1).required(),
    status: Joi.string().valid("draft", "published", "completed").required(),
  });
  return schema.validate(data);
};

/**
 * Quiz/Question validation schema
 * Validates question creation and update data
 */
const validateQuestion = (data) => {
  const schema = Joi.object({
    examId: Joi.string().required(),
    questionText: Joi.string().min(3).max(1000).required(),
    questionType: Joi.string()
      .valid("multipleChoice", "trueFalse", "shortAnswer", "essay")
      .required(),
    options: Joi.when("questionType", {
      is: Joi.string().valid("multipleChoice"),
      then: Joi.array().items(Joi.string()).min(2).required(),
      otherwise: Joi.allow(null),
    }),
    correctAnswer: Joi.when("questionType", {
      is: Joi.string().valid("multipleChoice", "trueFalse"),
      then: Joi.required(),
      otherwise: Joi.allow(null),
    }),
    marks: Joi.number().integer().min(1).required(),
  });
  return schema.validate(data);
};

/**
 * Result validation schema
 * Validates exam result submission data
 */
const validateResult = (data) => {
  const schema = Joi.object({
    examId: Joi.string().required(),
    userId: Joi.string().required(),
    answers: Joi.array()
      .items(
        Joi.object({
          questionId: Joi.string().required(),
          answer: Joi.required(),
        })
      )
      .required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref("startTime")).required(),
    submittedAt: Joi.date().iso().required(),
  });
  return schema.validate(data);
};

/**
 * Feedback validation schema
 * Validates feedback submission data
 */
const validateFeedback = (data) => {
  const schema = Joi.object({
    examId: Joi.string().required(),
    userId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comments: Joi.string().min(3).max(1000).allow("", null),
    suggestions: Joi.string().min(3).max(1000).allow("", null),
  });
  return schema.validate(data);
};

/**
 * Resource allocation validation schema
 * Validates resource allocation data
 */
const validateResourceAllocation = (data) => {
  const schema = Joi.object({
    examId: Joi.string().required(),
    roomId: Joi.string().required(),
    supervisorIds: Joi.array().items(Joi.string()).required(),
    equipmentIds: Joi.array().items(Joi.string()).allow(null),
    notes: Joi.string().max(1000).allow("", null),
  });
  return schema.validate(data);
};

/**
 * Student assignment validation schema
 * Validates assigning students to an exam
 */
const validateStudentAssignment = (data) => {
  const schema = Joi.object({
    examId: Joi.string().required(),
    studentIds: Joi.array().items(Joi.string()).required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateUser,
  validateLogin,
  validateExam,
  validateQuestion,
  validateResult,
  validateFeedback,
  validateResourceAllocation,
  validateStudentAssignment,
};
