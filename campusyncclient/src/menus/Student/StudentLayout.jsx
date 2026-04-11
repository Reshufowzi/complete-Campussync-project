import React from 'react'
import { Routes, Route } from "react-router-dom";
import StudentHeader from '../../componets/Header/Headersec';
import StudentIssues from './StudentIssues';
import StudentAttendance from './StudentAttendance';
import StudentCgpa from './StudentCgpa';
import StudentDashboard from './StudentDashboard';
import './Studentt.css'
import StudentLeave from './StudentLeave';
import Studentlogin from './Studentlogin';
import StudentOd from './StudentOd';
export default function StudentLayout() {
  // Define a constant width for your sidebar/header
  const sidebarWidth = "250px"; 

  return (
    <div style={{ display: "flex" }}>
      
      {/* 1. FIXED HEADER/SIDEBAR */}
      <div style={{ 
        position: "fixed", 
        top: 0, 
        left: 0,
        width: sidebarWidth, // Keep it a set width
        height: "100vh",
        zIndex: 1000,
        backgroundColor: "#fff", // Adjust based on your theme
        borderRight: "1px solid #dee2e6" // Optional: adds a clean line
      }}>
        <StudentHeader />
      </div>

      {/* 2. SCROLLABLE CONTENT AREA */}
      <div className='flex-grow-1' style={{ 
        marginLeft: sidebarWidth, // IMPORTANT: Pushes content so it doesn't hide behind the header
        minHeight: '100vh',
        padding: "40px",
        width: "100%" 
      }}>
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path='studentlogin' element={<Studentlogin/>}/>
          <Route path='dashboard' element={<StudentDashboard/>}/>
          <Route path='applyleave' element={<StudentLeave/>}/>
          <Route path='applyod' element={<StudentOd/>}/>
          <Route path='issues' element={<StudentIssues/>}/>
          <Route path='cgpa' element={<StudentCgpa/>}/>
          <Route path='attendance' element={<StudentAttendance/>}/>
        </Routes>
      </div>
    </div>
  )
}