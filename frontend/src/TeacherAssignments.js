// Teacher assignments page: Create assignments with file uploads, view/delete, view student submissions
// Updated: Added file upload during creation (teacher materials)
// New: Display teacher file download links; button to view student submissions with download links
// Fix: Use BACKEND_URL for download links to point to backend server

import React, { useState, useEffect } from 'react';  
import { fetchAssignments, createAssignment, deleteAssignment, fetchAssignmentSubmissions, BACKEND_URL } from './api';  // Updated: Import BACKEND_URL
import Navbar from './Navbar';

const TeacherAssignments = () => {  
  const [assignments, setAssignments] = useState([]);  
  const [form, setForm] = useState({ course: '', description: '', deadline: '' });  
  const [files, setFiles] = useState([]);  // Added: For teacher file uploads  
  const [selectedAssignment, setSelectedAssignment] = useState(null);  // For viewing submissions  
  const [submissions, setSubmissions] = useState([]);  // Student submissions for selected assignment  
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments for teacher on mount  
  useEffect(() => {  
    fetchAssignments({ teacher: user._id })  
      .then(setAssignments)  
      .catch(console.error);  
  }, []);

  // Handle text input changes  
  const handleChange = (e) => {  
    setForm({ ...form, [e.target.name]: e.target.value });  
  };

  // Handle file input changes (multiple files)  
  const handleFileChange = (e) => {  
    setFiles(Array.from(e.target.files));  // Convert FileList to array  
  };

  // Handle form submit to create assignment with files  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    try {  
      const newAssignment = await createAssignment({ ...form, teacher: user._id }, files);  
      setAssignments([...assignments, newAssignment]);  
      setForm({ course: '', description: '', deadline: '' });  
      setFiles([]);  // Clear files  
    } catch (err) {  
      console.error('Create assignment error:', err);  
    }  
  };

  // Handle delete assignment  
  const handleDelete = async (id) => {  
    if (window.confirm('Delete assignment?')) {  
      try {  
        await deleteAssignment(id);  
        setAssignments(assignments.filter(a => a._id !== id));  
      } catch (err) {  
        console.error('Delete assignment error:', err);  
      }  
    }  
  };

  // Handle viewing submissions for an assignment  
  const handleViewSubmissions = async (id) => {  
    if (selectedAssignment === id) {  
      setSelectedAssignment(null);  // Toggle off  
      setSubmissions([]);  
    } else {  
      try {  
        const subs = await fetchAssignmentSubmissions(id);  
        setSubmissions(subs);  
        setSelectedAssignment(id);  
      } catch (err) {  
        console.error('Fetch submissions error:', err);  
      }  
    }  
  };

  return (  
    <div>  
      <Navbar />  
      <h1>Assignments</h1>  
      <form onSubmit={handleSubmit}>  
        <select name="course" value={form.course} onChange={handleChange} required>  
          <option value="">Select Course</option>  
          {user.coursesTaught?.map(c => (  
            <option key={c} value={c}>{c}</option>  
          ))}  
        </select>  
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" required />  
        <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />  
        <input type="file" multiple onChange={handleFileChange} />  {/* Added: File upload input */}  
        <button type="submit">Create Assignment</button>  
      </form>  
      <h3>Assigned work</h3>  
      <div className="horizontal-flex">  
        {assignments.map(a => (  
          <div key={a._id} className="card">  
            <h3>{a.course}</h3>  
            <p>{a.description}</p>  
            <p>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>  
            {/* Display teacher uploaded files as download links */}  
            {a.teacherFiles?.length > 0 && (  
              <>  
                <h4>Materials:</h4>  
                <ul>  
                  {a.teacherFiles.map((file, idx) => (  
                    <li key={idx}>  
                      <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                    </li>  
                  ))}  
                </ul>  
              </>  
            )}  
            <button onClick={() => handleDelete(a._id)}>Delete</button>  
            <button onClick={() => handleViewSubmissions(a._id)}>View Submissions</button>  
            {/* Show submissions if selected */}  
            {selectedAssignment === a._id && (  
              <div>  
                <h4>Student Submissions:</h4>  
                {submissions.length === 0 ? <p>No submissions yet.</p> : (  
                  submissions.map(sub => (  
                    <div key={sub._id} className="card" style={{ marginTop: '1rem' }}>  
                      <p>Student: {sub.student.fullName} ({sub.student.email})</p>  
                      <p>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>  
                      <ul>  
                        {sub.files.map((file, idx) => (  
                          <li key={idx}>  
                            <a href={`${BACKEND_URL}/uploads/${file}`} download>{file}</a>  {/* Fix: Use BACKEND_URL */}  
                          </li>  
                        ))}  
                      </ul>  
                    </div>  
                  ))  
                )}  
              </div>  
            )}  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
};

export default TeacherAssignments;  