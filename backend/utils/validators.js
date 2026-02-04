// utils/validators.js
// Reusable validators for input validation and sanitization

const { body, validationResult } = require('express-validator');
const mongoSanitize = require('mongo-sanitize');

/**
 * Middleware: Apply mongo-sanitize to all request data
 * Prevents NoSQL injection attacks
 */
const sanitizeData = (req, res, next) => {
  req.body = mongoSanitize(req.body);
  req.query = mongoSanitize(req.query);
  req.params = mongoSanitize(req.params);
  next();
};

/**
 * Middleware: Check for validation errors and return them
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

/**
 * Validators for user registration/login
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

const validateUserCreate = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('role')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('Role must be student, teacher, or admin')
];

/**
 * Validators for assignment creation/updates
 */
const validateAssignmentCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('Description is required'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required'),
  body('deadline')
    .isISO8601()
    .withMessage('Valid deadline date is required'),
  body('maxGrade')
    .isNumeric()
    .custom(v => v > 0)
    .withMessage('Max grade must be a positive number')
];

/**
 * Validators for grade updates
 */
const validateGradeUpdate = [
  body('currentCourses')
    .isArray()
    .withMessage('Current courses must be an array'),
  body('currentCourses.*.grade')
    .custom(v => v === null || (Number.isInteger(v) && v >= 0 && v <= 100))
    .withMessage('Grade must be null or between 0-100')
];

module.exports = {
  sanitizeData,
  handleValidationErrors,
  validateLogin,
  validateUserCreate,
  validateAssignmentCreate,
  validateGradeUpdate
};
