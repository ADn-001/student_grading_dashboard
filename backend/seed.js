// seed.js - Script to seed the MongoDB database with initial data for demo purposes
// Run with: node seed.js
// This drops existing collections first for a clean seed (comment out if unwanted)
// Uses Faker for realistic fake data
// Ensures consistency between User and Course models (e.g., enrollments)
// Updated: Increased students to 70 (added 20 more), and added grade seeding for student currentCourses (random grades A-F or null)
// UPDATED: Passwords are automatically hashed via User model pre-save hook with bcrypt

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Course = require('./models/Course');
const Major = require('./models/Major');
const Batch = require('./models/Batch');
const Assignment = require('./models/Assignment');

// Hardcoded DB connection (as per MVP - use .env in production)
const DB_URI = 'mongodb://localhost:27017/uniportal';

// Sample data constants
const MAJORS = ['Computer Science', 'Business Administration'];
const DEPARTMENTS = ['Computer Science', 'Business'];
const COURSES = [
  'Math 101', 'Programming Basics', 'Data Structures', 'Economics 101',
  'Marketing Principles', 'Database Systems', 'Web Development',
  'Statistics', 'Business Ethics', 'Algorithms'
];
const DEFAULT_PASSWORD = 'password123'; // Will be hashed automatically via pre-save hook
const STUDENT_YEAR = 1;
const STUDENT_SEMESTER = 'Semester 1';
const BATCH_YEAR = 2029; // Graduation year (assuming 4-year program starting 2025)
// const POSSIBLE_GRADES = ['A', 'B', 'C', 'D', 'F', null]; // Possible grades for seeding (including null for pending)
const POSSIBLE_GRADES = [null]; // We'll generate numbers dynamically
// Helper to generate random subset of array
const getRandomSubset = (arr, min = 2, max = 5) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, faker.number.int({ min, max }));
};

// Helper to get a random grade
// const getRandomGrade = () => faker.helpers.arrayElement(POSSIBLE_GRADES);


// Helper to get a random numeric grade (50-100) or null ~30% chance
const getRandomGrade = () => {
  if (Math.random() < 0.3) return null; // ~30% ungraded
  return faker.number.int({ min: 50, max: 100 });
};
// Main seeding function
async function seedDB() {
  try {
    // Connect to DB
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    // Drop existing collections for clean seed (optional: comment out to append)
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Major.deleteMany({}),
      Batch.deleteMany({}),
      Assignment.deleteMany({})
    ]);
    console.log('Dropped existing collections');

    // Seed Majors
    const majorDocs = await Major.insertMany(MAJORS.map(name => ({ name, description: `Description for ${name}` })));
    console.log('Seeded 2 majors');

    // Seed Batches (one per major)
    const batchDocs = await Batch.insertMany(MAJORS.map(major => ({ graduationYear: BATCH_YEAR, major })));
    console.log('Seeded 2 batches');

    // Seed Courses (initially without teacher/students)
    const courseDocs = await Course.insertMany(COURSES.map((name, index) => ({
      name,
      code: `COURSE${index + 1}`,
      major: faker.helpers.arrayElement(MAJORS), // Random major assignment
      yearOffered: STUDENT_YEAR,
      semesterOffered: STUDENT_SEMESTER,
      teacher: '', // To be assigned later
      enrolledStudents: [] // To be assigned later
    })));
    const courseNames = courseDocs.map(c => c.name); // For assignments
    console.log('Seeded 10 courses');

    // Seed Admin (1)
    const admin = new User({
      email: 'admin@uni.com',
      password: DEFAULT_PASSWORD,
      fullName: faker.person.fullName(),
      role: 'admin',
      permissions: ['manageUsers', 'manageCourses']
    });
    await admin.save();
    console.log('Seeded 1 admin');

    // Seed Teachers (5)
    const teachers = [];
    for (let i = 0; i < 5; i++) {
      const dept = faker.helpers.arrayElement(DEPARTMENTS);
      const taughtCourses = getRandomSubset(courseNames, 2, 3); // 2-3 courses per teacher
      const teacher = new User({
        email: faker.internet.email(),
        password: DEFAULT_PASSWORD,
        fullName: faker.person.fullName(),
        role: 'teacher',
        department: dept,
        coursesTaught: taughtCourses
      });
      await teacher.save();
      teachers.push(teacher);

      // Assign teacher to their courses (update Course docs)
        await Promise.all(taughtCourses.map(async courseName => {
        await Course.findOneAndUpdate({ name: courseName }, { teacher: teacher.email });  // Change to email
        }));
    }
    console.log('Seeded 5 teachers and assigned courses');

    // Seed Students (70, spread between majors: 35 per major)
    const studentsPerMajor = 35; // Increased from 25 to 35 (adds 20 total students)
    for (const major of MAJORS) {
      for (let i = 0; i < studentsPerMajor; i++) {
        const batch = batchDocs.find(b => b.major === major).graduationYear.toString();
        const currentCourses = getRandomSubset(courseNames, 3, 5).map(name => ({
            courseName: name,
            grade: getRandomGrade()   // Now numeric or null
          }));// 3-5 random courses, with seeded grades
        const student = new User({
          email: faker.internet.email(),
          password: DEFAULT_PASSWORD,
          fullName: faker.person.fullName(),
          role: 'student',
          major,
          batch,
          currentYear: STUDENT_YEAR,
          currentSemester: STUDENT_SEMESTER,
          currentCourses,
          completedCourses: [] // None for 1st year
        });
        await student.save();

        // Enroll student in their courses (update Course docs)
        await Promise.all(currentCourses.map(async ({ courseName }) => {
          await Course.findOneAndUpdate(
            { name: courseName },
            { $push: { enrolledStudents: student.email } }
          );
        }));
      }
    }
    console.log('Seeded 70 students, assigned majors/batches/courses, and seeded grades');

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    // Disconnect and exit
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedDB();