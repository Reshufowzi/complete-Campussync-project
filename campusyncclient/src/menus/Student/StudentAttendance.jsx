import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

// Data for the Monthly Trend Graph (Green)
const trendData = [
  { name: 'Sep', attendance: 95 },
  { name: 'Oct', attendance: 90 },
  { name: 'Nov', attendance: 88 },
  { name: 'Dec', attendance: 85 },
  { name: 'Jan', attendance: 92 },
  { name: 'Feb', attendance: 89 },
];

// Data for the Circular Progress (92%)
const circularData = [
  { name: 'Attended', value: 92 },
  { name: 'Remaining', value: 8 },
];
const COLORS = ['#2563eb', '#e5e7eb']; // Blue and Light Grey

const Attendance = () => {
  return (
    <div className="container-fluid p-4 bg-light" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold fs-4">Welcome back, Arun 👋</h2>
        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '35px', height: '35px' }}>A</div>
      </div>

      <h3 className="fw-bold mb-4">Attendance Tracker</h3>

      <div className="row g-4 mb-4">
        {/* Overall Attendance (Circular) */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="text-muted mb-4">Overall Attendance</h6>
            <div className="d-flex flex-column align-items-center justify-content-center position-relative" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={circularData}
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {circularData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="position-absolute text-center">
                <h2 className="fw-bold mb-0">92%</h2>
                <small className="text-muted">Overall</small>
              </div>
            </div>
            {/* Legend Bar */}
            <div className="mt-4 p-2 bg-success bg-opacity-10 text-success rounded text-center small">
              <span className="me-2">✅</span> Above minimum requirement (75%)
            </div>
          </div>
        </div>

        {/* Monthly Trend (Line Graph) */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="text-muted mb-4">Monthly Trend</h6>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Attendance */}
      <div className="card border-0 shadow-sm p-4">
        <h6 className="text-muted mb-4">Subject-wise Attendance</h6>

        {/* Data Structures */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Data Structures</span>
            <span className="text-muted small">38/42 (90%)</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div className="progress-bar bg-primary" style={{ width: '90%' }}></div>
          </div>
        </div>

        {/* Database Systems */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Database Systems</span>
            <span className="text-muted small">35/40 (88%)</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div className="progress-bar bg-primary" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Computer Networks */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Computer Networks</span>
            <span className="text-muted small">30/38 (79%)</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div className="progress-bar bg-primary" style={{ width: '79%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;