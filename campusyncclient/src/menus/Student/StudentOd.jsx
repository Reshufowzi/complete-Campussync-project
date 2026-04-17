import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentOd() {
  const [odHistory, setOdHistory] = useState([]);
  const [currentAttendance, setCurrentAttendance] = useState(100);

  useEffect(() => {
    fetchHistory();
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getleaves");
      const userOptions = JSON.parse(localStorage.getItem('user')) || { name: 'Arun Kumar' };
      const approvedLeaves = res.data.filter(l => l.name === userOptions.name && l.status === 'Approved');
      setCurrentAttendance(100 - (approvedLeaves.length * 4));
    } catch(e) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getods");
      // Restore displaying full history
      setOdHistory(res.data);
    } catch (error) {
      console.error("Error fetching OD history:", error);
    }
  };
  // Initialize state with empty strings
  const [odType, setOdType] = useState({
    odtype: "",
    oddate: "",
    odreason: ""
  });

  // Handle input changes for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOdType({ ...odType, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!odType.odtype || !odType.oddate || !odType.odreason) {
      alert("Please fill in all fields.");
      return;
    }

  try{
      const userOptions = JSON.parse(localStorage.getItem('user')) || { name: 'Arun Kumar', reg: '9123...001' };
      const payload = {
        ...odType,
        name: userOptions.name,
        reg: userOptions.reg || '9123...001'
      };

      await axios.post("http://localhost:5000/OD", payload);
      alert("On-Duty application submitted successfully! db updated");
      setOdType({ odtype: "", oddate: "", odreason: "" });
      fetchHistory();
      fetchAttendance();
    }  catch(error){
      console.error("Error submitting on-duty application:", error);
      alert("Failed to submit on-duty application. Please try again.");
    }
  };

  return (
    <section className="min-vh-100 py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            
            <h2 className="fw-bold mb-4">Welcome back, {JSON.parse(localStorage.getItem('user'))?.name.split(' ')[0] || 'Student'} 👋</h2>

            {/* Apply for On-Duty Card */}
            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
              <h2 className="h4 fw-bold mb-4">Apply for On-Duty</h2>
              <p className="text-muted mb-4 d-flex align-items-center gap-3">
                <span>Live Attendance Tracker: <span className={`badge rounded-pill ${currentAttendance >= 85 ? 'bg-success' : currentAttendance >= 75 ? 'bg-warning' : 'bg-danger'}`}>{currentAttendance}%</span></span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Event Type</label>
                    <select 
                      name="odtype" 
                      className="form-select" 
                      onChange={handleChange} 
                      value={odType.odtype}
                    >
                      <option value="">Select event type</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Competition">Competition</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date</label>
                    <input 
                      type="date" 
                      name="oddate" 
                      className="form-control" 
                      onChange={handleChange} 
                      value={odType.oddate} 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Event Details</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Describe the event (e.g., location, objective)..."
                    name="odreason"
                    onChange={handleChange}
                    value={odType.odreason}
                  />
                </div>

                <button type="submit" className="btn btn-primary px-4 py-2 fw-bold shadow-sm">
                  Submit Application
                </button>
              </form>
            </div>

            {/* OD History Card */}
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h3 className="h5 fw-bold mb-3">OD History</h3>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Event</th>
                      <th>Details</th>
                      <th>Date</th>
                      <th>Decision Intel</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map from the dynamic array of previous applications */}
                    {odHistory.map((od, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{od.odtype}</td>
                        <td>{od.odreason}</td>
                        <td>{od.oddate}</td>
                        <td>
                          <div className="small">
                            {od.approval_type && <span className="badge bg-secondary mb-1">{od.approval_type}</span>}
                            {od.approved_by && <div className="text-muted" style={{fontSize: '0.75rem'}}>By: {od.approved_by}</div>}
                            {od.decision_reason && <div className="text-muted" style={{fontSize: '0.75rem', maxWidth: '180px'}}>{od.decision_reason}</div>}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${od.status === 'Approved' ? 'bg-success-subtle text-success border border-success-subtle' : od.status === 'Rejected' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'} px-3 py-2`}>
                            {od.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}