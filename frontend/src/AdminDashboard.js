
// Admin dashboard for managing users and courses
// - Shows tables for admins, teachers, students
// - Dedicated add forms for each role (admin, teacher, student)
// - Edit/search user by email, update user info and course assignments
// - Handles course assignment syncing, input validation, and error handling
// - All actions require admin role (enforced by backend)

import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchCourses, createUser, updateUser, deleteUser, updateCourse } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]); // For edit course selections
  const [showEditDropdown, setShowEditDropdown] = useState(false); // Toggle for edit dropdown

  // Dedicated form states
  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '', role: 'admin' });
  const [teacherForm, setTeacherForm] = useState({ email: '', password: '', fullName: '', role: 'teacher' });
  const [teacherCourses, setTeacherCourses] = useState([]); // Separate for teacher add
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false); // Toggle for teacher add dropdown
  const [studentForm, setStudentForm] = useState({
    email: '', password: '', fullName: '', role: 'student',
    major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1'
  });
  const [studentCourses, setStudentCourses] = useState([]); // Separate for student add
  const [showStudentDropdown, setShowStudentDropdown] = useState(false); // Toggle for student add dropdown

  // Define loadData here (simple async function to fetch data; called in useEffect and handlers)
  const loadData = async () => {
    try {
      setUsers(await fetchUsers());
      setCourses(await fetchCourses());
      setError('');
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load data.');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Generic input change handler (for any form)
  const handleInputChange = (e, setForm) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Course checkbox handler (with max check)
  const handleCourseCheckbox = (courseName, role, selected, setSelected) => {
    const max = role === 'teacher' ? 3 : 5;
    let newSelected = [...selected];
    if (newSelected.includes(courseName)) {
      newSelected = newSelected.filter(c => c !== courseName);
    } else if (newSelected.length < max) {
      newSelected.push(courseName);
    } else {
      alert(`Max ${max} courses allowed for ${role}s.`);
      return;
    }
    setSelected(newSelected);
  };

  // Generic add handler (role-specific)
  const handleAdd = async (formData, selectedCourses = [], role) => {
    try {
      let updatedData = { ...formData };
      if (role === 'teacher') updatedData.coursesTaught = selectedCourses;
      if (role === 'student') updatedData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null }));
      console.log('Sending user data:', updatedData); // DEBUG: Log what's being sent
      const savedUser = await createUser(updatedData);
      await syncCourses(savedUser); // Sync with courses
      // Reset forms and toggles
      if (role === 'admin') setAdminForm({ email: '', password: '', fullName: '', role: 'admin' });
      if (role === 'teacher') { setTeacherForm({ email: '', password: '', fullName: '', role: 'teacher' }); setTeacherCourses([]); setShowTeacherDropdown(false); }
      if (role === 'student') { setStudentForm({ email: '', password: '', fullName: '', role: 'student', major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1' }); setStudentCourses([]); setShowStudentDropdown(false); }
      setError(''); // Clear error on success
      await loadData(); // Refetch
    } catch (err) {
      console.error('Add error:', err);
      setError(`Failed to add user: ${err.message}`);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Delete user?')) {
      try {
        await deleteUser(id);
        await loadData();
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete.');
      }
    }
  };

  // Search for edit
  const handleSearch = async () => {
    const user = users.find(u => u.email === searchEmail);
    if (user) {
      setEditingUser(user);
      // Pre-populate courses for edit
      if (user.role === 'teacher') setSelectedCourses(user.coursesTaught || []);
      if (user.role === 'student') setSelectedCourses(user.currentCourses ? user.currentCourses.map(c => c.courseName) : []);
      setShowEditDropdown(false);
    } else {
      setError('User not found');
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedData = { ...editingUser };
      if (editingUser.role === 'teacher') updatedData.coursesTaught = selectedCourses;
      if (editingUser.role === 'student') updatedData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null })); // Reset grades for simplicity
      const savedUser = await updateUser(editingUser._id, updatedData);
      await syncCourses(savedUser);
      setEditingUser(null);
      setSelectedCourses([]);
      setSearchEmail('');
      setShowEditDropdown(false);
      await loadData();
    } catch (err) {
      console.error('Edit error:', err);
      setError('Failed to edit user.');
    }
  };

  // Sync assignments with Course models (shared function)
  const syncCourses = async (user) => {
    if (user.role === 'teacher') {
      await Promise.all(user.coursesTaught.map(async (name) => {
        const course = courses.find(c => c.name === name);
        if (course) await updateCourse(course._id, { teacher: user.email }); // Use email as per seed update
      }));
    } else if (user.role === 'student') {
      await Promise.all(user.currentCourses.map(async ({ courseName }) => {
        const course = courses.find(c => c.name === courseName);
        if (course && !course.enrolledStudents.includes(user.email)) {
          await updateCourse(course._id, { enrolledStudents: [...course.enrolledStudents, user.email] });
        }
      }));
    }
  };

  // Filter users by role for tables
  const admins = users.filter(u => u.role === 'admin');
  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');

  // Get logged in user for header
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  return (
    <>
      <Sidebar />
      <Header user={loggedInUser} />
      <div className="main-content">
        <h1 style={{ textAlign: 'right', marginRight: 0 }}>Admin Dashboard</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Admins Cards */}
        <h2>Admins</h2>
        <div className="horizontal-flex">
          {admins.map(u => (
            <div className="card" key={u._id}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{u.fullName}</div>
              <div style={{ color: 'var(--text-grey)' }}>{u.email}</div>
              <button className="button-black" onClick={() => handleDelete(u._id)} style={{ marginTop: 12 }}>Delete</button>
            </div>
          ))}
        </div>

        {/* Teachers Table (in card) */}
        <h2>Teachers</h2>
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sidebar-grey)' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Courses</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '10px' }}>{u.fullName}</td>
                  <td style={{ padding: '10px', color: 'var(--text-grey)' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.coursesTaught?.join(', ') || 'None'}</td>
                  <td style={{ padding: '10px' }}><button className="button-black" onClick={() => handleDelete(u._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Students Table (in card) */}
        <h2>Students</h2>
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sidebar-grey)' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Major</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Batch</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Courses</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '10px' }}>{u.fullName}</td>
                  <td style={{ padding: '10px', color: 'var(--text-grey)' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.major}</td>
                  <td style={{ padding: '10px' }}>{u.batch}</td>
                  <td style={{ padding: '10px' }}>{u.currentCourses?.map(c => c.courseName).join(', ') || 'None'}</td>
                  <td style={{ padding: '10px' }}><button className="button-black" onClick={() => handleDelete(u._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Admin Form */}
        <div className="card" style={{ marginTop: 32 }}>
          <h2>Add Admin</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(adminForm, [], 'admin'); }}>
            <label htmlFor="admin-fullName">Full Name</label>
            <input id="admin-fullName" name="fullName" value={adminForm.fullName} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Enter full name" required />
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" value={adminForm.email} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Enter email address" required />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" value={adminForm.password} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Enter password" required />
            <button className="button-primary" type="submit">Add Admin</button>
          </form>
        </div>

        {/* Add Teacher Form */}
        <div className="card" style={{ marginTop: 32 }}>
          <h2>Add Teacher</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(teacherForm, teacherCourses, 'teacher'); }}>
            <label htmlFor="teacher-fullName">Full Name</label>
            <input id="teacher-fullName" name="fullName" value={teacherForm.fullName} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Enter full name" required />
            <label htmlFor="teacher-email">Email</label>
            <input id="teacher-email" name="email" value={teacherForm.email} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Enter email address" required />
            <label htmlFor="teacher-password">Password</label>
            <input id="teacher-password" name="password" type="password" value={teacherForm.password} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Enter password" required />
            <label>Assign Courses</label>
            <button className="button-black" type="button" onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}>
              {showTeacherDropdown ? 'Hide Courses' : 'Select Courses'}
            </button>
            {showTeacherDropdown && (
              <div className="dropdown">
                {courses.map(c => (
                  <label key={c._id} style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={teacherCourses.includes(c.name)}
                      onChange={() => handleCourseCheckbox(c.name, 'teacher', teacherCourses, setTeacherCourses)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
            <button className="button-primary" type="submit">Add Teacher</button>
          </form>
        </div>

        {/* Add Student Form */}
        <div className="card" style={{ marginTop: 32 }}>
          <h2>Add Student</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(studentForm, studentCourses, 'student'); }}>
            <label htmlFor="student-fullName">Full Name</label>
            <input id="student-fullName" name="fullName" value={studentForm.fullName} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Enter full name" required />
            <label htmlFor="student-email">Email</label>
            <input id="student-email" name="email" value={studentForm.email} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Enter email address" required />
            <label htmlFor="student-password">Password</label>
            <input id="student-password" name="password" type="password" value={studentForm.password} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Enter password" required />
            <label htmlFor="student-major">Major</label>
            <input id="student-major" name="major" value={studentForm.major} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Major (e.g. Computer Science)" required />
            <label htmlFor="student-batch">Batch</label>
            <input id="student-batch" name="batch" value={studentForm.batch} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Batch (e.g., 2025)" required />
            <label htmlFor="student-currentYear">Current Year</label>
            <input id="student-currentYear" name="currentYear" type="number" value={studentForm.currentYear} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Current Year" required />
            <label htmlFor="student-currentSemester">Current Semester</label>
            <input id="student-currentSemester" name="currentSemester" value={studentForm.currentSemester} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Current Semester" required />
            <label>Assign Courses</label>
            <button className="button-black" type="button" onClick={() => setShowStudentDropdown(!showStudentDropdown)}>
              {showStudentDropdown ? 'Hide Courses' : 'Select Courses'}
            </button>
            {showStudentDropdown && (
              <div className="dropdown">
                {courses.map(c => (
                  <label key={c._id} style={{ display: 'block', marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={studentCourses.includes(c.name)}
                      onChange={() => handleCourseCheckbox(c.name, 'student', studentCourses, setStudentCourses)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
            <button className="button-primary" type="submit">Add Student</button>
          </form>
        </div>

        {/* Edit User Form */}
        <div className="card" style={{ marginTop: 32 }}>
          <h2>Edit User (Search by Email)</h2>
          <label htmlFor="edit-email">User Email</label>
          <input id="edit-email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Enter user email to search" />
          <button className="button-black" onClick={handleSearch}>Search</button>
          {editingUser && (
            <form onSubmit={handleEditSubmit}>
              <label htmlFor="edit-fullName">Full Name</label>
              <input id="edit-fullName" name="fullName" value={editingUser.fullName} onChange={(e) => setEditingUser(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" required />
              <label htmlFor="edit-email-field">Email</label>
              <input id="edit-email-field" name="email" value={editingUser.email} onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" required />
              <label htmlFor="edit-password">Password</label>
              <input id="edit-password" name="password" type="password" value={editingUser.password} onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))} placeholder="Password" required />
              {editingUser.role === 'student' && (
                <>
                  <label htmlFor="edit-major">Major</label>
                  <input id="edit-major" name="major" value={editingUser.major || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, major: e.target.value }))} placeholder="Major" />
                  <label htmlFor="edit-batch">Batch</label>
                  <input id="edit-batch" name="batch" value={editingUser.batch || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, batch: e.target.value }))} placeholder="Batch" />
                  <label htmlFor="edit-currentYear">Current Year</label>
                  <input id="edit-currentYear" name="currentYear" type="number" value={editingUser.currentYear || 1} onChange={(e) => setEditingUser(prev => ({ ...prev, currentYear: parseInt(e.target.value) }))} placeholder="Current Year" />
                  <label htmlFor="edit-currentSemester">Current Semester</label>
                  <input id="edit-currentSemester" name="currentSemester" value={editingUser.currentSemester || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, currentSemester: e.target.value }))} placeholder="Current Semester" />
                </>
              )}
              {(editingUser.role === 'teacher' || editingUser.role === 'student') && (
                <>
                  <label>Assign Courses</label>
                  <button className="button-black" type="button" onClick={() => setShowEditDropdown(!showEditDropdown)}>
                    {showEditDropdown ? 'Hide Courses' : 'Select Courses'}
                  </button>
                  {showEditDropdown && (
                    <div className="dropdown">
                      {courses.map(c => (
                        <label key={c._id} style={{ display: 'block', marginBottom: 4 }}>
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(c.name)}
                            onChange={() => handleCourseCheckbox(c.name, editingUser.role, selectedCourses, setSelectedCourses)}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button className="button-primary" type="submit">Save Edit</button>
              <button className="button-black" type="button" onClick={() => setEditingUser(null)}>Cancel</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;