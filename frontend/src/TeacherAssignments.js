
// Teacher assignments page for managing assignments and student submissions
// - Allows teachers to create assignments with file uploads (materials)
// - View/delete assignments, view student submissions, and download files
// - All actions require teacher role (enforced by backend)
// - File validation and secure download handled by backend

import React, { useState, useEffect } from 'react';
import { fetchAssignments, createAssignment, deleteAssignment, fetchAssignmentSubmissions, downloadTeacherFile, downloadSubmissionFile } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const TeacherAssignments = () => {  
  const [assignments, setAssignments] = useState([]);  
  const [form, setForm] = useState({ title: '', course: '', description: '', deadline: '', maxGrade: '' });  
  const [files, setFiles] = useState([]);  // Added: For teacher file uploads  
  const [selectedAssignment, setSelectedAssignment] = useState(null);  // For viewing submissions  
  const [submissions, setSubmissions] = useState([]);  // Student submissions for selected assignment  
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments for teacher on mount  
  useEffect(() => {  
    fetchAssignments({ teacher: user._id })  
      .then(setAssignments)  
      .catch(console.error);  
  }, [user._id]);

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
      setForm({ title: '', course: '', description: '', deadline: '', maxGrade: '' });  
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
    <>
      <Sidebar />
      <Header user={user} />
      <div className="main-content">
        <h1>Assignments</h1>
        <div className="card" style={{ maxWidth: 600, marginBottom: 40 }}>
          <h2 style={{ marginTop: 0 }}>Create Assignment</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Assignment title"
              required
            />
            <label htmlFor="course">Course</label>
            <select id="course" name="course" value={form.course} onChange={handleChange} required>
              <option value="">Select Course</option>
              {user.coursesTaught?.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Assignment details" required />
            <label htmlFor="deadline">Deadline</label>
            <input id="deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
            <label htmlFor="maxGrade">Max Grade</label>
            <input
              id="maxGrade"
              type="number"
              name="maxGrade"
              value={form.maxGrade}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              required
            />
            <label htmlFor="teacher-files">Upload Materials</label>
            <input id="teacher-files" type="file" multiple onChange={handleFileChange} />
            <button className="button-primary" type="submit">Create Assignment</button>
          </form>
        </div>
        <h2 style={{ marginTop: 0 }}>Assigned Work</h2>
        <div className="horizontal-flex">
          {assignments.map(a => (
            <div key={a._id} className="card" style={{ minWidth: 320, maxWidth: 400 }}>
              <h3 style={{ marginTop: 0 }}>{a.course}</h3>
              <p style={{ color: 'var(--text-grey)', fontWeight: 500 }}>{a.title}</p>
              <p>{a.description}</p>
              <p style={{ fontSize: '0.95rem', color: '#888' }}>Deadline: {new Date(a.deadline).toLocaleDateString()}</p>
              {a.teacherFiles?.length > 0 && (
                <>
                  <h4 style={{ marginBottom: 4 }}>Materials:</h4>
                  <ul style={{ paddingLeft: 18 }}>
                    {a.teacherFiles.map((file, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>
                        <button
                          className="button-black"
                          style={{ padding: '4px 10px', fontSize: '0.95rem' }}
                          type="button"
                          onClick={async () => {
                            try {
                              const blob = await downloadTeacherFile(a._id, file);
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = file;
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              alert('Download failed');
                            }
                          }}
                        >
                          {file}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="button-black" onClick={() => handleDelete(a._id)}>Delete</button>
                <button className="button-primary" onClick={() => handleViewSubmissions(a._id)}>
                  {selectedAssignment === a._id ? 'Hide Submissions' : 'View Submissions'}
                </button>
              </div>
              {selectedAssignment === a._id && (
                <div style={{ marginTop: 18 }}>
                  <h4 style={{ marginBottom: 4 }}>Student Submissions:</h4>
                  {submissions.length === 0 ? <p style={{ color: '#888' }}>No submissions yet.</p> : (
                    submissions.map(sub => (
                      <div key={sub._id} className="card" style={{ marginTop: '1rem', background: '#f8fafd' }}>
                        <p style={{ fontWeight: 500 }}>Student: {sub.student.fullName} ({sub.student.email})</p>
                        <p style={{ fontSize: '0.95rem', color: '#888' }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                        <ul style={{ paddingLeft: 18 }}>
                          {sub.files.map((file, idx) => (
                            <li key={idx} style={{ marginBottom: 2 }}>
                              <button
                                className="button-black"
                                style={{ padding: '4px 10px', fontSize: '0.95rem' }}
                                type="button"
                                onClick={async () => {
                                  try {
                                    const blob = await downloadSubmissionFile(a._id, sub._id, file);
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = file;
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                  } catch (err) {
                                    alert('Download failed');
                                  }
                                }}
                              >
                                {file}
                              </button>
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
    </>
  );
};

export default TeacherAssignments;  