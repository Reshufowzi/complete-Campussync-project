import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Base data for the Attendance Trend
const baseData = [
  { name: 'Sep', attendance: 95 },
  { name: 'Oct', attendance: 90 },
  { name: 'Nov', attendance: 88 },
  { name: 'Dec', attendance: 85 },
  { name: 'Jan', attendance: 92 },
  { name: 'Feb', attendance: 100 },
];

const StudentDashboard = () => {
  const [user, setUser] = useState({ reg: '9123...001', name: 'Arun Kumar' });
  const [announcements, setAnnouncements] = useState([]);
  const [chartData, setChartData] = useState(baseData);
  const [currentAttendance, setCurrentAttendance] = useState(100);
  const [leavesLeft, setLeavesLeft] = useState(10);
  const [currentCgpa, setCurrentCgpa] = useState(0.00);

  // File Manager State
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Get user from local storage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const activeUser = storedUser || { reg: '9123...001', name: 'Arun Kumar' };
      setUser(activeUser);

      // 1. Fetch announcements
      try {
        const annRes = await axios.get("http://localhost:5000/getannouncements");
        setAnnouncements(annRes.data);
      } catch (e) {
        console.error("Announcements failed:", e);
      }

      // 2. Fetch leaves
      try {
        const leavesRes = await axios.get("http://localhost:5000/getleaves");
        const myLeaves = leavesRes.data.filter(l => l.name === activeUser.name && l.status === "Approved");
        setLeavesLeft(10 - myLeaves.length);
        const attendanceDrop = myLeaves.length * 4; 
        const newAtt = 100 - attendanceDrop;
        setCurrentAttendance(newAtt);
        
        let updatedChart = [...baseData];
        updatedChart[5] = { name: 'Feb', attendance: newAtt };
        setChartData(updatedChart);
      } catch (e) {
        console.error("Leaves failed:", e);
      }

      // 3. Fetch CGPA
      try {
        const cgpaRes = await axios.get("http://localhost:5000/getcgpa");
        const myCgpas = cgpaRes.data.filter(c => c.name === activeUser.name);
        if (myCgpas.length > 0) {
          setCurrentCgpa(myCgpas[myCgpas.length - 1].gpa);
        }
      } catch (e) {
        console.error("CGPA failed:", e);
      }

      // 4. Fetch User Files
      fetchFiles(activeUser.reg);
    };
    fetchDashboardData();
  }, []);

  const fetchFiles = async (reg) => {
    try {
      const res = await axios.get(`http://localhost:5000/files/${reg}`);
      setFiles(res.data);
    } catch (e) {
      console.error("Failed to fetch files", e);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Please select a file to upload");
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('user_identifier', user.reg);

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSelectedFile(null); // Clear input manually
      document.getElementById('fileInput').value = '';
      fetchFiles(user.reg); // Refresh list
    } catch (e) {
      console.error("Failed to upload file", e);
      alert("Error uploading file");
    }
  };

  const handleDeleteFile = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/files/${id}`);
      fetchFiles(user.reg);
    } catch (e) {
      console.error("Failed to delete file", e);
    }
  };

  return (
    <div className="container-fluid p-4 bg-light" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Welcome back, {user.name.split(' ')[0]} 👋</h2>
        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-white bg-primary p-3">
            <small>Attendance</small>
            <h3 className="fw-bold">{currentAttendance}%</h3>
            <small className="opacity-75">Live Tracking</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <small className="text-muted">CGPA</small>
            <h3 className="fw-bold text-dark">{currentCgpa.toFixed(2)}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <small className="text-muted">Leaves Left</small>
            <h3 className="fw-bold text-dark">{leavesLeft}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm text-white bg-success p-3">
            <small>Performance</small>
            <h3 className="fw-bold">Good</h3>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4">
        <Link to="/student/applyleave">
          <button className="btn btn-primary me-2 px-4 shadow-sm">Apply Leave</button>
        </Link>
        <Link to="/student/applyod">
          <button className="btn btn-outline-secondary me-2 px-4 shadow-sm">Apply OD</button>
        </Link>
        <Link to="/student/issues">
          <button className="btn btn-outline-danger px-4 shadow-sm">Report Issue</button>
        </Link>
      </div>

      {/* Bottom Row: Chart and Announcements */}
      <div className="row g-4 mb-4">
        {/* Attendance Trend Chart */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="mb-4">Attendance Trend</h5>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#0d6efd" fill="#e7f0ff" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="mb-4">Announcements</h5>
            <div className="list-group list-group-flush" style={{ overflowY: 'auto', maxHeight: '300px' }}>
              {announcements.length > 0 ? (
                announcements.map((ann, i) => (
                  <div key={i} className="list-group-item border-0 px-0 mb-3 bg-light rounded p-3">
                    <h6 className="fw-bold mb-1">{ann.title}</h6>
                    <small className="text-muted d-block mb-1">{ann.author} ({ann.role}) • {new Date(ann.created_at).toLocaleDateString()}</small>
                    <p className="small mb-0 text-secondary">{ann.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted p-4">No recent announcements 🎉</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Manager Section */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="mb-4">My Documents</h5>
            
            <div className="d-flex align-items-center mb-4 bg-light p-3 rounded">
              <input 
                type="file" 
                id="fileInput"
                className="form-control me-3" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <button 
                className="btn btn-primary px-4 fw-bold shadow-sm flex-shrink-0"
                onClick={handleFileUpload}
              >
                Upload File ↑
              </button>
            </div>

            {files.length > 0 ? (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Filename</th>
                      <th>Uploaded On</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map(file => (
                      <tr key={file.id}>
                        <td className="fw-medium text-primary">
                           📁 {file.filename}
                        </td>
                        <td className="text-muted small">
                          {new Date(file.uploaded_at).toLocaleString()}
                        </td>
                        <td className="text-end">
                          <a 
                            href={`http://localhost:5000/uploads/${file.filepath}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary me-2"
                          >
                            View
                          </a>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center py-3">No documents uploaded yet.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;