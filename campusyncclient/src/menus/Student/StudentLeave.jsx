import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function StudentLeave(){
  const [leaveType, setLeaveType] = useState({ltype:"", sdata:"", edata:"", lreason:""});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [leavesLeft, setLeavesLeft] = useState(10);
  const [currentAttendance, setCurrentAttendance] = useState(100);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/getleaves");
      // Restore displaying full history in table
      setLeaveHistory(res.data);

      // Filter just for metric tracking
      const userOptions = JSON.parse(localStorage.getItem('user')) || { name: 'Arun Kumar' };
      const myLeaves = res.data.filter(l => l.name === userOptions.name);
      
      const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');
      setLeavesLeft(10 - approvedLeaves.length);
      setCurrentAttendance(100 - (approvedLeaves.length * 4));
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };


  const handleChange =(ldata)=>{
    setLeaveType({...leaveType, [ldata.target.name]: ldata.target.value});
  }

  const handleSubmit = async (ldata)=>{
    ldata.preventDefault();
    if(!leaveType.sdata || !leaveType.edata || !leaveType.lreason) {
      alert("Please fill in all fields.");
      return;
    }
    try{
      const userOptions = JSON.parse(localStorage.getItem('user')) || { name: 'Arun Kumar', reg: '9123...001' };
      const payload = {
        ...leaveType,
        name: userOptions.name,
        reg: userOptions.reg || '9123...001'
      };

      await axios.post("http://localhost:5000/leave", payload);
      alert("Leave application submitted successfully! db updated");
      setLeaveType({ltype:"", sdata:"", edata:"", lreason:""});
      fetchHistory();
    }
    catch(error){
      console.error("Error submitting leave application:", error);
      alert("Failed to submit leave application. Please try again.");
    }
  };
  return (
    <section className=" min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            
            <h2 className="fw-bold mb-4">Welcome back, {JSON.parse(localStorage.getItem('user'))?.name.split(' ')[0] || 'Student'} 👋</h2>

            {/* Apply Leave Card */}
            <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
              <h2 className="h4 fw-bold">Apply for Leave</h2>
              <p className="text-muted mb-4 d-flex align-items-center gap-3">
                <span>Remaining leaves: <span className="badge bg-primary rounded-pill">{leavesLeft}</span></span>
                <span>Live Attendance Tracker: <span className={`badge rounded-pill ${currentAttendance >= 85 ? 'bg-success' : currentAttendance >= 75 ? 'bg-warning' : 'bg-danger'}`}>{currentAttendance}%</span></span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Leave Type</label>
                  <select className="form-select w-50" name='ltype' onChange={handleChange} value={leaveType.ltype}>
                    <option >Select type</option>
                    <option value={"sick"}>Sick Leave</option>
                    <option value={"emeleave"}>Emergency Leave</option>
                  </select>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input type="date" name='sdata' className="form-control" 
                      onChange={handleChange}
                      value={leaveType.sdata} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">End Date</label>
                    <input type="date" name='edata' className="form-control" 
                    onChange={handleChange}
                    value={leaveType.edata} />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Reason</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Explain your reason for leave..."
                    name='lreason'
                    onChange={handleChange}
                    value={leaveType.lreason}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary px-4 py-2 fw-bold">
                  Submit Application
                </button>
              </form>
            </div>

            {/* Leave History Card */}
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h3 className="h5 fw-bold mb-3">Leave History</h3>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Decision Intel</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((leave, idx) => (
                      <tr key={idx}>
                        <td>{leave.ltype}</td>
                        <td>{leave.sdata}</td>
                        <td>{leave.edata}</td>
                        <td>{leave.lreason}</td>
                        <td>
                          <div className="small">
                            {leave.approval_type && <span className="badge bg-secondary mb-1">{leave.approval_type}</span>}
                            {leave.approved_by && <div className="text-muted" style={{fontSize: '0.75rem'}}>By: {leave.approved_by}</div>}
                            {leave.decision_reason && <div className="text-muted" style={{fontSize: '0.75rem', maxWidth: '180px'}}>{leave.decision_reason}</div>}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${leave.status === 'Approved' ? 'bg-success-subtle text-success border border-success-subtle' : leave.status === 'Rejected' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'} px-2 py-1`}>
                            {leave.status}
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