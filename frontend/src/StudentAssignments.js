// Student assignments page: View assignments for enrolled courses as cards (read-only)
// Updated: Display teacher file download links
// New: Allow file uploads for submissions; display own submitted files as download links
// Fix: Use BACKEND_URL for download links to point to backend server
// Updated: Use fetchMySubmissions instead of fetchSubmissions

import React, { useState, useEffect } from 'react';
import { fetchAssignments, submitAssignment, fetchMySubmissions, downloadTeacherFile, downloadSubmissionFile } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const StudentAssignments = () => {  
  const [assignments, setAssignments] = useState([]);  
  const [submissions, setSubmissions] = useState([]);  // Student's own submissions  
  const [files, setFiles] = useState({});  // Files per assignment ID for upload  
  const user = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  // Load assignments and submissions on mount  
  useEffect(() => {  
    const courses = user.currentCourses?.map(c => c.courseName) || [];  
    if (courses.length > 0) {  
      fetchAssignments({ courses: courses.join(',') })  
        .then(setAssignments)  
        .catch(console.error);  
      fetchMySubmissions()  // Fetch own submissions (updated to use new endpoint)
        .then(setSubmissions)  
        .catch(console.error);  
    }  
  }, [user.currentCourses, user._id]);

  // Handle file change for a specific assignment  
  const handleFileChange = (assignmentId, e) => {  
    setFiles(prev => ({ ...prev, [assignmentId]: Array.from(e.target.files) }));  
  };

  // Handle submit for a specific assignment  
  const handleSubmit = async (assignmentId) => {  
    try {  
      await submitAssignment(assignmentId, files[assignmentId] || []);  // Updated: don't pass student ID (uses JWT)
      // Refresh submissions after submit  
      const updatedSubs = await fetchMySubmissions();  // Updated to use new endpoint
      setSubmissions(updatedSubs);  
      setFiles(prev => ({ ...prev, [assignmentId]: [] }));  // Clear files  
    } catch (err) {  
      console.error('Submit error:', err);  
    }  
  };

  return (
    <>
      <Sidebar />
      <Header user={user} />
      <div className="main-content">
        <h1>Assignments</h1>
        <div className="horizontal-flex">
          {assignments.map(a => {
            const mySubmission = submissions.find(s => s.assignment?._id === a._id);
            return (
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
                <h4 style={{ marginBottom: 4 }}>Your Submission:</h4>
                {mySubmission ? (
                  <>
                    <p style={{ fontSize: '0.95rem', color: '#888' }}>Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</p>
                    <ul style={{ paddingLeft: 18 }}>
                      {mySubmission.files.map((file, idx) => (
                        <li key={idx} style={{ marginBottom: 2 }}>
                          <button
                            className="button-black"
                            style={{ padding: '4px 10px', fontSize: '0.95rem' }}
                            type="button"
                            onClick={async () => {
                              try {
                                const blob = await downloadSubmissionFile(a._id, mySubmission._id, file);
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
                ) : (
                  <>
                    <input type="file" multiple onChange={(e) => handleFileChange(a._id, e)} />
                    <button className="button-primary" style={{ marginTop: 8 }} onClick={() => handleSubmit(a._id)}>Submit</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default StudentAssignments;  