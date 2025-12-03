// Admin dashboard: 3 separate tables for user types, dedicated add forms per role, search-based edit form
// Updated for UI enhancements: Tables for admins/teachers/students, role-specific add forms (student includes major/batch/year/sem)
// Course assignments for teacher/student adds/edits, with max limits
// Syncs User and Course models on save; uses separate states for each add form
// Clean structure: Handlers reused where possible, good comments for readability
// Fixed: Moved loadData outside useEffect to make it accessible in handlers (avoids no-undef error)

import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchCourses, createUser, updateUser, deleteUser, updateCourse } from './api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]); // For edit course selections

  // Dedicated form states
  const [adminForm, setAdminForm] = useState({ email: '', password: '', fullName: '', role: 'admin' });
  const [teacherForm, setTeacherForm] = useState({ email: '', password: '', fullName: '', role: 'teacher' });
  const [teacherCourses, setTeacherCourses] = useState([]); // Separate for teacher add
  const [studentForm, setStudentForm] = useState({
    email: '', password: '', fullName: '', role: 'student',
    major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1'
  });
  const [studentCourses, setStudentCourses] = useState([]); // Separate for student add

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

  // Course select handler (with max check)
  const handleCourseChange = (e, role, setSelected) => {
    const selected = Array.from(e.target.options).filter(opt => opt.selected).map(opt => opt.value);
    const max = role === 'teacher' ? 3 : 5;
    if (selected.length > max) {
      alert(`Max ${max} courses allowed for ${role}s.`);
      return;
    }
    setSelected(selected);
  };

  // Generic add handler (role-specific)
  const handleAdd = async (formData, selectedCourses = [], role) => {
    try {
      let updatedData = { ...formData };
      if (role === 'teacher') updatedData.coursesTaught = selectedCourses;
      if (role === 'student') updatedData.currentCourses = selectedCourses.map(name => ({ courseName: name, grade: null }));
      const savedUser = await createUser(updatedData);
      await syncCourses(savedUser); // Sync with courses
      // Reset forms
      if (role === 'admin') setAdminForm({ email: '', password: '', fullName: '', role: 'admin' });
      if (role === 'teacher') { setTeacherForm({ email: '', password: '', fullName: '', role: 'teacher' }); setTeacherCourses([]); }
      if (role === 'student') { setStudentForm({ email: '', password: '', fullName: '', role: 'student', major: '', batch: '', currentYear: 1, currentSemester: 'Semester 1' }); setStudentCourses([]); }
      await loadData(); // Refetch
    } catch (err) {
      console.error('Add error:', err);
      setError('Failed to add user.');
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

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Admins Table */}
      <h2>Admins</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
        <tbody>
          {admins.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td><td>{u.email}</td>
              <td><button onClick={() => handleDelete(u._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Teachers Table */}
      <h2>Teachers</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Courses</th><th>Actions</th></tr></thead>
        <tbody>
          {teachers.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td><td>{u.email}</td><td>{u.coursesTaught?.join(', ') || 'None'}</td>
              <td><button onClick={() => handleDelete(u._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Students Table */}
      <h2>Students</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Major</th><th>Batch</th><th>Courses</th><th>Actions</th></tr></thead>
        <tbody>
          {students.map(u => (
            <tr key={u._id}>
              <td>{u.fullName}</td><td>{u.email}</td><td>{u.major}</td><td>{u.batch}</td>
              <td>{u.currentCourses?.map(c => c.courseName).join(', ') || 'None'}</td>
              <td><button onClick={() => handleDelete(u._id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Admin Form */}
      <h2>Add Admin</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAdd(adminForm, [], 'admin'); }}>
        <input name="fullName" value={adminForm.fullName} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Full Name" required />
        <input name="email" value={adminForm.email} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Email" required />
        <input name="password" type="password" value={adminForm.password} onChange={(e) => handleInputChange(e, setAdminForm)} placeholder="Password" required />
        <button type="submit">Add Admin</button>
      </form>

      {/* Add Teacher Form */}
      <h2>Add Teacher</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAdd(teacherForm, teacherCourses, 'teacher'); }}>
        <input name="fullName" value={teacherForm.fullName} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Full Name" required />
        <input name="email" value={teacherForm.email} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Email" required />
        <input name="password" type="password" value={teacherForm.password} onChange={(e) => handleInputChange(e, setTeacherForm)} placeholder="Password" required />
        <select multiple value={teacherCourses} onChange={(e) => handleCourseChange(e, 'teacher', setTeacherCourses)} size={5}>
          {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <button type="submit">Add Teacher</button>
      </form>

      {/* Add Student Form */}
      <h2>Add Student</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAdd(studentForm, studentCourses, 'student'); }}>
        <input name="fullName" value={studentForm.fullName} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Full Name" required />
        <input name="email" value={studentForm.email} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Email" required />
        <input name="password" type="password" value={studentForm.password} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Password" required />
        <input name="major" value={studentForm.major} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Major" required />
        <input name="batch" value={studentForm.batch} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Batch (e.g., 2025)" required />
        <input name="currentYear" type="number" value={studentForm.currentYear} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Current Year" required />
        <input name="currentSemester" value={studentForm.currentSemester} onChange={(e) => handleInputChange(e, setStudentForm)} placeholder="Current Semester" required />
        <select multiple value={studentCourses} onChange={(e) => handleCourseChange(e, 'student', setStudentCourses)} size={5}>
          {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <button type="submit">Add Student</button>
      </form>

      {/* Edit User Form */}
      <h2>Edit User (Search by Email)</h2>
      <input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleSearch}>Search</button>
      {editingUser && (
        <form onSubmit={handleEditSubmit}>
          <input name="fullName" value={editingUser.fullName} onChange={(e) => setEditingUser(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full Name" required />
          <input name="email" value={editingUser.email} onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" required />
          <input name="password" type="password" value={editingUser.password} onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))} placeholder="Password" required />
          {editingUser.role === 'student' && (
            <>
              <input name="major" value={editingUser.major || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, major: e.target.value }))} placeholder="Major" />
              <input name="batch" value={editingUser.batch || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, batch: e.target.value }))} placeholder="Batch" />
              <input name="currentYear" type="number" value={editingUser.currentYear || 1} onChange={(e) => setEditingUser(prev => ({ ...prev, currentYear: parseInt(e.target.value) }))} placeholder="Current Year" />
              <input name="currentSemester" value={editingUser.currentSemester || ''} onChange={(e) => setEditingUser(prev => ({ ...prev, currentSemester: e.target.value }))} placeholder="Current Semester" />
            </>
          )}
          {(editingUser.role === 'teacher' || editingUser.role === 'student') && (
            <select multiple value={selectedCourses} onChange={(e) => handleCourseChange(e, editingUser.role, setSelectedCourses)} size={5}>
              {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          )}
          <button type="submit">Save Edit</button>
          <button type="button" onClick={() => setEditingUser(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;